### Node - PDF.js pdf files viewer ###

This small app serves a pdf viewer via NodeJS + Express JS and adapting the pre-built version of PDF.js, by Mozilla.

If you want to try it yourself, just download the current stable pre-built version of the PDF.js library, and add both folders to your web application.

You will only need to link to the "viewer.html" file + your target file, and the library will do the magic.

You can start with this very repository:

- Just use npm -i to install the dependencies (basically Express.js).

- Make sure you serve correctly the proper files and that you are linking to your target file (putting it into the "web" folder will make it simple). You can find comprehensive documentation at the GitHub site of Mozilla PDF.js.

- Et voilá! You got it. 


### Todo (in order of priority)
- [ ] Correctly position questions to the right of the PDF Viewer
- [ ] Get the height of the page in JS and set the questionBox margin to said height (based on the zoom factor?)
- [ ] Incorporate official ChatGPT API
- [x] Fix 'generate questions' icon
- [ ] Generate questions for ALL pages
- [ ] Allow user to specify number of LQs per page (not just 4)
- [ ] Add loading indicator when ChatGPT questions are loading
- [x] Remove initial visor.html page (?)
- [ ] automatically open localhost:4000 with `nodemon server.mjs` command?