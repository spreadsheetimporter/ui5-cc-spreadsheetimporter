const assert = require("yeoman-assert");
const path = require("path");
// const fs = require('fs');
const helpers = require("yeoman-test");

const IsCIRun = process.env.CI;

function newViewControllerPairTest() {
	describe("Create a view/controller pair", function () {
		it("should run the subgenerator", function () {
			return helpers.run(path.join(__dirname, "../generators/newview")).withPrompts({
				viewname: "NewView",
				createcontroller: true,
				addPO: false,
				projectname: "todo",
				namespaceUI5: "sap.ui.demo",
				viewtype: "XML",
				addToRoute: false //keep set this way as there is no manifest.json
			});
		});

		it("should create the necessary files", function () {
			return assert.file(["webapp/controller/NewView.controller.js", "webapp/view/NewView.view.xml"]);
		});

		it("should create the proper controller", function () {
			return assert.fileContent("webapp/controller/NewView.controller.js", "sap.ui.demo.todo.controller.NewView");
		});

		it("should create a propert view", function () {
			return assert.fileContent("webapp/view/NewView.view.xml", 'id="NewView"', "sap.ui.demo.todo.controller.NewView");
		});
	});
}

function newControlTest() {
	describe("Create a control to the app", function () {
		it("should run the subgenerator", function () {
			return helpers.run(path.join(__dirname, "../generators/newcontrol")).withPrompts({
				controlname: "SuperControl",
				supercontrol: "sap.ui.core.Control",
				projectname: "todo",
				namespaceUI5: "sap.ui.demo"
			});
		});

		it("should create the necessary file", function () {
			return assert.file(["webapp/control/SuperControl.js"]);
		});

		it("should create the proper control", function () {
			return assert.fileContent("webapp/control/SuperControl.js", "sap.ui.demo.todo.control.SuperControl");
		});
	});
}

function newModelTest() {
	describe("Create a model to the manifest", function () {
		// before(function () {
		//     fs.writeFileSync("webapp/manifest.json", "{}");
		// })

		it("should run the subgenerator", function () {
			return helpers.run(path.join(__dirname, "../generators/newmodel")).withPrompts({
				modelName: "NewModel",
				modelType: "JSON",
				bindingMode: "TwoWay"
			});
		});

		it("should write the proper model definition", function () {
			return assert.fileContent("webapp/manifest.json", '"NewModel": {', "sap.ui.model.json.JSONModel");
		});
	});
}

describe("Run Sub-generators on an external sample project", function () {
	const testFunctions = [newViewControllerPairTest, newControlTest, newModelTest];

	testFunctions.forEach((fnTest, index) => {
		if (!IsCIRun) {
			fnTest();
			return;
		}
		const totalNodes = Number(process.env.NODES_TOTAL);
		const nodeIdx = Number(process.env.NODE_INDEX);
		const testsPerNode = Math.ceil(testFunctions.length / totalNodes);
		const lowerBound = testsPerNode * nodeIdx;
		const upperBound = testsPerNode * (nodeIdx + 1);

		if (lowerBound <= index && index < upperBound) {
			fnTest();
		}
	});
});
