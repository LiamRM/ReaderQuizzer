const dropdownButton = document.querySelector('.dropdown-button');
const dropdownMenu = document.querySelector('.dropdown-menu');

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

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });
    const textContent = await response.text();

    console.log(textContent);
    // Display the extracted text content to the user
  } catch (error) {
    console.error(error);
  }
});