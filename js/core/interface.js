/* --- CORE INTERFACE SYSTEMS --- */

function toggleLeftPanel () {
  const panel = document.getElementById('left-panel')
  const openBtn = document.getElementById('left-open-btn')
  panel.classList.toggle('closed')
  panel.classList.contains('closed')
    ? openBtn.classList.remove('hidden')
    : openBtn.classList.add('hidden')
}

function toggleRightPanel () {
  const panel = document.getElementById('right-panel')
  const openBtn = document.getElementById('right-open-btn')
  panel.classList.toggle('closed')
  panel.classList.contains('closed')
    ? openBtn.classList.remove('hidden')
    : openBtn.classList.add('hidden')
}

function updateVar (name, val) {
  document.documentElement.style.setProperty(name, val)
}

function toggleThemeMenu () {
  document.getElementById('theme-sidebar').classList.toggle('open')
}

function applyThemePack (pack) {
  const themes = {
    pastel: {
      '--ui-accent': '#ff6ec7',
      '--gradient-1': '#fff0f7',
      '--gradient-2': '#e2f7ff',
      '--page-bg':
        'linear-gradient(135deg, #fff0f7 0%, #e2f7ff 55%, #fef5c3 100%)',
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
      '--page-bg':
        'linear-gradient(135deg, #ffe4f1 0%, #ffe8b5 55%, #d9f99d 100%)',
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
      '--page-bg':
        'linear-gradient(135deg, #f5e9ff 0%, #eaf7f1 55%, #fef3c7 100%)',
      '--text-dark': '#3d2a4f',
      '--text-muted': '#6f5b82',
      '--sidebar-bg': 'rgba(250, 247, 255, 0.92)',
      '--panel-shadow': '0 18px 40px rgba(124, 58, 237, 0.14)',
      '--panel-border': 'rgba(124, 58, 237, 0.24)'
    }
  }

  const selected = themes[pack] || themes.pastel
  Object.entries(selected).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })

  document.body.classList.add('theme-transition')
  setTimeout(() => document.body.classList.remove('theme-transition'), 320)
  storage.set('alvis_theme_pack', pack)
}

function toggleDarkMode () {
  document.body.classList.toggle('dark-mode')
}

function goHome () {
  activeIdx = null
  activeSubId = null
  if (typeof render === 'function') render()
}

function goPlanering () {
  activeIdx = 'planering'
  activeSubId = null
  if (typeof render === 'function') render()

}


if (!window._mp3Registry) window._mp3Registry = {}

const MP3_DEFAULT_PLAYLIST = 'cute-mix-1'
const MP3_FALLBACK_COVERS = [
  '#ff8fd6',
  '#98f5ff',
  '#c9ff8a',
  '#fff36d',
  '#d8b4ff',
  '#ffb4a2'
]


