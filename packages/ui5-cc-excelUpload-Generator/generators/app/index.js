const Generator = require("yeoman-generator"),
	fileaccess = require("../../helpers/fileaccess"),
	util = require("../utils");
path = require("path");
glob = require("glob");

module.exports = class extends Generator {
	static displayName = "Enable the UI5 Excel Upload Custom Control";

	async prompting() {
		const data = this.config.getAll();
		const modules = this.config.get("uimodules") || [];
		const manifesJson = fileaccess.getJSON("/webapp/manifest.json");

		const deploymentQuestion = await this.prompt({
			type: "list",
			name: "deploymentType",
			message: "What kind of Deployment to you use?",
			choices: [
				{ name: "In-App Deployment", value: "inAppDeployment" },
				{ name: "Central Deployment", value: "centralDeployment" }
			]
		});
		const questionTemplate = await this.prompt({
			type: "list",
			name: "templateType",
			message: "On which page would you like to add Excel Upload?",
			choices: [
				{ name: "Object Page", value: "sap.fe.templates.ObjectPage" },
				{ name: "List Report", value: "sap.fe.templates.ListReport" }
			]
		});
		const entitySets = util.getUniqueEntitySetValues(manifesJson, questionTemplate.templateType);
		const questionEntitySet = await this.prompt([
			{
				type: "list",
				name: "entitySet",
				message: "Which entity Set?",
				choices: entitySets
			}
		]);
		const manifestTargets = util.findEntitySetValue(
			manifesJson,
			questionEntitySet.entitySet,
			questionTemplate.templateType
		);

		var aPrompt = [
			{
				type: "input",
				name: "buttonText",
				message: "Button Text?",
				default: "Excel Upload"
			}
		];

		return this.prompt(aPrompt).then((answers) => {
			this.options.oneTimeConfig = this.config.getAll();
			this.options.oneTimeConfig.buttonText = answers.buttonText;
			this.options.oneTimeConfig.target = manifestTargets.id;
			this.options.oneTimeConfig.deploymentType = deploymentQuestion.deploymentType;
			this.options.oneTimeConfig.namespace = manifesJson["sap.app"].id;
		});
	}

	async writing() {
		const npmLatestVersionPromise = util.getLatestVersion();
		const oConfig = this.config.getAll();
		const buttonText = this.options.oneTimeConfig.buttonText;
		const target = this.options.oneTimeConfig.target;
		const sComponentName = this.options.oneTimeConfig.componentName;
		const sComponentData = this.options.oneTimeConfig.componentData || {};
		const sLazy = this.options.oneTimeConfig.lazy;
		const sModuleName = this.options.oneTimeConfig.modulename;
		const deploymentType = this.options.oneTimeConfig.deploymentType;
		const namespaceUI5 = this.options.oneTimeConfig.namespace;
		const namespaceUI5ObjectPage = `${namespaceUI5}.ext.ObjectPageExtController.openExcelUploadDialog`;

		this.sourceRoot(path.join(__dirname, "templates"));
		glob.sync("**", {
			cwd: this.sourceRoot(),
			nodir: true
		}).forEach((file) => {
			const sOrigin = this.templatePath(file);
			const sTarget = this.destinationPath(file.replace(/^_/, "").replace(/\/_/, "/"));

			this.fs.copyTpl(sOrigin, sTarget, oConfig);
		});

		await fileaccess.manipulateJSON.call(this, "/webapp/manifest.json", {
			"sap.ui5": {
				routing: {
					targets: {
						[target]: {
							options: {
								settings: {
									content: {
										header: {
											actions: {
												excelUpload: {
													id: "excelUploadButton",
													text: buttonText,
													enabled: "{ui>/isEditable}",
													press: namespaceUI5ObjectPage,
													requiresSelection: false
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
		const npmLatestVersion = await npmLatestVersionPromise;
		const npmLatestVersionUnderscore = npmLatestVersion.replaceAll(".", "_");
		const namespace = `cc.excelUpload.v${npmLatestVersionUnderscore}`;

		if (deploymentType === "inAppDeployment") {
			await fileaccess.manipulateJSON.call(this, "/package.json", {
				dependencies: {
					"ui5-cc-excelupload": npmLatestVersion
				}
			});

			// TODO: is added twice to array if executed twice
			// TODO: check for UI5 CLI if neccesary
			await fileaccess.manipulateJSON.call(this, "/package.json", {
				ui5: {
					dependencies: ["ui5-cc-excelupload"]
				}
			});

			await fileaccess.manipulateJSON.call(this, "/webapp/manifest.json", {
				"sap.ui5": {
					resourceRoots: {
						[namespace]: "./thirdparty/customControl/excelUpload/v" + npmLatestVersionUnderscore
					}
				}
			});
		}
		await fileaccess.manipulateJSON.call(this, "/webapp/manifest.json", {
			"sap.ui5": {
				componentUsages: {
					excelUpload: {
						name: namespace
					}
				}
			}
		});
	}

	end() {
		if (this.options.oneTimeConfig.deploymentType === "inAppDeployment") {
			this.spawnCommandSync("npm", ["install"], {
				cwd: this.destinationPath()
			});
		}
	}
};
