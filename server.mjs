/**
 * problem: CommonJS require() vs ESM import/export standard
 * https://stackoverflow.com/questions/70691479/is-commonjs-require-still-used-or-deprecated
 * 
 * Solution: Changed file extention to .mjs and all modules to ESM imports (not require())
 * https://stackoverflow.com/a/62749284/14154848
 */

import helmet from 'helmet';
import bodyParser from 'body-parser';
import path from 'path';
import { ChatGPTAPI } from 'chatgpt';
import express from 'express';
const app = express();

/**
 *  Solution to "__dirname does not exist in ESM": https://stackoverflow.com/a/62892482/14154848
 */ 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs');

/* changing the views default path: https://stackoverflow.com/a/45903536/14154848 */
app.set('views', path.join(__dirname, '/web/'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

import {writeFileSync, readFileSync, createWriteStream} from 'fs';
import pdfjsLib from 'pdfjs-dist';
import dotenv from 'dotenv-safe';
import { oraPromise } from 'ora';

app.use(helmet());  // additional HTTP headers to protect against XSS, clickjacking, etc.
app.use ('/static', express.static('web'));
app.use('/build', express.static('build'));
app.listen(4000, () => console.log('listening on port 4000'));
dotenv.config()

/* variables */
let questionArray = readQuestionsFromFile("web/questions/default.txt");
var fileName = "default.pdf";


/**
 * Gets text from a PDF page by page.
 * 
 * Modified from source: https://stackoverflow.com/a/61278578/14154848
 * Needs full absolute path to PDF in order to work OR PDF must live in /web/
 * 
 * Solutions for app:
 * 1) Have user move/upload file to /web/ folder
 * 2) Possible non-path func workaround: https://stackoverflow.com/questions/57237875/how-to-extract-text-from-pdf
 */
async function GetTextFromPDF(path) {
  let doc = await pdfjsLib.getDocument(path).promise;
  var pageTexts = [];
  
  // Loop through each page
  var numPages = doc.numPages;
  for(let i = 1; i <= numPages; i++) {
    let curr_page = await doc.getPage(i);
    let content = await curr_page.getTextContent();
    let strings = content.items.map(function(item) {
      return item.str;
    });

    pageTexts.push(strings.join());
  }

  console.log("Extracted text from", pageTexts.length, "pages.");

  return pageTexts;
}

// manually output PDF text to console
// GetTextFromPDF("web/patrick.pdf").then(pageTexts => {
//   console.log(pageTexts);
// });

/**
 * Reads learning questions from .txt file into array. Each page/paragraph is a subarray where each elem is a question.
 * @param {string} path - path to .txt file
 * @returns
 * array of learning questions, each elem is an array of questions for a page/paragraph
 */
function readQuestionsFromFile(path) {
  const text = readFileSync(path, {encoding:'utf-8', flag:'r'});
  const textArray = text.split('\r\n'); // might need to be \r\n if .txt file made manually on Windows

  let questionArr = [];
  let tempArr = [];
  textArray.forEach((elem) => {
    if(elem != ''){
      tempArr.push(elem);
    }
    else {
      questionArr.push(tempArr);
      tempArr = [];
    }
  });

  // push the last page's questions
  questionArr.push(tempArr);
  // filter out empty array elems
  questionArr = questionArr.filter(elem => elem.length != 0);

  return questionArr;
}




/**
 * Saves questionArray (array of arrays) to file, result.txt
 * @param {array} arr - array of page/paragraph arrays, where each elem is a question
 * @param {string} fname - name of file. Default is 'result.txt'
 */
function saveQuestionsToFile(arr, fname = "web/questions/result.txt") {
  var file = createWriteStream(fname);
  file.on('error', function(err) { console.log("File write error:", err); });
  arr.forEach(pageArr => {
    pageArr.forEach(question => { file.write(question + '\n'); });
    file.write('\n');
  });
  file.end();
}


/**
 * Convert a text response from ChatGPT to an array of learning questions
 * @param {string} response - ChatGPT text response of learning questions for a page/paragraph
 * @returns {array}
 * an array of a page/paragraph's learning questions
 */
function structureResponse(response) {
  let tempArr = response.split('\n');
  
  // get rid of '' elements
  tempArr = tempArr.filter(question => question != '');
  return tempArr;
}


/**
 * Gets learning questions from ChatGPT based on an array of page/paragraph text.
 * @param {array} textArray - array of PDF text, each elem is a page/paragraph of text
 * @returns {array} resultArray - array of learning questions, each elem is an array of questions for a page/paragraph
 */
async function gptFunc(textArray) {

  let prompt = 'Write 4 learning questions about the following text: ' + textArray[0].trimEnd();
  let resultArray = [];
  
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  })

  // First page
  let res = await oraPromise(api.sendMessage(prompt), {
    text: 'Loading questions for Page 1'
  });
  resultArray[0] = structureResponse(res.text)
  
  // Loop through remaining pages and generate learning questions (set loop to index < textArray.length to go through all pages)
  for (let index = 1; index < textArray.length; index++) {
    prompt = 'Write 4 learning questions about the following text: ' + textArray[index].trimEnd();
    pageNum = index + 1
    
    res = await oraPromise(
      api.sendMessage(prompt, {
        conversationId: res.conversationId,
        parentMessageId: res.messageId
      }),
      {
        text: 'Loading questions for Page ' + pageNum
      }
    )
    resultArray[index] = structureResponse(res.text);
  }
    
  return resultArray;
}


app.get('/', function(req, res) {
  // res.sendFile(path.join(__dirname + '/public/visor.html'));

  // Straight to viewer, no need for visor.html
  res.redirect('/static/viewer.html' + '?file=' + fileName);


});

app.get('/static/viewer.html', function(req, res) {
  // res.sendFile(path.join(__dirname + '/static/viewer.ejs'));
  console.log("QArray length:", questionArray.length);
  res.render("viewer", {questionArray: questionArray});
})

app.post('/static/viewer.html', function(req, res) {

  // TODO: Get the fileName dynamically from opening a new file
  // ex: fileName = req.body.filename ...

  GetTextFromPDF("web/" + fileName).then(pageTexts => {
    gptFunc(pageTexts).then(lqs => {
      console.log(lqs);
      questionArray = lqs;

      // Write result to file
      saveQuestionsToFile(questionArray);

      res.redirect('/static/viewer.html' + '?file=' + fileName);
    });
  });

})