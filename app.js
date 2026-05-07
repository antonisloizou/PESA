const titleEl = document.getElementById('title');
const notesEl = document.getElementById('notes');
const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('status');

const STORAGE_KEY = 'pesa_planner_draft';

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const data = JSON.parse(raw);
  titleEl.value = data.title || '';
  notesEl.value = data.notes || '';
  statusEl.textContent = 'Loaded local draft';
}

function save() {
  const payload = {
    title: titleEl.value,
    notes: notesEl.value,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  statusEl.textContent = `Saved locally at ${new Date().toLocaleTimeString()}`;
}

saveBtn.addEventListener('click', save);
load();
