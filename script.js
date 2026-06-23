/*
  JavaScriptet är uppdelat i kategorier under js/.
  Den här filen finns kvar som en översikt över laddningsordningen.

  1. js/core/state.js
  2. js/core/interface.js
  3. js/core/timers.js
  4. js/render/render-engine.js
  5. js/render/inspector.js
  6. js/widgets/widget-content.js
  7. js/interaction/drag-and-resize.js
  8. js/actions/state-changers.js
  9. js/core/start.js
*/

/* --- DEVOS MAIN INITIALIZER --- */

document.addEventListener('DOMContentLoaded', () => {
  // Se till att namnet här matchar exakt funktionen i din planner-view.js
  if (typeof renderFullscreenPlanner === 'function') {
    renderFullscreenPlanner();
  } else {
    console.error("Kunde inte hitta renderFullscreenPlanner-funktionen!");
  }
});
