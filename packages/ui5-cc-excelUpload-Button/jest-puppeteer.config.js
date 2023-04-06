module.exports = {
	server: {
		launchTimeout: 20000,
		command: `yarn test:manual --config ${__dirname}/test/ui5-app/ui5-ci-only.yaml`,
		port: 8080,
		usedPortAction: "kill"
	}
}
