/* --- TICKING SYSTEMS (Clock, Countdown, Timer) --- */

function normalizeNotificationVolume(value, fallback = 0.7) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' && value.trim().endsWith('%')) {
    const percent = Number(value.trim().slice(0, -1));
    if (Number.isFinite(percent)) return Math.min(1, Math.max(0, percent / 100));
    return fallback;
  }
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(1, Math.max(0, numericValue > 1 ? numericValue / 100 : numericValue));
}

function getTimerNotificationConfig(widget) {
  return {
    sound: widget?.notificationSound || 'bell',
    volume: normalizeNotificationVolume(widget?.notificationVolume, 0.7)
  };
}

function playNotificationSound(widget) {
  const config = getTimerNotificationConfig(widget);
  if (config.sound === 'none') return;
  if (typeof window === 'undefined') return;

  if (config.sound === 'custom' && widget?.notificationAudioSrc) {
    try {
      const audio = new Audio(widget.notificationAudioSrc);
      audio.volume = config.volume;
      audio.play().catch(() => {});
      return;
    } catch (error) {
      // Fall back to synthesized sound if the browser blocks playback.
    }
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const gainNode = ctx.createGain();
  gainNode.gain.value = config.volume;
  gainNode.connect(ctx.destination);

  const oscillator = ctx.createOscillator();
  const oscillator2 = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator2.type = 'triangle';

  if (config.sound === 'bell') {
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(1320, ctx.currentTime);
  } else if (config.sound === 'chime') {
    oscillator.frequency.setValueAtTime(620, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(840, ctx.currentTime);
  } else if (config.sound === 'soft') {
    oscillator.frequency.setValueAtTime(520, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(780, ctx.currentTime);
  } else {
    oscillator.frequency.setValueAtTime(780, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(1040, ctx.currentTime);
  }

  oscillator.connect(gainNode);
  oscillator2.connect(gainNode);
  oscillator.start();
  oscillator2.start();

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(config.volume, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

  oscillator.frequency.exponentialRampToValueAtTime(config.sound === 'bell' ? 1560 : 960, now + 0.18);
  oscillator2.frequency.exponentialRampToValueAtTime(config.sound === 'bell' ? 1880 : 1220, now + 0.18);
  oscillator.stop(now + 0.35);
  oscillator2.stop(now + 0.35);
  setTimeout(() => ctx.close(), 380);
}

function runGlobalTickingSystems() {
  const now = new Date();
  const hrs = now.getHours();

  // Dynamic Greeting
  let currentGreeting = "Good Night";
  if (hrs >= 5 && hrs < 12) currentGreeting = "wake the fuck up you lazy shit";
  else if (hrs >= 12 && hrs < 17) currentGreeting = "i hope u got smth done today idiot";
  else if (hrs >= 17 && hrs < 22) currentGreeting = "do u even deserve sleep??";

  const greetingText = document.getElementById('greeting-text');
  if (greetingText && activeIdx === null) {
    greetingText.innerHTML = `${currentGreeting}>`;
  }

  let changedTimeState = false;

  data.forEach((category, categoryIndex) => {
    category.widgets.forEach((w, index) => {
      const isVisibleCategory = activeIdx === categoryIndex;
      if (w.type === 'clock') {
        const face = isVisibleCategory ? document.getElementById(`clock-face-${index}`) : null;
        if (face) {
          face.style.fontSize = normalizeCssSize(w.clockFontSize, '3.4rem');
          face.style.fontFamily = w.clockFontFamily || 'Inter, sans-serif';
          face.innerText = formatClockFace(w);
        }
      }

      if (w.type === 'countdown' && w.deadline) {
        const distance = new Date(w.deadline).getTime() - new Date().getTime();
        const face = isVisibleCategory ? document.getElementById(`count-face-${index}`) : null;
        if (face) {
          if (distance < 0) { face.innerText = "TIME OUT"; }
          else {
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            face.innerText = `${d}d ${h}h ${m}m ${s}s`;
          }
        }
        if (distance < 0 && !w.countdownAlerted) {
          w.countdownAlerted = true;
          playNotificationSound(w);
        } else if (distance >= 0) {
          w.countdownAlerted = false;
        }
      }
      if (w.type === 'timer' && w.timerRunning) {
        w.timerElapsed += 1;
        changedTimeState = true;
        const face = isVisibleCategory ? document.getElementById(`timer-face-${index}`) : null;
        if (face) face.innerText = parseSecondsToTimerFace(w.timerElapsed);
      }
      if (w.type === 'pomodoro' && w.pomodoroRunning) {
        w.pomodoroSeconds = Math.max((w.pomodoroSeconds || 0) - 1, 0);
        if (w.pomodoroSeconds === 0) {
          w.pomodoroRunning = false;
          playNotificationSound(w);
        }
        changedTimeState = true;
        const face = isVisibleCategory ? document.getElementById(`pomodoro-face-${index}`) : null;
        if (face) face.innerText = parseMinutesSeconds(w.pomodoroSeconds);
      }
    });
  });

  if (changedTimeState) storage.set('_horizon_v7', data);
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  setInterval(runGlobalTickingSystems, 1000);
}

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

if (typeof window !== 'undefined') {
  window.normalizeNotificationVolume = normalizeNotificationVolume;
  window.getTimerNotificationConfig = getTimerNotificationConfig;
  window.playNotificationSound = playNotificationSound;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeNotificationVolume, getTimerNotificationConfig, playNotificationSound };
}
 
