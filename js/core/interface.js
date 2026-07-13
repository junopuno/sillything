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

function applyThemePack(pack) {
  const themes = {
    pastel: {
      '--ui-accent': '#ff6ec7',
      '--gradient-1': '#fff0f7',
      '--gradient-2': '#e2f7ff',
      '--page-bg': 'linear-gradient(135deg, #fff0f7 0%, #e2f7ff 55%, #fef5c3 100%)',
      '--text-dark': '#30254c',
      '--text-muted': '#6a5d8a',
      '--sidebar-bg': 'rgba(255, 255, 255, 0.9)',
      '--panel-shadow': '0 18px 40px rgba(163, 78, 255, 0.14)',
      '--panel-border': 'rgba(255, 111, 201, 0.24)'
    },
    candy: {
      '--ui-accent': '#f43f5e',
      '--gradient-1': '#ffe4f1',
      '--gradient-2': '#ffe8b5',
      '--page-bg': 'linear-gradient(135deg, #ffe4f1 0%, #ffe8b5 55%, #d9f99d 100%)',
      '--text-dark': '#4f1d3d',
      '--text-muted': '#8b4e6d',
      '--sidebar-bg': 'rgba(255, 248, 250, 0.92)',
      '--panel-shadow': '0 18px 40px rgba(244, 63, 94, 0.16)',
      '--panel-border': 'rgba(244, 63, 94, 0.24)'
    },
    cozy: {
      '--ui-accent': '#7c3aed',
      '--gradient-1': '#f5e9ff',
      '--gradient-2': '#eaf7f1',
      '--page-bg': 'linear-gradient(135deg, #f5e9ff 0%, #eaf7f1 55%, #fef3c7 100%)',
      '--text-dark': '#3d2a4f',
      '--text-muted': '#6f5b82',
      '--sidebar-bg': 'rgba(250, 247, 255, 0.92)',
      '--panel-shadow': '0 18px 40px rgba(124, 58, 237, 0.14)',
      '--panel-border': 'rgba(124, 58, 237, 0.24)'
    }
  };

  const selected = themes[pack] || themes.pastel;
  Object.entries(selected).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  document.body.classList.add('theme-transition');
  setTimeout(() => document.body.classList.remove('theme-transition'), 320);
  storage.set('alvis_theme_pack', pack);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function goHome() {
  activeIdx = null;
  activeSubId = null;
  if (typeof render === 'function') render();
}

function goPlanering() {
  activeIdx = 'planering';
  activeSubId = null;
  if (typeof render === 'function') render();
}