// Hjälpfunktion för att plocka ut YouTube-ID från en länk
function getYouTubeId (url) {
  if (!url) return null
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// Ladda YouTube IFrame API om det inte redan är laddat
if (!window.YT) {
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  const firstScriptTag = document.getElementsByTagName('script')[0]
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
}


function getMp3Widget (widgetIndex) {
  return data[activeIdx] && data[activeIdx].widgets
    ? data[activeIdx].widgets[widgetIndex]
    : null
}

function makeMp3FallbackCover (seed = 0) {
  const color = MP3_FALLBACK_COVERS[Math.abs(seed) % MP3_FALLBACK_COVERS.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><rect width="180" height="180" rx="30" fill="url(#g)"/><circle cx="132" cy="42" r="20" fill="#fff36d" opacity=".95"/><path d="M55 116c0 10 9 18 21 18s21-8 21-18V65l36-8v48c-4-3-10-5-17-5-12 0-21 8-21 18s9 18 21 18 21-8 21-18V42L88 53v51c-4-4-11-6-18-6-9 0-15 4-15 18z" fill="#ff4fbf" stroke="#431650" stroke-width="5" stroke-linejoin="round"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function normalizeMp3Widget (widget) {
  if (!widget) return null
  if (!widget.playlists || Array.isArray(widget.playlists)) {
    widget.playlists = { [MP3_DEFAULT_PLAYLIST]: widget.tracks || [] }
  }

  const names = Object.keys(widget.playlists)
  if (names.length === 0) {
    widget.playlists[MP3_DEFAULT_PLAYLIST] = []
  }

  if (
    !widget.activePlaylistName ||
    !widget.playlists[widget.activePlaylistName]
  ) {
    widget.activePlaylistName = Object.keys(widget.playlists)[0]
  }

  Object.keys(widget.playlists).forEach((playlistName, pIdx) => {
    widget.playlists[playlistName] = (widget.playlists[playlistName] || [])
      .map((track, tIdx) => ({
        name: track.name || `Track ${tIdx + 1}`,
        srcUrl: track.srcUrl || track.url || '',
        coverImg: track.coverImg || makeMp3FallbackCover(pIdx + tIdx),
        isLocalFile: Boolean(track.isLocalFile)
      }))
      .filter(track => track.srcUrl)
  })

  const tracks = getActiveMp3Tracks(widget)
  if (
    !Number.isInteger(widget.currentTrackIndex) ||
    widget.currentTrackIndex < 0
  ) {
    widget.currentTrackIndex = 0
  }
  if (tracks.length > 0 && widget.currentTrackIndex >= tracks.length) {
    widget.currentTrackIndex = tracks.length - 1
  }
  widget.repeatMode = widget.repeatMode || 'off'
  return widget
}

function getActiveMp3Tracks (widget) {
  if (!widget || !widget.playlists || !widget.activePlaylistName) return []

  const tracks = widget.playlists[widget.activePlaylistName] || []

  // Om en sökning pågår, filtrera spåren baserat på titel
  if (widget.searchQuery && widget.searchQuery.trim() !== '') {
    const q = widget.searchQuery.toLowerCase().trim()
    return tracks.filter(t => t.name && t.name.toLowerCase().includes(q))
  }

  return tracks
}

function getOrCreateMp3Registry (widgetIndex) {
  window._mp3Registry = window._mp3Registry || {}
  let registry = window._mp3Registry[widgetIndex]

  if (!registry) {
    const audio = new Audio()
    registry = {
      audio: audio,
      ytPlayer: null,
      ytReady: false,
      isYouTube: false,
      isPlaying: false,
      progress: 0,
      duration: 0,
      lastSrc: ''
    }
    window._mp3Registry[widgetIndex] = registry

    audio.addEventListener('ended', () => handleMp3Ended(widgetIndex))
    audio.addEventListener('timeupdate', () =>
      updateMp3Progress(widgetIndex, false)
    )
    audio.addEventListener('loadedmetadata', () =>
      updateMp3Progress(widgetIndex, true)
    )
  }

  // Kontrollera om DOM-elementet finns och om spelaren behöver initieras/återskapas
  const targetEl = document.getElementById(`yt-hidden-player-${widgetIndex}`)
  if (
    targetEl &&
    (!registry.ytPlayer || !document.contains(registry.ytPlayer.getIframe?.()))
  ) {
    registry.ytReady = false

    const initYT = () => {
      if (window.YT && window.YT.Player) {
        // Töm elementet innan ny instans skapas
        targetEl.innerHTML = ''
        const container = document.createElement('div')
        targetEl.appendChild(container)

        registry.ytPlayer = new YT.Player(container, {
          height: '0',
          width: '0',
          playerVars: { autoplay: 0, controls: 0 },
          events: {
            onReady: () => {
              registry.ytReady = true
            },
            onStateChange: event => {
              if (event.data === YT.PlayerState.ENDED) {
                handleMp3Ended(widgetIndex)
              }
            }
          }
        })
      } else {
        setTimeout(initYT, 150)
      }
    }
    initYT()
  }

  return registry
}

function persistMp3Widget () {
  // 1. Spara scrollpositionen
  const trackList = document.querySelector('.tracks-list')
  const savedScroll = trackList ? trackList.scrollTop : 0

  // 2. Spara datan permanent till _horizon_v7
  // Använd både din custom storage-wrapper (om den finns) och direkt localStorage som fallback
  const dataToSave =
    typeof window._mp3WidgetsData !== 'undefined'
      ? window._mp3WidgetsData
      : typeof data !== 'undefined'
      ? data
      : null

  if (dataToSave) {
    if (typeof storage !== 'undefined' && typeof storage.set === 'function') {
      storage.set('_horizon_v7', dataToSave)
    } else {
      localStorage.setItem('_horizon_v7', JSON.stringify(dataToSave))
    }
  }

  // 3. Rita om gränssnittet
  if (typeof render === 'function') render()

  // 4. Återställ scrollen
  const newTrackList = document.querySelector('.tracks-list')
  if (newTrackList) {
    newTrackList.scrollTop = savedScroll
  }
}



function toggleShuffle (widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget) return
  widget.shuffleActive = !widget.shuffleActive
  persistMp3Widget()
}

function toggleRepeat (widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget) return
  widget.repeatMode =
    widget.repeatMode === 'one'
      ? 'all'
      : widget.repeatMode === 'all'
      ? 'off'
      : 'one'
  persistMp3Widget()
}

function nextTrack (widgetIndex, autoPlay = true) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const tracks = getActiveMp3Tracks(widget)
  if (!widget || tracks.length === 0) return

  if (widget.shuffleActive && tracks.length > 1) {
    let nextIndex = widget.currentTrackIndex
    while (nextIndex === widget.currentTrackIndex) {
      nextIndex = Math.floor(Math.random() * tracks.length)
    }
    widget.currentTrackIndex = nextIndex
  } else {
    widget.currentTrackIndex = (widget.currentTrackIndex + 1) % tracks.length
  }

  startMp3Track(widgetIndex, autoPlay)
}

