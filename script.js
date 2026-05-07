// A single key name so we always save/load from the same localStorage location.
const HABITS_STORAGE_KEY = 'habitsData';

// Grab elements we will use many times.
const completionText = document.getElementById('completion-text');
const habitList = document.getElementById('habit-list');
const resetButton = document.getElementById('reset-button');
const addHabitForm = document.getElementById('add-habit-form');
const habitNameInput = document.getElementById('habit-name-input');
const habitItemTemplate = document.getElementById('habit-item-template');

// This is our structured data model:
// each habit is an object like { name: 'Read 10 pages', completed: false }.
let habits = [];

// Default habits used the first time someone opens the page.
const defaultHabits = [
  { name: 'Drink 8 glasses of water', completed: false },
  { name: 'Walk for 20 minutes', completed: false },
  { name: 'Read 10 pages', completed: false },
  { name: 'Meditate for 5 minutes', completed: false },
  { name: 'Sleep before 11 PM', completed: false }
];

// Save the whole habits array to localStorage.
function saveHabits() {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

// Read habits array from localStorage.
function loadHabits() {
  const savedHabitsText = localStorage.getItem(HABITS_STORAGE_KEY);

  // If nothing is saved yet, start with the default habits.
  if (!savedHabitsText) {
    habits = defaultHabits;
    saveHabits();
    return;
  }

  const parsedHabits = JSON.parse(savedHabitsText);

  // Basic safety check: only use data if it is an array.
  if (Array.isArray(parsedHabits)) {
    habits = parsedHabits;
  } else {
    habits = defaultHabits;
    saveHabits();
  }
}

// Keep all UI refresh work in one place.
// We call this after every action that changes data.
function refreshUI() {
  saveHabits();
  renderHabits();
  updateCompletionCount();
}

// Build the checkbox list from the habits array.
function renderHabits() {
  // Clear old list items so we can rebuild from scratch.
  habitList.innerHTML = '';

  habits.forEach(function (habit, index) {
    // Clone the template so each habit gets the same beginner-friendly HTML structure.
    const habitTemplateCopy = habitItemTemplate.content.cloneNode(true);
    const listItem = habitTemplateCopy.querySelector('li');
    const checkbox = habitTemplateCopy.querySelector('input[type="checkbox"]');
    const nameText = habitTemplateCopy.querySelector('.habit-name');
    const editButton = habitTemplateCopy.querySelector('.edit-habit-button');
    const deleteButton = habitTemplateCopy.querySelector('.delete-habit-button');
    const listItem = document.createElement('li');
    const row = document.createElement('div');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const nameText = document.createElement('span');
    const actions = document.createElement('div');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    row.className = 'habit-row';
    actions.className = 'habit-actions';

    checkbox.checked = habit.completed;

    // Show the current habit name.
    nameText.textContent = habit.name;

    // When one checkbox changes:
    // 1) update data model
    // 2) refresh saved data + list + counter
    checkbox.addEventListener('change', function () {
      habits[index].completed = checkbox.checked;
      refreshUI();
    });

    // Edit button: ask for a new name and update if valid.
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', function () {
      const updatedName = prompt('Edit habit name:', habits[index].name);

      // If user clicks Cancel, prompt returns null.
      if (updatedName === null) {
        return;
      }

      const trimmedName = updatedName.trim();

      // Do not allow blank names.
      if (!trimmedName) {
        return;
      }

      habits[index].name = trimmedName;
      refreshUI();
    });

    // Delete button: remove this habit from the array.
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
      habits.splice(index, 1);
      refreshUI();
    });

    label.appendChild(checkbox);
    label.appendChild(nameText);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    row.appendChild(label);
    row.appendChild(actions);
    listItem.appendChild(row);
    habitList.appendChild(listItem);
  });
}

// Count completed habits from data model and update the text.
function updateCompletionCount() {
  let completedHabits = 0;

  habits.forEach(function (habit) {
    if (habit.completed) {
      completedHabits = completedHabits + 1;
    }
  });

  completionText.textContent = 'Completed: ' + completedHabits + ' / ' + habits.length;
}

// Set every habit to incomplete.
function resetAllHabits() {
  habits.forEach(function (habit) {
    habit.completed = false;
  });

  refreshUI();
}

// Add a brand new habit object to the array.
function addHabit(name) {
  habits.push({
    name: name,
    completed: false
  });

  refreshUI();
}

// Add habit when the form is submitted.
addHabitForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const newHabitName = habitNameInput.value.trim();

  if (!newHabitName) {
    return;
  }

  addHabit(newHabitName);
  habitNameInput.value = '';
});

// Reset all habits on button click.
resetButton.addEventListener('click', resetAllHabits);

// Page load flow:
// 1) load data from localStorage
// 2) rebuild list from data
// 3) refresh completion text
loadHabits();
renderHabits();
updateCompletionCount();
