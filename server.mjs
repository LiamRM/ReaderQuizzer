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
import dotenv from 'dotenv-safe';
import { oraPromise } from 'ora';

/* configuring server to parse multipart/form-data uploads */
import multer from 'multer';
/* importing utils */
import { getTextFromPDF, readQuestionsFromFile, saveQuestionsToFile, structureRegex, structureResponse } from './utils.mjs';

/**
 *  Solution to "__dirname does not exist in ESM": https://stackoverflow.com/a/62892482/14154848
 */ 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('view engine', 'ejs');

/* changing the views default path: https://stackoverflow.com/a/45903536/14154848 */
app.set('views', path.join(__dirname, '/web/'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());  // additional HTTP headers to protect against XSS, clickjacking, etc.
app.use ('/static', express.static('web'));
app.use('/build', express.static('build'));
app.listen(4000, () => console.log('listening on port 4000'));
dotenv.config()


/* variables */
var questionArray = readQuestionsFromFile("web/questions/linearalg.txt");
var pdfFolder = "pdfs/"
var fileName = "";
var filePath = "";  // default is empty


// Multer middleware configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = 'web/' + pdfFolder;
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });


/**
 * Gets learning questions (and answers) from ChatGPT based on an array of page/paragraph text.
 * @param {array} textArray - array of PDF text, each elem is a page/paragraph of text
 * @param {string} questionType - type of the questions to be generated. Either 'Comprehension' or 'Analysis'. 
 * @param {number} numQuestions - number of learning questions to generate per page.
 * @returns {array} resultArray - array of learning questions, each elem is an array of questions for a page/paragraph. Each question is followed by an answer.
 */
async function gptQuestionFunc(textArray, questionType = 'Comprehension', numQuestions = 4) {

  let prompt = '';
  switch (questionType) {
    case 'Comprehension':
      prompt = 'Write ' + numQuestions + ' comprehension questions followed by answers to the questions on a new line about the following research article: "' + textArray[0].trimEnd()+'".';
      break;
    
    case 'Analysis':
      prompt = 'Analysis questions are questions that force the reader to reflect and expand beyond the scope of the paper. These types of questions require less regurgitation and more sustained thought, forcing the reader to identify reasons or motives, identify relations across texts, and reach a conclusion. For example, analysis questions include “What are the limitations of this paper?”, “What are the weaknesses in this writer’s argument?”, and “How does the program in this paper compare to existing programs?”. Based on this definition, write ' + numQuestions + ' analysis questions followed by answers to the questions on a new line about the following research article: "' + textArray[0].trimEnd() + '".';
      break;

    default:
      prompt = 'Write ' + numQuestions + ' comprehension questions followed by answers to the questions on a new line about the following research article: "' + textArray[0].trimEnd() + '".';
      break;
  }
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
  // for (let index = 1; index < 4; index++) {
  for (let index = 1; index < textArray.length; index++) {
    switch (questionType) {
      case 'Comprehension':
        prompt = 'Write ' + numQuestions + ' comprehension questions followed by answers to the questions on a new line about the following research article: "' + textArray[index].trimEnd()+'".';
        break;
      
      case 'Analysis':
        prompt = 'Analysis questions are questions that force the reader to reflect and expand beyond the scope of the paper. These types of questions require less regurgitation and more sustained thought, forcing the reader to identify reasons or motives, identify relations across texts, and reach a conclusion. For example, analysis questions include “What are the limitations of this paper?”, “What are the weaknesses in this writer’s argument?”, and “How does the program in this paper compare to existing programs?”. Based on this definition, write ' + numQuestions + ' analysis questions followed by answers to the questions on a new line about the following research article: "' + textArray[index].trimEnd() + '".';
        break;
  
      default:
        prompt = 'Write ' + numQuestions + ' comprehension questions followed by answers to the questions on a new line about the following research article: "' + textArray[index].trimEnd() + '".';
        break;
    }
    let pageNum = index + 1
    
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
  res.redirect('/static/viewer.html' + '?file=' + filePath);
});

app.get('/static/viewer.html', function(req, res) {
  // res.sendFile(path.join(__dirname + '/static/viewer.ejs'));
  console.log("QArray length:", questionArray.length);
  res.render("viewer", {questionArray: questionArray});
});

app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  console.log(req.file);
  const pdfFile = req.file;
  if (!pdfFile) {
    return res.status(400).send('No file uploaded.');
  }

  /* save pdfFile path and redirect client to newly opened PDF */
  fileName = pdfFile.filename;
  filePath = pdfFolder + pdfFile.filename;
  res.redirect('/static/viewer.html' + '?file=' + filePath);
  
  // The file has been successfully uploaded to the server's file system
  // You can process the file here (e.g., read its contents or move it to a different directory)
  getTextFromPDF(pdfFile.path).then(pageTexts => {
    // console.log(pageTexts);

    /* save pdfFile path object on server? */
    console.log(pdfFile.filename);
    
  })
});


app.post('/static/viewer.html', function(req, res) {

  console.log("Body:", req.body);
  let questionType = req.body.question_type;
  let numQuestions = req.body.num_questions;

  getTextFromPDF("web/" + filePath).then(pageTexts => {
    // console.log(pageTexts);
    gptQuestionFunc(pageTexts, questionType, numQuestions).then(lqs => {
      console.log(lqs);
      questionArray = lqs;

      // Write result to file
      saveQuestionsToFile(questionArray, 'web/questions/linearalg.txt');

      res.redirect('/static/viewer.html' + '?file=' + filePath);
    });
  });

})
