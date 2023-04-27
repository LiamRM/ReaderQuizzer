# ReaderQuizzer

This tool, ReaderQuizzer, is my Computer Science capstone project at NYUAD. The tool allows users to upload PDFs of academic readings, and  automatically generate and display comprehension and analysis questions that directly relate to the given text. The goal is an interactive studying experience that prompts readers to engage more actively and critically with their reading material.

The tool uses the ChatGPT API under the hood to generate these questions.


## :gear: Installation
1. Install Node.js if you haven't already. You can download the latest version at [their official website](https://nodejs.org/en/download). LTS version works fine.
2. Clone this GitHub repository or download the zip file, found by clicking the blue `< > Code` button above.
3. Navigate to the project directory in your terminal.
4. Install the dependencies using the following command:
```
npm install
```
This will install all the necessary packages listed in the `package.json` file.

5. Create an OpenAI account and obtain an OpenAI API key on [the OpenAI API website](https://platform.openai.com/account/api-keys).
6. Create a .env file in the root directory of your project and add your OpenAI API key. You can use the .env.example file as a template.
7. Start the server by using the following command:
```
npm start
```
8. The application will now be running on port 4000. Open http://localhost:4000 on your preferred browser.
9. Et voilá! Open your PDF text and happy studying!

## :rocket: Usage
![Screenshot of the tool](/assets/ReaderQuizzer%20screenshot.png "ReaderQuizzer Screenshot")

1. Open a PDF file by clicking the 'open file' button on the top toolbar. The PDF cannot be password-protected and must have selectable text for ReaderQuizzer to generate questions.
2. Reading questions can be generated by clicking the button on the top toolbar with the ![Generate questions button](/assets/toolbarButton-chatgpt%402x.png) icon. 
3. First, select the question type, either 'Comprehension' or 'Analysis'.
- Comprehension questions are fact-based and simpler, asking the reader questions that have answers directly in the text.
- Comprehension questions are broader, asking the reader to expand beyond the scope of the text and consider things like limitations in the author's argument and make connections with other texts.
4. Then, select the number of questions that will be generated per page of the PDF.
5. Finally, click 'generate questions'. The terminal will display the progress of the question generation.
6. Voila! The questions should appear next to the text. 



## :toolbox: Under the hood: Design and dependencies

This web app makes serves a pdf viewer via NodeJS + ExpressJS, hosting a local server that passes data to and from a simple front end made in vanilla JavaScript and CSS.

The front-end is found under the "web" folder and:
- Adapts the pre-built version of PDF.js, by Mozilla.
- Uploads a copy of the opened PDF to the server. The PDFs are stored in the "pdfs" folder.
- When the user clicks 'Generate Questions', a POST request is sent to the back-end with the `questionType` and `numQuestions` variables.
- The EJS templating engine is used to dynamically render the learning questions once received from the back-end.

The Node.js back-end:
- Handles routing and POST requests from the front-end.
- Scrapes the text from the PDF uploaded to the "pdfs" folder.
- Makes a call to the OpenAI API, asking ChatGPT to generate learning questions for the uploaded PDF. I rely on [Travis Fischer's Node.js ChatGPT API wrapper](https://github.com/transitive-bullshit/chatgpt-api) for simplicity.
- The questions received from ChatGPT are stored in the "questions" folder in "web" as a `.txt` file. Each question is on an individual line, followed by the answer. An empty line is needed to separate questions from each page. 

PDF.js:
- As the app relies on PDF.js, if it stops working, one must download the current stable pre-built version of the [PDF.js library](https://github.com/mozilla/pdf.js), and add both folders to your web application. Comprehensive documentation can be found on their GitHub.
- The PDF.js build can be linked to ReaderQuizzer in the <head> of the `viewer.ejs` file.



## :dart: To-do

- [x] Generate BOTH comprehension and analysis questions on server
- [x] Correctly position questions to the right of the PDF Viewer at 100% view
- [x] Separate answers from questions (each written to new line)
- [ ] Correctly set height of questionBox based on the zoom factor (could probably change this dynamically if front-end created in React)
- [ ] Option to generate questions by section (introduction, methodology, etc) or by page 
- [x] Open files dynamically
- [x] Fixed corrupted duplicate PDF files by deleting duplicate files before uploading new files.
- [x] Search for and open the questionsFile corresponding to the opened pdf file
- [x] Structure response from official ChatGPT API
- [x] Incorporate official ChatGPT API
- [x] Fix 'generate questions' icon
- [x] Generate questions for ALL pages
- [x] Remove initial visor.html page (?)
- [ ] automatically open localhost:4000 with `nodemon server.mjs` command?
- [x] Save questions to file with one question per line, blank line separating page questions
- [x] Render a `<p>` tag per question
- [x] Read questions from file into questionArray
- [x] Allow user to specify number of LQs per page (not just 4)
- [ ] No PDF loaded by default, UI prompting user to "open a file" 
- [ ] Add loading indicator when ChatGPT questions are loading

- [x] Change architecture to full-stack web app, locally hosted
    - front-end: React.js. Gets PDF file via <input> and uploads file to back-end via POST request
    - back-end: Node.js. Accepts API calls from web app and calls OpenAI API, and returns generated questions as a response
- [ ] Host back-end on server online (EC2, Heroku, etc) and make front-end a webpage