function prevTrack (widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const tracks = getActiveMp3Tracks(widget)
  if (!widget || tracks.length === 0) return
  widget.currentTrackIndex =
    (widget.currentTrackIndex - 1 + tracks.length) % tracks.length
  startMp3Track(widgetIndex, true)
}

function handleMp3Ended (widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const registry = window._mp3Registry[widgetIndex]
  if (!widget || !registry) return

  if (widget.repeatMode === 'one') {
    registry.audio.currentTime = 0
    registry.audio
      .play()
      .catch(err => console.error('Playback block handled:', err))
    return
  }

  const tracks = getActiveMp3Tracks(widget)
  const isLastTrack = widget.currentTrackIndex >= tracks.length - 1
  if (widget.repeatMode === 'all' || !isLastTrack || widget.shuffleActive) {
    nextTrack(widgetIndex, true)
  } else {
    registry.isPlaying = false
    registry.progress = 100
    persistMp3Widget()
  }
}

function startMp3Track (widgetIndex, shouldPlay) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const tracks = getActiveMp3Tracks(widget)
  if (!widget || tracks.length === 0) return

  const registry = getOrCreateMp3Registry(widgetIndex)
  const track = tracks[widget.currentTrackIndex] || tracks[0]
  const ytId = getYouTubeId(track.srcUrl)
  // Inuti startMp3Track, där YouTube hanteras:
  if (ytId) {
    registry.isYouTube = true;
    registry.audio.pause();
  
    const playYT = () => {
      if (registry.ytPlayer && registry.ytReady && typeof registry.ytPlayer.loadVideoById === 'function') {
        if (registry.lastSrc !== track.srcUrl) {
          registry.ytPlayer.loadVideoById(ytId);
          registry.lastSrc = track.srcUrl;
        }
        if (shouldPlay) {
          registry.ytPlayer.playVideo();
          registry.isPlaying = true;
        } else {
          registry.ytPlayer.pauseVideo();
          registry.isPlaying = false;
        }
        if (typeof persistMp3Widget === 'function') persistMp3Widget();
      } else {
        // Vänta om spelaren inte är redo än
        setTimeout(playYT, 150);
      }
    };
    playYT();
  }
 
  else {
    // KÖR VIA VANLIG AUDIO (MP3)
    registry.isYouTube = false
    if (registry.ytPlayer && registry.ytPlayer.pauseVideo) {
      registry.ytPlayer.pauseVideo() // Stoppa YouTube
    }

    if (registry.lastSrc !== track.srcUrl) {
      registry.audio.src = track.srcUrl
      registry.lastSrc = track.srcUrl
      registry.progress = 0
    }

    if (!shouldPlay) {
      registry.audio.pause()
      registry.isPlaying = false
      persistMp3Widget()
      return
    }

    registry.audio
      .play()
      .then(() => {
        registry.isPlaying = true
        persistMp3Widget()
      })
      .catch(err => {
        registry.isPlaying = false
        console.error('Playback error:', err)
        persistMp3Widget()
      })
  }
}
function togglePlayTrack (widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const tracks = getActiveMp3Tracks(widget)
  if (!widget || tracks.length === 0) return

  const registry = getOrCreateMp3Registry(widgetIndex)

  if (registry.isYouTube) {
    // Kontrollera att YT-spelaren OCH metoden getPlayerState finns och är tillgänglig
    if (
      registry.ytPlayer &&
      typeof registry.ytPlayer.getPlayerState === 'function'
    ) {
      const state = registry.ytPlayer.getPlayerState()

      if (state === YT.PlayerState.PLAYING) {
        registry.ytPlayer.pauseVideo()
        registry.isPlaying = false
      } else {
        registry.ytPlayer.playVideo()
        registry.isPlaying = true
      }
      updatePlayButtonState(widgetIndex, registry.isPlaying)
    } else {
      // Om YT-objektet inte hunnit initiera getPlayerState än, starta via startMp3Track
      startMp3Track(widgetIndex, true)
    }
  } else {
    // Vanlig MP3-uppspelning
    if (registry.isPlaying) {
      registry.audio.pause()
      registry.isPlaying = false
      updatePlayButtonState(widgetIndex, false)
    } else {
      startMp3Track(widgetIndex, true)
    }
  }
}



