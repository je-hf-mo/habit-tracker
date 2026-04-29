// Get all habit checkboxes from the page.
const habitCheckboxes = document.querySelectorAll('.habit-checkbox');

// Get the paragraph where we show progress.
const completionText = document.getElementById('completion-text');

// This is the localStorage key where we keep checkbox states.
const storageKey = 'habitCheckboxStates';

// Count how many boxes are checked and show it on screen.
function updateCompletionCount() {
  let completedHabits = 0;

  // Check each checkbox one by one.
  habitCheckboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      completedHabits = completedHabits + 1;
    }
  });

  // Example: "Completed: 3 / 6"
  completionText.textContent =
    'Completed: ' + completedHabits + ' / ' + habitCheckboxes.length;
}

// Save all checkbox states to localStorage.
function saveCheckboxStates() {
  const states = [];

  // Store true/false for each checkbox.
  habitCheckboxes.forEach(function (checkbox) {
    states.push(checkbox.checked);
  });

  // Save as JSON text.
  localStorage.setItem(storageKey, JSON.stringify(states));
}

// Load saved states from localStorage and apply them to checkboxes.
function loadCheckboxStates() {
  const savedStates = localStorage.getItem(storageKey);

  // If there is nothing saved yet, stop.
  if (!savedStates) {
    return;
  }

  // Convert saved JSON text back to an array.
  const parsedStates = JSON.parse(savedStates);

  // Extra safety: only continue if the saved value is really an array.
  if (!Array.isArray(parsedStates)) {
    return;
  }

  // Apply each saved true/false value to matching checkbox.
  habitCheckboxes.forEach(function (checkbox, index) {
    checkbox.checked = parsedStates[index] === true;
  });
}

// 1) Load saved states first.
loadCheckboxStates();

// 2) Add listeners so every change updates count + saves state.
habitCheckboxes.forEach(function (checkbox) {
  checkbox.addEventListener('change', function () {
    updateCompletionCount();
    saveCheckboxStates();
  });
});

// 3) Update count once on page load.
updateCompletionCount();