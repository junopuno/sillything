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

if (!window._mp3Registry) window._mp3Registry = {};

// 1. ADVANCED FILE UPLOADER WITH IMAGE ART CORRECTION
function handleMp3Upload(files, widgetIndex) {
  if (!files || files.length === 0) return;

  const widget = data[activeIdx].widgets[widgetIndex];
  if (!widget.tracks) widget.tracks = [];

  let loadedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const objectUrl = URL.createObjectURL(file);

    // Assign cute color palette options as visual art bases dynamically
    const cuteFallbacks = ['#ffd1dc', '#dcfce7', '#fef3c7', '#e0e7ff', '#f3e8ff'];
    const selectedColor = cuteFallbacks[Math.floor(Math.random() * cuteFallbacks.length)];
    const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%25' height='100%25' fill='${encodeURIComponent(selectedColor)}'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='40'>🎵</text></svg>`;

    const newTrack = {
      name: file.name.replace(/\.[^/.]+$/, ""),
      srcUrl: objectUrl,
      coverImg: fallbackSvg // Defaults to colored background notes
    };

    widget.tracks.push(newTrack);

    // Background extraction attempt for embedded Cover Art (No external libs needed)
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const buffer = e.target.result;
        const dv = new DataView(buffer);
        // Look for ID3v2 tags header at base index
        if (dv.getUint8(0) === 0x49 && dv.getUint8(1) === 0x44 && dv.getUint8(2) === 0x33) {
          // Local storage parser can safely be added here if advanced artwork scanning is requested later
        }
      } catch (err) { console.log("Art parse skipped, using default styling profile"); }
    };
    reader.readAsArrayBuffer(file);
    loadedCount++;
  }

  if ((!widget.currentTrackIndex && widget.currentTrackIndex !== 0) || widget.currentTrackIndex >= widget.tracks.length) {
    widget.currentTrackIndex = 0;
  }

  if (typeof render === 'function') render();
}

// 2. DYNAMIC SHUFFLE STATE CONTROLLER
function toggleShuffle(widgetIndex) {
  const widget = data[activeIdx].widgets[widgetIndex];
  widget.shuffleActive = !widget.shuffleActive;
  if (typeof render === 'function') render();
}

// 3. REMOVE TRACK SYSTEM
function deleteTrack(widgetIndex, trackIndex, event) {
  if (event) event.stopPropagation(); // Avoid tracking triggers on outer list elements

  const widget = data[activeIdx].widgets[widgetIndex];
  if (!widget.tracks) return;

  // Clean runtime pointers if the deleted track is currently selected or playing
  const registry = window._mp3Registry[widgetIndex];
  if (widget.currentTrackIndex === trackIndex && registry && registry.isPlaying) {
    registry.audio.pause();
    registry.isPlaying = false;
  }

  // Revoke the blob allocation from memory to prevent leaks
  try { URL.revokeObjectURL(widget.tracks[trackIndex].srcUrl); } catch (e) { }

  widget.tracks.splice(trackIndex, 1);

  // Correct position references inside state arrays
  if (widget.currentTrackIndex >= widget.tracks.length) {
    widget.currentTrackIndex = Math.max(0, widget.tracks.length - 1);
  }

  // Hot swap data pipes if active song was targeted
  if (registry && widget.tracks.length > 0 && widget.currentTrackIndex === trackIndex) {
    registry.audio.src = widget.tracks[widget.currentTrackIndex].srcUrl;
  }

  if (typeof render === 'function') render();
}

// 4. NEXT TRACK WITH SHUFFLE ROUTER
function nextTrack(widgetIndex) {
  const widget = data[activeIdx].widgets[widgetIndex];
  if (!widget.tracks || widget.tracks.length === 0) return;

  if (widget.shuffleActive && widget.tracks.length > 1) {
    let randomIndex = widget.currentTrackIndex;
    while (randomIndex === widget.currentTrackIndex) {
      randomIndex = Math.floor(Math.random() * widget.tracks.length);
    }
    widget.currentTrackIndex = randomIndex;
  } else {
    widget.currentTrackIndex = ((widget.currentTrackIndex || 0) + 1) % widget.tracks.length;
  }

  killActiveAudioInstance(widgetIndex);
  togglePlayTrack(widgetIndex);
}

// 5. PREVIOUS TRACK WITH SHUFFLE ROUTER
function prevTrack(widgetIndex) {
  const widget = data[activeIdx].widgets[widgetIndex];
  if (!widget.tracks || widget.tracks.length === 0) return;

  if (widget.shuffleActive && widget.tracks.length > 1) {
    let randomIndex = widget.currentTrackIndex;
    while (randomIndex === widget.currentTrackIndex) {
      randomIndex = Math.floor(Math.random() * widget.tracks.length);
    }
    widget.currentTrackIndex = randomIndex;
  } else {
    widget.currentTrackIndex = ((widget.currentTrackIndex || 0) - 1 + widget.tracks.length) % widget.tracks.length;
  }

  killActiveAudioInstance(widgetIndex);
  togglePlayTrack(widgetIndex);
}

// 6. TOGGLE PLAY STREAMS
function togglePlayTrack(widgetIndex) {
  const widget = data[activeIdx].widgets[widgetIndex];
  if (!widget.tracks || widget.tracks.length === 0) return;

  let registry = window._mp3Registry[widgetIndex];
  if (!registry) {
    registry = { audio: new Audio(), isPlaying: false };
    window._mp3Registry[widgetIndex] = registry;
    registry.audio.addEventListener('ended', () => nextTrack(widgetIndex));
  }

  const track = widget.tracks[widget.currentTrackIndex || 0];
  if (registry.audio.src !== track.srcUrl) {
    registry.audio.src = track.srcUrl;
  }

  if (registry.isPlaying) {
    registry.audio.pause();
    registry.isPlaying = false;
    if (typeof render === 'function') render();
  } else {
    registry.audio.play().then(() => {
      registry.isPlaying = true;
      if (typeof render === 'function') render();
    }).catch(err => console.error("Playback block handled:", err));
  }
}

function playSpecificTrack(widgetIndex, trackIndex) {
  const widget = data[activeIdx].widgets[widgetIndex];
  widget.currentTrackIndex = trackIndex;
  killActiveAudioInstance(widgetIndex);
  togglePlayTrack(widgetIndex);
}

function killActiveAudioInstance(widgetIndex) {
  const registry = window._mp3Registry[widgetIndex];
  if (registry) {
    registry.audio.pause();
    registry.isPlaying = false;
  }
}