function playSpecificTrack (widgetIndex, trackIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const tracks = getActiveMp3Tracks(widget)
  if (!widget || !tracks[trackIndex]) return
  widget.currentTrackIndex = trackIndex
  startMp3Track(widgetIndex, true)
}

function seekMp3Track (widgetIndex, value) {
  const registry = window._mp3Registry[widgetIndex]
  if (!registry || !Number.isFinite(registry.audio.duration)) return
  registry.audio.currentTime = registry.audio.duration * (Number(value) / 100)
  updateMp3Progress(widgetIndex, true)
}

function updateMp3Progress (widgetIndex, shouldRender) {
  const registry = window._mp3Registry[widgetIndex]
  if (!registry) return
  const audio = registry.audio
  registry.duration = Number.isFinite(audio.duration) ? audio.duration : 0
  registry.progress =
    registry.duration > 0 ? (audio.currentTime / registry.duration) * 100 : 0
  const progress = document.getElementById(`mp3-progress-${widgetIndex}`)
  if (progress && document.activeElement !== progress)
    progress.value = registry.progress
  const elapsed = document.getElementById(`mp3-time-${widgetIndex}`)
  if (elapsed)
    elapsed.textContent = `${formatMp3Time(
      audio.currentTime
    )} / ${formatMp3Time(registry.duration)}`
  if (shouldRender && typeof render === 'function') render()
}

