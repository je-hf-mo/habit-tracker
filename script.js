// Get all habit checkboxes from the page.
const habitCheckboxes = document.querySelectorAll('.habit-checkbox');

// Get the paragraph where we show progress.
const completionText = document.getElementById('completion-text');

// This function counts checked boxes and updates the text.
function updateCompletionCount() {
  let completedHabits = 0;

  // Loop through every checkbox.
  habitCheckboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      completedHabits = completedHabits + 1;
    }
  });

  // Build the message like "Completed: 2 / 5".
  completionText.textContent =
    'Completed: ' + completedHabits + ' / ' + habitCheckboxes.length;
}

// When user clicks any checkbox, update the count.
habitCheckboxes.forEach(function (checkbox) {
  checkbox.addEventListener('change', updateCompletionCount);
});

// Run once when page loads so it starts at 0 / 5.
updateCompletionCount();
