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

// This array is the frontend working copy of habits.
// IMPORTANT: `completed` is local-only for now.
let habits = [];

// ------------------------------------------------------------
// Data functions (talk to Supabase)
// ------------------------------------------------------------

// Load all habits from Supabase.
// The table has only: id, name.
// We add completed:false locally after fetching.
async function fetchHabitsFromSupabase() {
  const { data, error } = await supabaseClient
    .from('habits')
    .select('id, name')
    .order('id', { ascending: true });

  if (error) {
    console.error('Could not load habits from Supabase:', error);
    habits = [];
    return;
  }

  // Convert backend rows into UI habit objects.
  habits = (data || []).map(function (habitRow) {
    return {
      id: habitRow.id,
      name: habitRow.name,
      completed: false
    };
  });
}

// Insert one new habit row and return the inserted row.
// Again, backend row has only id + name.
async function createHabitInSupabase(name) {
  const { data, error } = await supabaseClient
    .from('habits')
    .insert([{ name: name }])
    .select('id, name')
    .single();

  if (error) {
    console.error('Could not create habit:', error);
    return null;
  }

  // Add local-only completed flag for frontend tracking.
  return {
    id: data.id,
    name: data.name,
    completed: false
  };
}

// Update only name in Supabase.
async function updateHabitNameInSupabase(id, newName) {
  const { error } = await supabaseClient.from('habits').update({ name: newName }).eq('id', id);

  if (error) {
    console.error('Could not update habit name:', error);
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

    // Checkbox tracking is local-only for now.
    checkbox.addEventListener('change', function () {
      habits[index].completed = checkbox.checked;
      refreshUI();
    });

    editButton.addEventListener('click', async function () {
      const updatedName = prompt('Edit habit name:', habit.name);

      if (updatedName === null) {
        return;
      }

      const trimmedName = updatedName.trim();

      if (!trimmedName) {
        return;
      }

      const wasUpdated = await updateHabitNameInSupabase(habit.id, trimmedName);

      if (!wasUpdated) {
        return;
      }

      habits[index].name = trimmedName;
      refreshUI();
    });

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

function resetAllHabits() {
  // Reset is local-only because completed is local-only right now.
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
// 1) Fetch id + name habits from Supabase
// 2) Add local completed:false values
// 3) Render UI + completion counter
async function initializePage() {
  await fetchHabitsFromSupabase();
  refreshUI();
}

initializePage();
