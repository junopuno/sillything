if (typeof render === 'function' && typeof updateMenuActiveStates === 'function') {
  render();
  updateMenuActiveStates();
} else {
  console.error('Render or updateMenuActiveStates not defined yet');
  window.addEventListener('load', () => {
    if (typeof render === 'function') render();
    if (typeof updateMenuActiveStates === 'function') updateMenuActiveStates();
  });
}
 