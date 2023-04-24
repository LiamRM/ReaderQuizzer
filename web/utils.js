const dropdownButton = document.querySelector('.dropdown-button');
const dropdownMenu = document.querySelector('.dropdown-menu');
const openFileInstructions = document.querySelector('.open-file-instructions');

const answerBoxes = document.getElementsByClassName('answerBox');
const answerTexts = document.getElementsByClassName('answerText');
const answerLabels = document.getElementsByClassName('showAnswerLabel');
const pdfFileInput = document.getElementById('pdfFileInput');

dropdownButton.addEventListener('click', function() {
  dropdownMenu.classList.toggle('hidden');
});

// Hide dropdown when user clicks away from it
document.addEventListener('click', function(event) {
  const isClickInside = dropdownButton.contains(event.target) || dropdownMenu.contains(event.target);
  if (!isClickInside) {
    dropdownMenu.classList.add('hidden');
  }
});

// Shows and hides answers to questions
// ChatGPT: The closure (i and index) ensures that the correct value of index is used, even if the loop has moved on to the next iteration.
for(var i = 0; i < answerBoxes.length; i++) {
  (function(index) {
    answerBoxes[index].addEventListener('click', function() {
      answerTexts[index].classList.toggle('hidden');
      answerLabels[index].classList.toggle('hidden');
    });
  })(i);
}


var slider = document.getElementById("questionNumRange");
var output = document.getElementById("slider-label");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}


// Opening Files
pdfFileInput.addEventListener('change', async (event) => {

  const file = event.target.files[0];
  const formData = new FormData();
  formData.append('pdfFile', file);

  /* POST request to upload file to server (creds ChatGPT) */
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });
    // Check the status of the response
    if (response.ok) {
      // If the response is a redirect, navigate to the new URL
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        // Otherwise, do something with the response data
        return response.json();
      }
    } else {
      throw new Error('Network response was not ok.');
    }

  } catch (error) {
    console.error(error);
  }
});