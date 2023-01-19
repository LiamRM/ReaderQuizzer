// problem: CommonJS require() vs ESM import/export standard
// https://stackoverflow.com/questions/70691479/is-commonjs-require-still-used-or-deprecated

// Solution: Changed file extention to .mjs and all modules to ESM imports (not require())
// https://stackoverflow.com/a/62749284/14154848

// const express = require('express');
import express from 'express';
const app = express();


import helmet from 'helmet';
import bodyParser from 'body-parser';
import path from 'path';
import { ChatGPTAPIBrowser } from 'chatgpt'

// __dirname does not exist in ESM: https://stackoverflow.com/a/62892482/14154848
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var fileName = "";

app.set('view engine', 'ejs');

/* changing the views default path: https://stackoverflow.com/a/45903536/14154848 */
app.set('views', path.join(__dirname, '/web/'))

// const helmet = require('helmet');
// const bodyParser = require("body-parser");
// const cors = require('cors')
// let path = require('path');

// dynamic import (available in all CommonJS modules)
// (async () => {
//   const chatgpt = await import('chatgpt');
//   gptFunc()
// })();
// import("chatgpt").then(chatgpt => {
//   gpt = chatgpt;
// })


// const chatgpt = require(__dirname + "/chatgpt.js");
// const chatgpt = require(__dirname + "/api/chatgpt.js");
// const mid = require('./mid');

// mid.loadModule(__dirname + "/api/chatgpt.js")
//     .then(gfs => {
//         console.log(gfs);
//     });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// app.use(cors());

// app.use( express.static(path.join(__dirname + '/web/')));
import {writeFileSync, readFileSync} from 'fs';
import pdfjsLib from 'pdfjs-dist';
import dotenv from 'dotenv-safe';
import { oraPromise } from 'ora';

dotenv.config()

/* variables */
let questionArray = [];

// import process from 'process';
// import { mainModule } from 'process';

// const fs = require('fs');
// // const pdf = require('pdf-parse');
// const pdfjsLib = require("pdfjs-dist");
// const { mainModule } = require('process');

/* Gets text page by page
 * Modified from source: https://stackoverflow.com/a/61278578/14154848
 */
async function GetTextFromPDF(path) {
  let doc = await pdfjsLib.getDocument(path).promise;
  var pageTexts = [];
  
  // Loop through each page
  var numPages = doc.numPages;
  for(let i = 1; i <= numPages; i++) {
    console.log(i);
    let curr_page = await doc.getPage(i);
    let content = await curr_page.getTextContent();
    let strings = content.items.map(function(item) {
      return item.str;
    });

    pageTexts.push(strings.join());
  }

  // console.log(pageTexts);
  console.log("Num elements:", pageTexts.length)

  return pageTexts;
}

// Using absolute path, getting a dynamic path to user-uploaded pdf may prove difficult (maybe upload pdf to server)
// Possible fix: https://stackoverflow.com/questions/57237875/how-to-extract-text-from-pdf
GetTextFromPDF("web/compressed.tracemonkey-pldi-09.pdf").then(pt => {
  console.log("final obj", pt.length);
  // gptFunc(pt);
});


// TODO: Call gptFunc on button press, not with .then()
async function gptFunc(textArray) {

  // get text array, each item is a page's text
  let arr = textArray;
  let prompt = 'Write 4 learning questions about the following text: ' + arr[0].trimEnd();
  
  const api = new ChatGPTAPIBrowser({
    email: process.env.OPENAI_EMAIL,
    password: process.env.OPENAI_PASSWORD
  })
  await api.initSession()

  let result = '';
  let resultArray = [];

  // Initial page
  let res = await oraPromise(api.sendMessage(prompt), {
    text: prompt
  })
  result = result + '\n1)\n' + res.response;
  resultArray[0] = res.response;
  // console.log('\n1)\n\t' + res.response);
  
  // Loop through remaining pages and generate learning questions (only first 3 for testing instead of arr.length)
  for (let index = 1; index < 3; index++) {
    prompt = 'Write 4 learning questions about the following text: ' + arr[index].trimEnd();
    
    res = await oraPromise(
      api.sendMessage(prompt, {
        conversationId: res.conversationId,
        parentMessageId: res.messageId
      }),
      {
        text: prompt
      }
    )
    // console.log('\n'+index+'\n\t' + res.response);
    result = result + '\n' + index + '\n' + res.response;
    resultArray[index] = res.response;
  }

  // Write result to file
  writeFileSync('result.txt', result);
    
  // close the browser at the end
  await api.closeSession()
  return resultArray;
}

app.use(helmet());

app.use ('/static', express.static('web'));
app.use('/build', express.static('build'));
app.listen(4000, () => console.log('listening on port 4000'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/visor.html'));
});

app.get('/static/viewer.html', function(req, res) {
  // res.sendFile(path.join(__dirname + '/static/viewer.ejs'));
  res.render("viewer", {questionArray: questionArray});
})

app.post('/static/viewer.html', function(req, res) {

  fileName = "rome.pdf";

  GetTextFromPDF("web/" + fileName).then(pt => {
    console.log("final obj", pt.length);
    gptFunc(pt).then(lqs => {
      console.log(lqs);
      questionArray = lqs;
    });
  });

  res.redirect('/static/viewer.html' + '?file=' + fileName);
})