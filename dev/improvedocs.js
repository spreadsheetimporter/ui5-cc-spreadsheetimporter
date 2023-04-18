const fs = require("fs");
const glob = require("glob");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
	apiKey: "",
});
const openai = new OpenAIApi(configuration);

async function main() {
	//const files = glob.sync("docs/**/*.md");
	const files = glob.sync("packages/ui5-cc-excelUpload/src/**/*.ts");
	for (const file of files) {
		try {
			const content = fs.readFileSync(file, "utf-8");
			const instruction = "Improve readability of the code and add appriopriate comments and jsdoc";
			const prompt = ``;
			const response = await openai.createEdit({
				model: "text-davinci-edit-001",
				input: content,
				instruction: instruction,
				temperature: 0,
				top_p: 1,
			});
			const newContent = response.data.choices[0].text.trim();
			fs.writeFileSync(file, newContent);
		} catch (error) {
			console.error(`Failed to process file ${file}: ${error}`);
		}
        
	}
}

main().catch(console.error);
