const dropdownButton = document.querySelector('.dropdown-button');
const dropdownMenu = document.querySelector('.dropdown-menu');

dropdownButton.addEventListener('click', function() {
  dropdownMenu.classList.toggle('hidden');
});

var slider = document.getElementById("questionNumRange");
var output = document.getElementById("slider-label");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}