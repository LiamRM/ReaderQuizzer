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
import { ChatGPTAPIBrowser } from 'chatgpt';
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

import {writeFileSync, readFileSync} from 'fs';
import pdfjsLib from 'pdfjs-dist';
import dotenv from 'dotenv-safe';
import { oraPromise } from 'ora';

app.use(helmet());
app.use ('/static', express.static('web'));
app.use('/build', express.static('build'));
app.listen(4000, () => console.log('listening on port 4000'));
dotenv.config()

/* variables */
let questionArray = [];
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


/**
 * Gets learning questions from ChatGPT based on a text array.
 * @param {array} textArray - array of PDF text, each elem is a page/paragraph of text
 * @returns {array} resultArray - array of learning questions
 */
async function gptFunc(textArray) {

  let prompt = 'Write 4 learning questions about the following text: ' + textArray[0].trimEnd();
  let result = '';
  let resultArray = [];
  
  const api = new ChatGPTAPIBrowser({
    email: process.env.OPENAI_EMAIL,
    password: process.env.OPENAI_PASSWORD
  })
  await api.initSession()

  // First page
  let res = await oraPromise(api.sendMessage(prompt), {
    text: prompt
  })
  result = result + '\n1)\n' + res.response;
  resultArray[0] = res.response;
  
  // Loop through remaining pages and generate learning questions (only first 3 for testing instead of textArray.length)
  for (let index = 1; index < 3; index++) {
    prompt = 'Write 4 learning questions about the following text: ' + textArray[index].trimEnd();
    
    res = await oraPromise(
      api.sendMessage(prompt, {
        conversationId: res.conversationId,
        parentMessageId: res.messageId
      }),
      {
        text: prompt
      }
    )
    result = result + '\n' + index + '\n' + res.response;
    resultArray[index] = res.response;
  }

  // Write result to file
  writeFileSync('newresult.txt', resultArray.join());
    
  // close the browser at the end
  await api.closeSession()
  return resultArray;
}


app.get('/', function(req, res) {
  // res.sendFile(path.join(__dirname + '/public/visor.html'));

  // Straight to viewer, no need for visor.html
  res.redirect('/static/viewer.html' + '?file=' + fileName);


});

app.get('/static/viewer.html', function(req, res) {
  // res.sendFile(path.join(__dirname + '/static/viewer.ejs'));
  res.render("viewer", {questionArray: questionArray});
})

app.post('/static/viewer.html', function(req, res) {

  // TODO: Get the fileName dynamically from opening a new file
  // ex: fileName = req.body.filename ...

  GetTextFromPDF("web/" + fileName).then(pt => {
    console.log("final obj", pt.length);
    gptFunc(pt).then(lqs => {
      console.log(lqs);
      questionArray = lqs;
    });
  });

  res.redirect('/static/viewer.html' + '?file=' + fileName);
})