function formatMp3Time (seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${rest}`
}

function killActiveAudioInstance (widgetIndex) {
  const registry = window._mp3Registry[widgetIndex]
  if (!registry) return
  registry.audio.pause()
  registry.isPlaying = false
  updateMp3Progress(widgetIndex, false)
}

function switchPlaylist (widgetIndex, playlistName) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget || !widget.playlists[playlistName]) return
  killActiveAudioInstance(widgetIndex)
  widget.activePlaylistName = playlistName
  widget.currentTrackIndex = 0
  persistMp3Widget()
}

function createNewPlaylist (widgetIndex) {
  const inputEl = document.getElementById(`new-playlist-input-${widgetIndex}`)
  const rawName = inputEl ? inputEl.value.trim() : ''
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget || !rawName) return
  if (!widget.playlists[rawName]) widget.playlists[rawName] = []
  widget.activePlaylistName = rawName
  widget.currentTrackIndex = 0
  if (inputEl) inputEl.value = ''
  persistMp3Widget()
}

function renamePlaylist (widgetIndex, oldName) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget || !widget.playlists[oldName]) return
  const nextName = prompt('Rename playlist', oldName)
  if (!nextName || !nextName.trim() || nextName === oldName) return
  const cleanName = nextName.trim()
  if (widget.playlists[cleanName]) {
    alert('That playlist name already exists.')
    return
  }
  widget.playlists[cleanName] = widget.playlists[oldName]
  delete widget.playlists[oldName]
  if (widget.playlistCovers && widget.playlistCovers[oldName]) {
    widget.playlistCovers[cleanName] = widget.playlistCovers[oldName]
    delete widget.playlistCovers[oldName]
  }
  if (widget.activePlaylistName === oldName)
    widget.activePlaylistName = cleanName
  persistMp3Widget()
}

function deletePlaylist (widgetIndex, playlistName, event) {
  if (event) event.stopPropagation()
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget || !widget.playlists[playlistName]) return
  if (Object.keys(widget.playlists).length <= 1) {
    widget.playlists[playlistName] = []
    widget.currentTrackIndex = 0
    killActiveAudioInstance(widgetIndex)
    persistMp3Widget()
    return
  }
  if (!confirm(`Delete playlist "${playlistName}"?`)) return
  if (widget.activePlaylistName === playlistName)
    killActiveAudioInstance(widgetIndex)
  delete widget.playlists[playlistName]
  if (widget.playlistCovers) delete widget.playlistCovers[playlistName]
  widget.activePlaylistName = Object.keys(widget.playlists)[0]
  widget.currentTrackIndex = 0
  persistMp3Widget()
}

function movePlaylist (widgetIndex, playlistName, direction, event) {
  if (event) event.stopPropagation()
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget || !widget.playlists[playlistName]) return
  const names = Object.keys(widget.playlists)
  const from = names.indexOf(playlistName)
  const to = from + direction
  if (from < 0 || to < 0 || to >= names.length) return
  names.splice(from, 1)
  names.splice(to, 0, playlistName)
  widget.playlists = names.reduce((ordered, name) => {
    ordered[name] = widget.playlists[name]
    return ordered
  }, {})
  persistMp3Widget()
}

function setPlaylistCoverFromFile (widgetIndex, playlistName, file) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget || !widget.playlists[playlistName] || !file) return
  const reader = new FileReader()
  reader.onload = () => {
    widget.playlistCovers = widget.playlistCovers || {}
    widget.playlistCovers[playlistName] = reader.result
    persistMp3Widget()
  }
  reader.readAsDataURL(file)
}

function addAudioUrlTrack (widgetIndex) {
  const urlInput = document.getElementById(`mp3-url-${widgetIndex}`)
  if (!urlInput || !urlInput.value.trim()) return

  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget) return

  let url = urlInput.value.trim()
  if (url.includes('github.com') && url.includes('/blob/')) {
    url = url
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/')
  }

  const tracks = getActiveMp3Tracks(widget)
  const ytId = getYouTubeId(url)

  let songName = `Track ${tracks.length + 1}`
  let cover = makeMp3FallbackCover(tracks.length)

  if (ytId) {
    songName = `YouTube Track (${ytId})`
    cover = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
  } else {
    try {
      const filename = url.split('?')[0].split('/').pop()
      if (filename)
        songName = decodeURIComponent(filename).replace(/\.[^/]+$/, '')
    } catch (e) {}
  }

  tracks.push({
    name: songName,
    srcUrl: url,
    coverImg: cover,
    isLocalFile: false
  })

  if (tracks.length === 1) widget.currentTrackIndex = 0
  urlInput.value = ''
  persistMp3Widget()
}


function handleLocalFileUpload (files, widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget || !files || files.length === 0) return
  const tracks = getActiveMp3Tracks(widget)
  Array.from(files).forEach((file, offset) => {
    tracks.push({
      name: file.name.replace(/\.[^/.]+$/, ''),
      srcUrl: URL.createObjectURL(file),
      coverImg: makeMp3FallbackCover(tracks.length + offset),
      isLocalFile: true
    })
  })
  if (tracks.length > 0 && widget.currentTrackIndex >= tracks.length)
    widget.currentTrackIndex = 0
  persistMp3Widget()
}

function handleMp3Upload (files, widgetIndex) {
  handleLocalFileUpload(files, widgetIndex)
}

function deleteTrack (widgetIndex, trackIndex, event) {
  if (event) event.stopPropagation()
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const tracks = getActiveMp3Tracks(widget)
  if (!widget || !tracks[trackIndex]) return
  const wasCurrent = widget.currentTrackIndex === trackIndex
  if (wasCurrent) killActiveAudioInstance(widgetIndex)
  const [removed] = tracks.splice(trackIndex, 1)
  if (removed && removed.isLocalFile) {
    try {
      URL.revokeObjectURL(removed.srcUrl)
    } catch (e) {}
  }
  if (widget.currentTrackIndex > trackIndex) widget.currentTrackIndex -= 1
  if (widget.currentTrackIndex >= tracks.length)
    widget.currentTrackIndex = Math.max(0, tracks.length - 1)
  persistMp3Widget()
}

function renameTrack (widgetIndex, trackIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const track = getActiveMp3Tracks(widget)[trackIndex]
  if (!track) return
  const nextName = prompt('Rename track', track.name || '')
  if (!nextName || !nextName.trim()) return
  track.name = nextName.trim()
  persistMp3Widget()
}

function setTrackCoverFromFile (widgetIndex, trackIndex, file) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const track = getActiveMp3Tracks(widget)[trackIndex]
  if (!track || !file) return
  const reader = new FileReader()
  reader.onload = () => {
    track.coverImg = reader.result
    persistMp3Widget()
  }
  reader.readAsDataURL(file)
}

function moveTrack (widgetIndex, trackIndex, direction, event) {
  if (event) event.stopPropagation()
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const tracks = getActiveMp3Tracks(widget)
  const to = trackIndex + direction
  if (!widget || !tracks[trackIndex] || to < 0 || to >= tracks.length) return
  const [track] = tracks.splice(trackIndex, 1)
  tracks.splice(to, 0, track)
  if (widget.currentTrackIndex === trackIndex) widget.currentTrackIndex = to
  else if (widget.currentTrackIndex === to)
    widget.currentTrackIndex = trackIndex
  persistMp3Widget()
}

function transferTrack (widgetIndex, trackIndex, targetPlaylistName) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  const sourceTracks = getActiveMp3Tracks(widget)
  if (
    !widget ||
    !sourceTracks[trackIndex] ||
    !widget.playlists[targetPlaylistName] ||
    targetPlaylistName === widget.activePlaylistName
  )
    return

  const shouldMove = confirm(
    'Move this track? Choose Cancel to duplicate it instead.'
  )
  const track = sourceTracks[trackIndex]
  const copiedTrack = { ...track }
  widget.playlists[targetPlaylistName].push(copiedTrack)
  if (shouldMove) {
    sourceTracks.splice(trackIndex, 1)
    if (widget.currentTrackIndex >= sourceTracks.length)
      widget.currentTrackIndex = Math.max(0, sourceTracks.length - 1)
  }
  persistMp3Widget()
}
function searchTracks (index, query) {
  const widget = getWidget(index)
  if (!widget) return

  widget.searchQuery = query

  if (typeof persistMp3Widget === 'function') {
    persistMp3Widget(widget)
  }

  // 1. Rendera om widgeten
  if (typeof renderWidgetBody === 'function') {
    renderWidgetBody(widget)
  } else if (typeof renderMp3Widget === 'function') {
    renderMp3Widget(widget)
  }

  // 2. Sätt tillbaka fokus och flytta markören till slutet av texten
  const searchInput = document.querySelector('input[placeholder="Sök låt..."]')
  if (searchInput) {
    searchInput.focus()
    const length = searchInput.value.length
    searchInput.setSelectionRange(length, length) // Sätter markören längst bak
  }
}





// 2. Exportera aktiv spellista till JSON-fil
function exportPlaylistJson (index) {
  const widget = getWidget(index)
  if (!widget) return

  const activeName = widget.activePlaylistName
  const playlistData = {
    playlistName: activeName,
    coverImg: widget.playlistCovers ? widget.playlistCovers[activeName] : '',
    tracks: widget.playlists[activeName] || []
  }

  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(playlistData, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute(
    'download',
    `${activeName.replace(/\s+/g, '_')}_playlist.json`
  )
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

// 3. Importera spellista från sparad JSON-fil
function importPlaylistJson (index, file) {
  if (!file) return

  const reader = new FileReader()
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result)
      const widget = getWidget(index)
      if (!widget) return

      if (!data.playlistName || !Array.isArray(data.tracks)) {
        alert('Ogiltigt JSON-format för spellista.')
        return
      }

      // Spara importerade låtar och omslag i widget-objektet
      widget.playlists[data.playlistName] = data.tracks
      if (!widget.playlistCovers) widget.playlistCovers = {}
      if (data.coverImg)
        widget.playlistCovers[data.playlistName] = data.coverImg

      widget.activePlaylistName = data.playlistName

      normalizeMp3Widget(widget)
      saveAndRender()
    } catch (err) {
      alert('Kunde inte läsa JSON-filen: ' + err.message)
    }
  }

  reader.readAsText(file)
}
// 1. Tangentbordsgenvägar (Space = Spela/Pausa, Pil Höger/Vänster = Byt låt)
document.addEventListener('keydown', e => {
  if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return

  if (e.code === 'Space') {
    e.preventDefault()
    togglePlayTrack(activeWidgetIndex)
  } else if (e.code === 'ArrowRight') {
    playNextTrack(activeWidgetIndex)
  } else if (e.code === 'ArrowLeft') {
    playPrevTrack(activeWidgetIndex)
  }
})

function setWidgetVolume (index, volumeValue) {
  const registry = window._mp3Registry && window._mp3Registry[index]
  if (registry) {
    if (registry.audio) {
      registry.audio.volume = parseFloat(volumeValue)
    }
    if (registry.ytPlayer && registry.ytPlayer.setVolume) {
      registry.ytPlayer.setVolume(parseFloat(volumeValue) * 100)
    }
  }
}


// 3. Spola i låten (Seek)
function seekWidgetTrack (index, percent) {
  const registry = window._mp3Registry && window._mp3Registry[index]
  if (registry && registry.audio && registry.audio.duration) {
    registry.audio.currentTime = (percent / 100) * registry.audio.duration
  }
}

// 4. Media Session API (Visa låt/omslag på låsskärm & hårdvaruknappar)
function updateMediaSession (track) {
  if ('mediaSession' in navigator && track) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name || 'Unknown Track',
      artist: 'MP3 Player',
      artwork: track.coverImg ? [{ src: track.coverImg }] : []
    })

    navigator.mediaSession.setActionHandler('play', () =>
      togglePlayTrack(activeWidgetIndex)
    )
    navigator.mediaSession.setActionHandler('pause', () =>
      togglePlayTrack(activeWidgetIndex)
    )
    navigator.mediaSession.setActionHandler('nexttrack', () =>
      playNextTrack(activeWidgetIndex)
    )
    navigator.mediaSession.setActionHandler('previoustrack', () =>
      playPrevTrack(activeWidgetIndex)
    )
  }
}

// 5. Favoritmarkera Låt (Hjärta)
function toggleFavoriteTrack (index, tIdx) {
  const widget = getWidget(index)
  if (!widget) return

  const activeName = widget.activePlaylistName
  const track = (widget.playlists[activeName] || [])[tIdx]
  if (!track) return

  if (!widget.playlists['Favoriter']) {
    widget.playlists['Favoriter'] = []
  }

  const favList = widget.playlists['Favoriter']
  const existingIdx = favList.findIndex(
    t => t.url === track.url && t.name === track.name
  )

  if (existingIdx >= 0) {
    favList.splice(existingIdx, 1)
  } else {
    favList.push({ ...track })
  }

  saveAndRender()
}

function getWidget(index) {
  // 1. Använd den befintliga funktionen getMp3Widget om den finns
  if (typeof getMp3Widget === 'function') {
    const w = getMp3Widget(index);
    if (w) return w;
  }

  // 2. Annars hämta direkt från ditt sparade state
  if (typeof _mp3SavedState !== 'undefined' && _mp3SavedState) {
    return typeof normalizeMp3Widget === 'function' 
      ? normalizeMp3Widget(_mp3SavedState) 
      : _mp3SavedState;
  }

  return null;
}

window.getWidget = getWidget;


function toggleTrackSelection (widgetIndex, trackIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget) return
  widget.selectedTrackIndexes = widget.selectedTrackIndexes || []
  const pos = widget.selectedTrackIndexes.indexOf(trackIndex)
  if (pos > -1) {
    widget.selectedTrackIndexes.splice(pos, 1)
  } else {
    widget.selectedTrackIndexes.push(trackIndex)
  }
  persistMp3Widget()
}

function clearTrackSelection (widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget) return
  widget.selectedTrackIndexes = []
  persistMp3Widget()
}

function deleteSelectedTracks (widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (
    !widget ||
    !widget.selectedTrackIndexes ||
    widget.selectedTrackIndexes.length === 0
  )
    return
  const activeName = widget.activePlaylistName
  let tracks = widget.playlists[activeName] || []

  // Ta bort bakifrån så indexen inte blir förskjutna
  const sorted = [...widget.selectedTrackIndexes].sort((a, b) => b - a)
  sorted.forEach(i => tracks.splice(i, 1))

  widget.selectedTrackIndexes = []
  persistMp3Widget()
}

function duplicateSelectedTracks (widgetIndex) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (
    !widget ||
    !widget.selectedTrackIndexes ||
    widget.selectedTrackIndexes.length === 0
  )
    return
  const activeName = widget.activePlaylistName
  let tracks = widget.playlists[activeName] || []

  const sorted = [...widget.selectedTrackIndexes].sort((a, b) => a - b)
  let addedOffset = 0
  sorted.forEach(i => {
    const orig = tracks[i + addedOffset]
    if (orig) {
      const copy = JSON.parse(JSON.stringify(orig))
      copy.name = `${copy.name} (Kopia)`
      tracks.splice(i + addedOffset + 1, 0, copy)
      addedOffset++
    }
  })

  widget.selectedTrackIndexes = []
  persistMp3Widget()
}

function transferSelectedTracks (widgetIndex, targetPlaylistName) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (
    !widget ||
    !widget.selectedTrackIndexes ||
    widget.selectedTrackIndexes.length === 0
  )
    return
  const activeName = widget.activePlaylistName
  if (!widget.playlists[targetPlaylistName])
    widget.playlists[targetPlaylistName] = []

  const currentTracks = widget.playlists[activeName] || []
  const sorted = [...widget.selectedTrackIndexes].sort((a, b) => a - b)

  // Kopiera alla valda till den nya listan
  sorted.forEach(i => {
    if (currentTracks[i]) {
      widget.playlists[targetPlaylistName].push(
        JSON.parse(JSON.stringify(currentTracks[i]))
      )
    }
  })

  // Radera dem från den nuvarande listan
  deleteSelectedTracks(widgetIndex)
}

function copySelectedTracksToPlaylist (widgetIndex, targetPlaylistName) {
  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (
    !widget ||
    !widget.selectedTrackIndexes ||
    widget.selectedTrackIndexes.length === 0
  )
    return

  const activeName = widget.activePlaylistName
  if (!widget.playlists[targetPlaylistName])
    widget.playlists[targetPlaylistName] = []

  const currentTracks = widget.playlists[activeName] || []
  const sorted = [...widget.selectedTrackIndexes].sort((a, b) => a - b)

  // Kopiera alla markerade låtar till mål-spellistan utan att radera från nuvarande
  sorted.forEach(i => {
    if (currentTracks[i]) {
      widget.playlists[targetPlaylistName].push(
        JSON.parse(JSON.stringify(currentTracks[i]))
      )
    }
  })

  // Rensa markeringen efter kopiering
  widget.selectedTrackIndexes = []
  persistMp3Widget()
}

let draggedTrackIndex = null

// När du börjar dra en låt
function handleTrackDragStart (event, widgetIndex, trackIndex) {
  draggedTrackIndex = trackIndex
  event.dataTransfer.effectAllowed = 'move'
  event.target.classList.add('is-dragging')
}

// Tillåt att släppa över andra rader
function handleTrackDragOver (event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

// När du släpper låten på ett nytt index
function handleTrackDrop (event, widgetIndex, targetTrackIndex) {
  event.preventDefault()
  event.stopPropagation()

  if (draggedTrackIndex === null || draggedTrackIndex === targetTrackIndex)
    return

  const widget = normalizeMp3Widget(getMp3Widget(widgetIndex))
  if (!widget) return

  const activeName = widget.activePlaylistName
  const tracks = widget.playlists[activeName] || []

  // Ta bort låten från ursprungspositionen och stoppa in den på den nya
  const [movedTrack] = tracks.splice(draggedTrackIndex, 1)
  tracks.splice(targetTrackIndex, 0, movedTrack)

  // Om den spelande låten flyttades, uppdatera currentIndex
  if (widget.currentIndex === draggedTrackIndex) {
    widget.currentIndex = targetTrackIndex
  } else if (
    widget.currentIndex > draggedTrackIndex &&
    widget.currentIndex <= targetTrackIndex
  ) {
    widget.currentIndex--
  } else if (
    widget.currentIndex < draggedTrackIndex &&
    widget.currentIndex >= targetTrackIndex
  ) {
    widget.currentIndex++
  }

  draggedTrackIndex = null
  persistMp3Widget()
}

