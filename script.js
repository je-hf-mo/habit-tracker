// ------------------------------------------------------------
// Supabase connection settings
// ------------------------------------------------------------
const SUPABASE_URL = 'https://lwpzoabxiszakrkeqgms.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_WUO5mINQS4VX50X3ZhxIOw_syKnHAqV';

// Create one reusable Supabase client.
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ------------------------------------------------------------
// Page elements and in-memory habit state
// ------------------------------------------------------------
const statusText = document.getElementById('status-text');
const completionText = document.getElementById('completion-text');
const habitList = document.getElementById('habit-list');

// Each habit in this array will look like:
// { id: number, name: string, completed: boolean }
let habits = [];

// ------------------------------------------------------------
// Fetch habits from Supabase
// ------------------------------------------------------------
async function fetchHabits() {
  statusText.classList.remove('error');
  statusText.textContent = 'Loading habits...';

  const { data, error } = await supabaseClient
    .from('habits')
    .select('id, name')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error loading habits:', error);
    statusText.classList.add('error');
    statusText.textContent = 'Error loading habits: ' + error.message;
    habits = [];
    renderHabits();
    updateCompletionText();
    return;
  }

  // Keep completion local in memory for now.
  habits = (data || []).map(function (habit) {
    return {
      id: habit.id,
      name: habit.name,
      completed: false
    };
  });

  renderHabits();
  updateCompletionText();

  if (habits.length === 0) {
    statusText.textContent = 'No habits found yet.';
  } else {
    statusText.textContent = 'Habits loaded.';
  }
}

// ------------------------------------------------------------
// Render habits with checkboxes
// ------------------------------------------------------------
function renderHabits() {
  habitList.innerHTML = '';

  habits.forEach(function (habit, index) {
    const listItem = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const nameText = document.createElement('span');

    checkbox.type = 'checkbox';
    checkbox.checked = habit.completed;
    nameText.textContent = habit.name;

    // Only update local in-memory state (not Supabase yet).
    checkbox.addEventListener('change', function () {
      habits[index].completed = checkbox.checked;
      updateCompletionText();
    });

    label.appendChild(checkbox);
    label.appendChild(nameText);
    listItem.appendChild(label);
    habitList.appendChild(listItem);
  });
}

// ------------------------------------------------------------
// Update completion counter text
// ------------------------------------------------------------
function updateCompletionText() {
  const completedCount = habits.filter(function (habit) {
    return habit.completed;
  }).length;

  completionText.textContent = 'Completed: ' + completedCount + ' / ' + habits.length;
}

// ------------------------------------------------------------
// Page startup
// ------------------------------------------------------------
if (!statusText || !completionText || !habitList) {
  console.error(
    'Missing required HTML elements: #status-text, #completion-text, or #habit-list'
  );
} else {
  fetchHabits();
}