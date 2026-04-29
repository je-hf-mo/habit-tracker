// Get all habit checkboxes from the page.
const habitCheckboxes = document.querySelectorAll('.habit-checkbox');

// Get the paragraph where we show progress.
const completionText = document.getElementById('completion-text');

// Get the reset button.
const resetButton = document.getElementById('reset-button');

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

// Save all checkbox states to localStorage.
function saveHabitStates() {
  // We will store true/false values in a simple array.
  const checkedStates = [];

  habitCheckboxes.forEach(function (checkbox) {
    checkedStates.push(checkbox.checked);
  });

  // Convert array to text and save it in the browser.
  localStorage.setItem('habitCheckboxStates', JSON.stringify(checkedStates));
}

// Load checkbox states from localStorage when page opens.
function loadHabitStates() {
  // Read saved text from localStorage.
  const savedStatesText = localStorage.getItem('habitCheckboxStates');

  // If nothing was saved before, stop here.
  if (!savedStatesText) {
    return;
  }

  // Convert saved text back into an array.
  const savedStates = JSON.parse(savedStatesText);

  // Apply each saved state to each checkbox.
  habitCheckboxes.forEach(function (checkbox, index) {
    checkbox.checked = Boolean(savedStates[index]);
  });
}

// Reset all habits to incomplete.
function resetAllHabits() {
  // Uncheck every box.
  habitCheckboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });

  // Save cleared state and update the counter text.
  saveHabitStates();
  updateCompletionCount();
}

// When user changes any checkbox:
// 1) save checkbox states
// 2) update the completion count
habitCheckboxes.forEach(function (checkbox) {
  checkbox.addEventListener('change', function () {
    saveHabitStates();
    updateCompletionCount();
  });
});

// When user clicks reset, clear all habits.
resetButton.addEventListener('click', resetAllHabits);

// On page load:
// 1) load saved states
// 2) show the correct completion number
loadHabitStates();
updateCompletionCount();