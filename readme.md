### Node - PDF.js pdf files viewer ###

This small app serves a pdf viewer via NodeJS + Express JS and adapting the pre-built version of PDF.js, by Mozilla.

If you want to try it yourself, just download the current stable pre-built version of the PDF.js library, and add both folders to your web application.

You will only need to link to the "viewer.html" file + your target file, and the library will do the magic.

You can start with this very repository:

- Just use npm -i to install the dependencies (basically Express.js).

- Make sure you serve correctly the proper files and that you are linking to your target file (putting it into the "web" folder will make it simple). You can find comprehensive documentation at the GitHub site of Mozilla PDF.js.

- Et voilá! You got it. 


### Todo (in order of priority)
- [x] Correctly position questions to the right of the PDF Viewer at 100% view
- [ ] Separate answers from questions (each written to new line)
- [ ] Correctly set height of questionBox based on the zoom factor (could probably change this dynamically if front-end created in React)
- [ ] Generate questions by section (not by page)
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
- [x] make questionArray an array of arrays
- [x] Allow user to specify number of LQs per page (not just 4)
- [ ] No PDF loaded by default, UI prompting user to "open a file" 
- [ ] Add loading indicator when ChatGPT questions are loading

- [x] Change architecture to full-stack web app, locally hosted
    - front-end: React.js. Gets PDF file via <input> and uploads file to back-end via POST request
    - back-end: Node.js. Accepts API calls from web app and calls OpenAI API, and returns generated questions as a response
- [ ] Host back-end on server online (EC2, Heroku, etc) and make front-end a webpage



### Options
- Questions by section
- Change # of LQs
- Show / hide LQs
- specify which page the LQs should start at


### Under the hood

This web app makes use of NodeJS + ExpressJS to host a local server that passes data to and from a simple front end.

The EJS templating engine is used to dynamically render the ChatGPT text once it is obtained on the Node server.