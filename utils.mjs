/**
 * Using .mjs file extension so all modules are ESM imports/exports (not require())
 * https://stackoverflow.com/a/62749284/14154848
 */

import {writeFileSync, readFileSync, createWriteStream} from 'fs';
import pdfjsLib from 'pdfjs-dist';


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
async function getTextFromPDF(path) {
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
 * Reads learning questions from .txt file into array. Each page/paragraph is a subarray where each elem is a question.
 * @param {string} path - path to .txt file
 * @returns
 * array of learning questions, each elem is an array of questions for a page/paragraph
 */
function readQuestionsFromFile(path) {
  const text = readFileSync(path, {encoding:'utf-8', flag:'r'});
  // TODO: find a workaround for the CRLF vs LF file issue: https://stackoverflow.com/questions/1552749/difference-between-cr-lf-lf-and-cr-line-break-types
  const textArray = text.split('\n'); // BUG: might need to be \r\n if .txt file made manually on Windows

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
 * @param {string} fname - name of file. Default is 'web/questions/result.txt'
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
  // split text to array by \n
  let tempArr = response.split('\n');
  
  // get rid of '' elements
  tempArr = tempArr.filter(question => question != '');

  // edge case where questions are not separated by \n
  if(tempArr.length == 1) {
    tempArr = tempArr[0].split('?');
    // get rid of '' elements
    tempArr = tempArr.filter(question => question != '');

    // remove "Questions: " from first elem
    if(tempArr[0].startsWith("Questions: ")) {
      tempArr[0] = tempArr[0].slice(11);
    }

    // Add a question mark back to the end of the question
    tempArr = tempArr.map(elem => elem.trim());
    tempArr = tempArr.map(elem => elem + '?');
  }


  // edge case where question and answer are in same element
  tempArr = tempArr.flatMap((elem) => {
    // Case 1: Question followed by Answer
    const regex = /Q\d+:(.*)A\d+:(.*)/gs;
    const matches = elem.match(regex);

    // check if question and answer are in same element
    if (Array.isArray(matches)) {
      console.log("Found match!", matches);

      // get the answer:
      const answerRegex = /A\d+:(.*)/gs;
      const ansMatches = elem.match(answerRegex);
      const question = elem.replace(answerRegex, "").trim();
      const answer = ansMatches[0].trim();

      elem = [question, answer];
      return elem;
    }

    // Case 2: Answer followed by Question
    // const regex2 = /A\d+:(.*)Q\d+:(.*)/gs;
    // const matches2 = elem.match(regex2);

    // // check if question and answer are in same element 
    // if (Array.isArray(matches2)) {
    //   console.log("Found match, Case 2!", matches2);

    //   // get the question and answer
    //   const questionRegex = /Q\d+:(.*)/gs;
    //   const qMatches = elem.match(questionRegex);
    //   const answer = elem.replace(questionRegex, "").trim();
    //   const question = qMatches[0].trim();

    //   elem = [question, answer];
    //   return elem;
    // }

    return elem;
  });

  return tempArr;
}

function structureRegex(inputText) {
  console.log("'", inputText, "'");
  const regex = /Q\d+:(.*)A\d+:(.*)/gs;
  const matches = inputText.match(regex);

  let testArr = [inputText];

  testArr = testArr.flatMap((elem) => {
    // Case 1: Question followed by Answer
    const regex = /Q\d+:(.*)A\d+:(.*)/gs;
    const matches = elem.match(regex);

    // check if question and answer are in same element 
    if (Array.isArray(matches)) {
      console.log("Found match!", matches);

      // get the answer:
      const answerRegex = /A\d+:(.*)/gs;
      const ansMatches = elem.match(answerRegex);
      const question = elem.replace(answerRegex, "").trim();
      const answer = ansMatches[0].trim();

      elem = [question, answer];
      return elem;
      console.log("ELEM", elem);
    }

    // Case 2: Answer followed by Question
    const regex2 = /A\d+:(.*)Q\d+:(.*)/gs;
    const matches2 = elem.match(regex2);

    // check if question and answer are in same element 
    if (Array.isArray(matches2)) {
      console.log("Found match, Case 2!", matches2);

      // get the question and answer
      const questionRegex = /Q\d+:(.*)/gs;
      const qMatches = elem.match(questionRegex);
      const answer = elem.replace(questionRegex, "").trim();
      const question = qMatches[0].trim();

      elem = [question, answer];
      console.log("ELEM", elem);
    }

    return elem;
  });
  console.log("RESULT", testArr);

  // if (Array.isArray(matches)) {
  //   console.log("Found match!", matches);

  //   // get the answer:
  //   const answerRegex = /A\d+:(.*)/gs;
  //   const ansMatches = inputText.match(answerRegex);
  //   const question = inputText.replace(answerRegex, "").trim();
  //   const answer = ansMatches[0].trim();
  //   console.log("QUESTION:", question);
  //   console.log("ANSWER: ", answer);

  //   // inputText = question;

  //   // testArr.push(inputText);

  //   // // Insert answer as element after the question
  //   // let currentIndex = testArr.indexOf(inputText);
  //   // testArr.splice(currentIndex + 1, 0, answer);

  //   console.log([question, answer]);
  // }

}


export {
  getTextFromPDF,
  readQuestionsFromFile,
  saveQuestionsToFile,
  structureResponse,
  structureRegex
};