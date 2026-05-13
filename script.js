// ------------------------------------------------------------
// Supabase connection settings
// ------------------------------------------------------------
// These values tell the app how to connect to your Supabase project.
const SUPABASE_URL = 'https://lwpzoabxiszakrkeqgms.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_WUO5mINQS4VX50X3ZhxIOw_syKnHAqV';

// Create one Supabase client that we reuse.
// window.supabase is available because of the CDN script in index.html.
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ------------------------------------------------------------
// Elements and simple app state
// ------------------------------------------------------------
const statusText = document.getElementById('status-text');
const habitList = document.getElementById('habit-list');

// Guard: stop early if required HTML elements are missing.
if (!statusText || !habitList) {
  console.error('Missing required HTML elements: #status-text or #habit-list');
}

// We only keep id + name because that is all the table has right now.
let habits = [];

// ------------------------------------------------------------
// Data function: fetch habits from Supabase
// ------------------------------------------------------------
async function fetchHabits() {
  // Clear any previous status before a new request.
  statusText.classList.remove('error');
  statusText.textContent = 'Loading habits...';

  const { data, error } = await supabaseClient
    .from('habits')
    .select('id, name')
    .order('id', { ascending: true });

  // If Supabase returns an error, show it on the page and in console.
  if (error) {
    console.error('Error loading habits:', error);
    statusText.classList.add('error');
    statusText.textContent = 'Error loading habits: ' + error.message;
    habits = [];
    renderHabits();
    return;
  }

  // Save the fetched rows in memory and render them.
  habits = data || [];
  renderHabits();

  // Friendly status text after success.
  if (habits.length === 0) {
    statusText.classList.remove('error');
    statusText.textContent = 'No habits found yet.';
  } else {
    statusText.classList.remove('error');
    statusText.textContent = 'Loaded ' + habits.length + ' habit(s).';
  }
}

// ------------------------------------------------------------
// UI function: show habit names only
// ------------------------------------------------------------
function renderHabits() {
  habitList.innerHTML = '';

  habits.forEach(function (habit) {
    const listItem = document.createElement('li');

    // We only display the habit name.
    listItem.textContent = habit.name;

    habitList.appendChild(listItem);
  });
}

// ------------------------------------------------------------
// Page startup
// ------------------------------------------------------------
// Load habits once when the page first opens.
if (statusText && habitList) {
  fetchHabits();
}
