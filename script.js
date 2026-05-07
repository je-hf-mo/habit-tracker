// ------------------------------------------------------------
// Supabase configuration
// ------------------------------------------------------------
// These values tell the browser how to reach your Supabase project.
const SUPABASE_URL = 'https://lwpzoabxiszakrkeqgms.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_WUO5mINQS4VX50X3ZhxIOw_syKnHAqV';

// Create one reusable Supabase client.
// window.supabase comes from the CDN script added in index.html.
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ------------------------------------------------------------
// Grab HTML elements we use often.
// ------------------------------------------------------------
const completionText = document.getElementById('completion-text');
const habitList = document.getElementById('habit-list');
const resetButton = document.getElementById('reset-button');
const addHabitForm = document.getElementById('add-habit-form');
const habitNameInput = document.getElementById('habit-name-input');
const habitItemTemplate = document.getElementById('habit-item-template');

// This array is the in-memory copy of habit data in the browser.
// After we fetch from Supabase, the data lives here and drives rendering.
let habits = [];

// ------------------------------------------------------------
// Data functions (talk to Supabase)
// ------------------------------------------------------------

// Load all habits from Supabase.
// We sort by id so items are shown in a predictable order.
async function fetchHabitsFromSupabase() {
  const { data, error } = await supabaseClient
    .from('habits')
    .select('id, name, completed')
    .order('id', { ascending: true });

  if (error) {
    console.error('Could not load habits from Supabase:', error);
    habits = [];
    return;
  }

  habits = data || [];
}

// Insert one new habit row and return the inserted row.
async function createHabitInSupabase(name) {
  const { data, error } = await supabaseClient
    .from('habits')
    .insert([{ name: name, completed: false }])
    .select('id, name, completed')
    .single();

  if (error) {
    console.error('Could not create habit:', error);
    return null;
  }

  return data;
}

// Update one habit row by id.
async function updateHabitInSupabase(id, updates) {
  const { error } = await supabaseClient.from('habits').update(updates).eq('id', id);

  if (error) {
    console.error('Could not update habit:', error);
    return false;
  }

  return true;
}

// Delete one habit row by id.
async function deleteHabitInSupabase(id) {
  const { error } = await supabaseClient.from('habits').delete().eq('id', id);

  if (error) {
    console.error('Could not delete habit:', error);
    return false;
  }

  return true;
}

// ------------------------------------------------------------
// UI functions (render/update page)
// ------------------------------------------------------------

function refreshUI() {
  renderHabits();
  updateCompletionCount();
}

// Build the list based on current `habits` array.
function renderHabits() {
  habitList.innerHTML = '';

  habits.forEach(function (habit, index) {
    const habitTemplateCopy = habitItemTemplate.content.cloneNode(true);
    const listItem = habitTemplateCopy.querySelector('li');
    const checkbox = habitTemplateCopy.querySelector('input[type="checkbox"]');
    const nameText = habitTemplateCopy.querySelector('.habit-name');
    const editButton = habitTemplateCopy.querySelector('.edit-habit-button');
    const deleteButton = habitTemplateCopy.querySelector('.delete-habit-button');

    checkbox.checked = Boolean(habit.completed);
    nameText.textContent = habit.name;

    // Toggle completed state.
    checkbox.addEventListener('change', async function () {
      const newCompletedState = checkbox.checked;
      const wasUpdated = await updateHabitInSupabase(habit.id, {
        completed: newCompletedState
      });

      // Only update local state if backend update worked.
      if (!wasUpdated) {
        checkbox.checked = !newCompletedState;
        return;
      }

      habits[index].completed = newCompletedState;
      refreshUI();
    });

    // Edit habit name.
    editButton.addEventListener('click', async function () {
      const updatedName = prompt('Edit habit name:', habit.name);

      if (updatedName === null) {
        return;
      }

      const trimmedName = updatedName.trim();

      if (!trimmedName) {
        return;
      }

      const wasUpdated = await updateHabitInSupabase(habit.id, {
        name: trimmedName
      });

      if (!wasUpdated) {
        return;
      }

      habits[index].name = trimmedName;
      refreshUI();
    });

    // Delete habit.
    deleteButton.addEventListener('click', async function () {
      const wasDeleted = await deleteHabitInSupabase(habit.id);

      if (!wasDeleted) {
        return;
      }

      habits.splice(index, 1);
      refreshUI();
    });

    habitList.appendChild(listItem);
  });
}

function updateCompletionCount() {
  let completedHabits = 0;

  habits.forEach(function (habit) {
    if (habit.completed) {
      completedHabits = completedHabits + 1;
    }
  });

  completionText.textContent = 'Completed: ' + completedHabits + ' / ' + habits.length;
}

// ------------------------------------------------------------
// User actions
// ------------------------------------------------------------

async function addHabit(name) {
  const insertedHabit = await createHabitInSupabase(name);

  if (!insertedHabit) {
    return;
  }

  habits.push(insertedHabit);
  refreshUI();
}

async function resetAllHabits() {
  // Update all habits one by one to keep the logic beginner-friendly.
  for (const habit of habits) {
    await updateHabitInSupabase(habit.id, { completed: false });
  }

  habits.forEach(function (habit) {
    habit.completed = false;
  });

  refreshUI();
}

addHabitForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const newHabitName = habitNameInput.value.trim();

  if (!newHabitName) {
    return;
  }

  await addHabit(newHabitName);
  habitNameInput.value = '';
});

resetButton.addEventListener('click', resetAllHabits);

// ------------------------------------------------------------
// Page load flow
// ------------------------------------------------------------
// 1) Fetch all habits from Supabase
// 2) Store them in `habits` (in-memory)
// 3) Render UI + completion counter
async function initializePage() {
  await fetchHabitsFromSupabase();
  refreshUI();
}

initializePage();
