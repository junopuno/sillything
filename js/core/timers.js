/* --- TICKING SYSTEMS (Clock, Countdown, Timer) --- */

// --- Global Ticking Systems ---
function runGlobalTickingSystems() {
  // SÄKERHETSSPÄRR: Om data inte har hunnit laddas in än, stoppa timern 
  // så att den inte råkar skriva över din localStorage med en tom array []
  if (!data || data.length === 0) return;

  const now = new Date();
  let changedTimeState = false;

  // Uppdatera digitala klockor och timers i dina aktiva kategorier
  if (activeIdx !== null && data[activeIdx] && data[activeIdx].widgets) {
    data[activeIdx].widgets.forEach(w => {
      if (w.type === 'clock' || w.type === 'timer' || w.type === 'pomodoro') {
        // Enkel renderingstext-triggare för klockor
        changedTimeState = true;
      }
    });
  }

  // Om tidskomponenter har ändrats, spara till ver1
  if (changedTimeState) {
    storage.set('ver1', data);
  }
}

// Starta tick-systemet en gång i sekunden
document.addEventListener('DOMContentLoaded', () => {
  setInterval(runGlobalTickingSystems, 1000);
});
function parseSecondsToTimerFace(totalSecs) {
  const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
  const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
  const secs = (totalSecs % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function parseMinutesSeconds(totalSecs) {
  const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
  const secs = (totalSecs % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function formatClockFace(w) {
  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit' };
  if (w.clockShowSeconds) options.second = '2-digit';
  options.hour12 = w.clockFormat === '12';
  return now.toLocaleTimeString('en-US', options);
}
