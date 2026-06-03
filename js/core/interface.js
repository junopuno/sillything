/* --- CORE INTERFACE SYSTEMS --- */

function toggleLeftPanel() {
  const panel = document.getElementById('left-panel');
  const openBtn = document.getElementById('left-open-btn');
  panel.classList.toggle('closed');
  panel.classList.contains('closed') ? openBtn.classList.remove('hidden') : openBtn.classList.add('hidden');
}

function toggleRightPanel() {
  const panel = document.getElementById('right-panel');
  const openBtn = document.getElementById('right-open-btn');
  panel.classList.toggle('closed');
  panel.classList.contains('closed') ? openBtn.classList.remove('hidden') : openBtn.classList.add('hidden');
}

function updateVar(name, val) {
  document.documentElement.style.setProperty(name, val);
}

function toggleThemeMenu() {
  document.getElementById('theme-sidebar').classList.toggle('open');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}
