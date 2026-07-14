if (typeof render === 'function' && typeof updateMenuActiveStates === 'function') {
  const savedTheme = storage.get('alvis_theme_pack', 'pastel');
  if (savedTheme) {
    applyThemePack(savedTheme);
    const picker = document.getElementById('theme-pack-picker');
    if (picker) picker.value = savedTheme;
  }
  render();
  updateMenuActiveStates();
} else {
  console.error('Render or updateMenuActiveStates not defined yet');
  window.addEventListener('load', () => {
    if (typeof render === 'function') render();
    if (typeof updateMenuActiveStates === 'function') updateMenuActiveStates();
  });
}

