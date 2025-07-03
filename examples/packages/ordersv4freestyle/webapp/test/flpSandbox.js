sap.ui.define(["sap/base/util/ObjectPath", "sap/ushell/services/Container"], function (ObjectPath) {
	"use strict";

	// define ushell config
	ObjectPath.set(["sap-ushell-config"], {
		defaultRenderer: "fiori2",
		bootstrapPlugins: {
			RuntimeAuthoringPlugin: {
				component: "sap.ushell.plugins.rta",
				config: {
					validateAppVersion: false
				}
			},
			PersonalizePlugin: {
				component: "sap.ushell.plugins.rta-personalize",
				config: {
					validateAppVersion: false
				}
			}
		},
		renderers: {
			fiori2: {
				componentData: {
					config: {
						enableSearch: false,
						rootIntent: "Shell-home"
					}
				}
			}
		},
		services: {
			LaunchPage: {
				adapter: {
					config: {
						groups: [
							{
								tiles: [
									{
										tileType: "sap.ushell.ui.tile.StaticTile",
										properties: {
											title: "OrdersV4 Freestyle 120",
											targetURL: "#ordersv4freestyle-display"
										}
									}
								]
							}
						]
					}
				}
			},
			ClientSideTargetResolution: {
				adapter: {
					config: {
						inbounds: {
							"ordersv4freestyle-display": {
								semanticObject: "ordersv4freestyle",
								action: "display",
								description: "An SAP Fiori application.",
								title: "OrdersV4 Freestyle 120",
								signature: {
									parameters: {}
								},
								resolutionResult: {
									applicationType: "SAPUI5",
									additionalInformation: "SAPUI5.Component=ordersv4freestyle",
									url: sap.ui.require.toUrl("ordersv4freestyle")
								}
							}
						}
					}
				}
			},
			NavTargetResolution: {
				config: {
					enableClientSideTargetResolution: true
				}
			}
		}
	});

	var oFlpSandbox = {
		init: function () {
			/**
			 * Initializes the FLP sandbox
			 * @returns {Promise} a promise that is resolved when the sandbox bootstrap has finshed
			 */

			// sandbox is a singleton, so we can start it only once
			if (!this._oBootstrapFinished) {
				this._oBootstrapFinished = sap.ushell.bootstrap("local");
				this._oBootstrapFinished.then(function () {
					sap.ushell.Container.createRenderer().placeAt("content");
				});
			}

			return this._oBootstrapFinished;
		}
	};

	return oFlpSandbox;
});
