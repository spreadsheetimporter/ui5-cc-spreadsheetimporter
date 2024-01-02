const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const markdownPath = './docs/**/*.md';
const openaiKey = '';

const openai = new OpenAI({ apiKey: openaiKey });

async function findMarkdownFiles(dir, fileList = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            await findMarkdownFiles(filePath, fileList);
        } else if (file.name.endsWith('.md')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

async function improveMarkdownFiles(filename = null, model = 'gpt-3.5-turbo-16k') {
    let files = [];
    if (filename) {
        // Check if the filename is actually a directory or a file
        const stats = await fs.lstat(filename);
        if (stats.isDirectory()) {
            files = await findMarkdownFiles(filename);
        } else if (stats.isFile() && filename.endsWith('.md')) {
            files.push(filename); // Only add if it's a Markdown file
        }
    } else {
        // Default to processing all Markdown files in the './docs' directory
        files = await findMarkdownFiles('./docs');
    }
    
    for (const file of files) {
        const rawMarkdown = await fs.readFile(file, 'utf-8');
        const improvedMarkdown = await fixGrammarAndFormatMarkdown(rawMarkdown, model);
        await fs.writeFile(file, improvedMarkdown, 'utf-8');
        // Wait for 5 seconds before the next iteration
        await delay(500);
    }
}


async function fixGrammarAndFormatMarkdown(rawMarkdown, model) {
    const prompt = `Please fix grammatical errors, improve writing, make the documentaion more understandable for developers and maintain the format of the Markdown: ${rawMarkdown}`;
    // const prompt = `Please fix grammatical errors and maintain the format of the Markdown: ${rawMarkdown}`;
    try {
        const response = await openai.chat.completions.create({
            messages: [
                { role: "user", content: prompt },
            ],
            model: model,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error improving Markdown:', error);
        return rawMarkdown;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        await improveMarkdownFiles("./docs/pages/Configuration.md",'gpt-3.5-turbo-1106'); // Call without parameters to use default values
        console.log('Markdown files improved successfully.');
    } catch (error) {
        console.error('Error improving Markdown:', error);
    }
})();
