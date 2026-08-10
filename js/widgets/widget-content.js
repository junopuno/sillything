/* --- WIDGET CONTENT GENERATORS --- */

function renderWidgetBody(w, i) {
  switch (w.type) {
    case 'list': return renderSmartTaskList(w, i);
    case 'board': return renderTaskBoard(w, i);
    case 'checklist': return renderChecklist(w, i);
    case 'clock': return renderClock(w, i);
    case 'countdown': return renderCountdown(w, i);
    case 'timer': return renderTimer(w, i);
    case 'pomodoro': return renderPomodoro(w, i);
    case 'spotify': return renderSpotify(w, i);
    case 'calendar': return parseHtmlCalendarBlock(w.style?.textCol);
    case 'schedule': return renderSchedule(w, i);
    case 'links': return renderLinks(w, i);
    case 'habits': return renderHabits(w, i);
    case 'youtube': return renderYoutube(w, i);
    case 'image': return renderImageCover(w, i);
    case 'calculator': return renderCalculator(w, i);
    case 'graph': return renderGraphWidget(w, i);
    case 'media': return renderMedia(w, i);
    case 'goals': return renderGoals(w, i);
    case 'journal': return renderJournal(w, i);
    case 'quote': return renderQuote(w, i);
    case 'mood': return renderMood(w, i);
    case 'mp3':
    case 'mp3player': return renderMp3PlayerMarkup(w, i);
    default: return `<textarea onchange="updateWidgetProp(${i},'content',this.value)" class="plain-note">${escapeHtml(w.content || '')}</textarea>`;
  }
}

function renderSmartTaskList(w, i) {
  const query = (w.query || '').toLowerCase();
  const filter = w.filter || 'all';
  const tasks = (w.tasks || []).map((task, originalIndex) => ({ ...normalizeTask(task), originalIndex })).filter(task => {
    const matchesQuery = !query || `${task.text} ${task.note} ${task.tags}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || task.status === filter || task.priority === filter || (filter === 'overdue' && task.deadline && new Date(task.deadline) < startOfToday() && !task.done);
    return matchesQuery && matchesFilter;
  });

  return `
    <div class="task-toolbar">
      <input type="search" value="${escapeHtml(w.query || '')}" placeholder="Search tasks" oninput="updateWidgetProp(${i},'query',this.value)">
      <select onchange="updateWidgetProp(${i},'filter',this.value)">
        ${['all','todo','doing','done','high','medium','low','overdue'].map(option => `<option value="${option}" ${filter === option ? 'selected' : ''}>${option}</option>`).join('')}
      </select>
    </div>
    <div class="list-widget">
        ${tasks.map(task => renderTaskRow(task, i, task.originalIndex)).join('')}
      <div class="add-task-row">
        <input type="text" id="t-in-${i}" placeholder="+ Add task" onkeydown="if(event.key==='Enter')addTask(${i})">
        <button class="workspace-btn" onclick="addTask(${i})">Add</button>
      </div>
    </div>`;
}

function renderTaskRow(task, wi, ti) {
  const overdue = task.deadline && !task.done && new Date(task.deadline) < startOfToday();
  return `
    <div class="task-composite-row ${overdue ? 'is-overdue' : ''}">
      <div class="task-main-line">
        <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${wi},${ti})">
        <input class="task-title-input" type="text" value="${escapeHtml(task.text)}" onchange="updateTaskSub(${wi},${ti},'text',this.value)">
        <span class="priority-pill ${task.priority}">${escapeHtml(priorityLabels[task.priority] || task.priority)}</span>
        <button class="del-btn" onclick="deleteTask(${wi},${ti})"><i class="fas fa-trash"></i></button>
      </div>
      <div class="task-extended-inputs">
        <div class="task-meta-grid">
          <select onchange="updateTaskSub(${wi},${ti},'status',this.value)">
            ${taskStatuses.map(status => `<option value="${status}" ${task.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
          <select onchange="updateTaskSub(${wi},${ti},'priority',this.value)">
            ${Object.keys(priorityLabels).map(priority => `<option value="${priority}" ${task.priority === priority ? 'selected' : ''}>${priorityLabels[priority]}</option>`).join('')}
          </select>
          <input type="date" value="${escapeHtml(task.deadline || '')}" onchange="updateTaskSub(${wi},${ti},'deadline',this.value)">
        </div>
        <input type="text" value="${escapeHtml(task.tags || '')}" placeholder="Tags: school, home, urgent" onchange="updateTaskSub(${wi},${ti},'tags',this.value)">
        <input type="text" value="${escapeHtml(task.note || '')}" placeholder="Note..." onchange="updateTaskSub(${wi},${ti},'note',this.value)">
      </div>
    </div>`;
}

function renderTaskBoard(w, i) {
  return `
    <div class="board-grid">
      ${taskStatuses.map(status => `
        <section class="board-column">
          <h5>${status}</h5>
          ${(w.tasks || []).map((task, originalIndex) => ({ ...normalizeTask(task), originalIndex })).filter(task => task.status === status).map(task => {
            const ti = task.originalIndex;
            return `<button class="board-card ${task.priority}" onclick="cycleTaskStatus(${i},${ti})">
              <strong>${escapeHtml(task.text)}</strong>
              <span>${escapeHtml(task.deadline || 'No deadline')}</span>
            </button>`;
          }).join('')}
        </section>`).join('')}
    </div>
    <div class="add-task-row">
      <input type="text" id="t-in-${i}" placeholder="+ Add board task" onkeydown="if(event.key==='Enter')addTask(${i})">
      <button class="workspace-btn" onclick="addTask(${i})">Add</button>
    </div>`;
}

function renderChecklist(w, i) {
  return `
    <div class="checklist-container">
      ${w.checkItems.map((item, ci) => `
        <div class="checklist-row">
          <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleCheckItem(${i}, ${ci})">
          <input type="text" class="checklist-text" value="${escapeHtml(item.text)}" onchange="updateCheckItemText(${i}, ${ci}, this.value)">
          <button class="item-del-btn" onclick="deleteCheckItem(${i}, ${ci})"><i class="fas fa-times"></i></button>
        </div>`).join('')}
      <button class="workspace-btn" onclick="addCheckItem(${i})" style="font-size:0.7rem; padding:2px;">+ Item</button>
    </div>`;
}

function renderCountdown(w, i) {
  return `
    <div class="time-widget-stack">
      <input type="datetime-local" value="${escapeHtml(w.deadline || '')}" onchange="updateWidgetProp(${i},'deadline',this.value)">
      <div id="count-face-${i}" class="digital-clock-face">${w.deadline ? 'Loading...' : 'Set deadline'}</div>
      <div class="clock-options-grid">
        <label>
          Sound
          <select onchange="updateWidgetProp(${i},'notificationSound',this.value)">
            <option value="bell" ${w.notificationSound === 'bell' ? 'selected' : ''}>Actual bell</option>
            <option value="soft" ${w.notificationSound === 'soft' ? 'selected' : ''}>Soft</option>
            <option value="chime" ${w.notificationSound === 'chime' ? 'selected' : ''}>Chime</option>
            <option value="ding" ${w.notificationSound === 'ding' ? 'selected' : ''}>Ding</option>
            <option value="pulse" ${w.notificationSound === 'pulse' ? 'selected' : ''}>Pulse</option>
            <option value="custom" ${w.notificationSound === 'custom' ? 'selected' : ''}>Custom audio</option>
            <option value="none" ${w.notificationSound === 'none' ? 'selected' : ''}>None</option>
          </select>
        </label>
        <label>
          Volume
          <input type="range" min="0" max="100" step="1" value="${Math.round(normalizeNotificationVolume(w.notificationVolume, 0.7) * 100)}" onchange="updateWidgetProp(${i},'notificationVolume',this.value)">
        </label>
        <label class="sound-upload-field">
          <span>${w.notificationAudioName ? `Custom: ${escapeHtml(w.notificationAudioName)}` : 'Upload custom sound'}</span>
          <input type="file" accept="audio/*" onchange="setNotificationSoundFile(${i}, this.files[0])">
          ${w.notificationAudioSrc ? `<button type="button" class="time-mini-btn" onclick="clearNotificationSoundFile(${i})">Remove</button>` : ''}
        </label>
      </div>
    </div>`;
}

function renderClock(w, i) {
  const clockFontSize = normalizeCssSize(w.clockFontSize, '3.4rem');
  const clockText = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: w.clockShowSeconds ? '2-digit' : undefined,
    hour12: w.clockFormat === '12'
    
  });

  return `
    <div class="time-widget-stack clock-widget">
      <div id="clock-face-${i}" class="digital-clock-face live-clock-face" style="font-size:${escapeHtml(clockFontSize)}; font-family:${escapeHtml(w.clockFontFamily)}">${escapeHtml(clockText)}</div>
      <div class="clock-options-grid">
        <label>
          Font size
          <input type="text" value="${escapeHtml(clockFontSize)}" placeholder="e.g. 42px, 5rem" onchange="updateWidgetProp(${i},'clockFontSize',this.value)">
        </label>
        <label>
          Font
          <select onchange="updateWidgetProp(${i},'clockFontFamily',this.value)">
            <option value="Inter, sans-serif" ${w.clockFontFamily === 'Inter, sans-serif' ? 'selected' : ''}>Inter</option>
            <option value="'Comic Neue', sans-serif" ${w.clockFontFamily === "'Comic Neue', sans-serif" ? 'selected' : ''}>Comic Neue</option>
            <option value="'Space Mono', monospace" ${w.clockFontFamily === "'Space Mono', monospace" ? 'selected' : ''}>Space Mono</option>
            <option value="cursive" ${w.clockFontFamily === 'cursive' ? 'selected' : ''}>Cursive</option>
          </select>
        </label>
        <label>
          Format
          <select onchange="updateWidgetProp(${i},'clockFormat',this.value)">
            <option value="24" ${w.clockFormat === '24' ? 'selected' : ''}>24h</option>
            <option value="12" ${w.clockFormat === '12' ? 'selected' : ''}>12h</option>
          </select>
        </label>
        <label class="clock-toggle-row">
          <span>Seconds</span>
          <input type="checkbox" ${w.clockShowSeconds ? 'checked' : ''} onchange="updateWidgetProp(${i},'clockShowSeconds',this.checked)">
        </label>
      </div>
    </div>`;
}

function renderTimer(w, i) {
  const timerFontSize = normalizeCssSize(w.timerFontSize, '3.4rem');
  return `
    <div class="time-widget-stack">
      <div id="timer-face-${i}" class="digital-clock-face" style="font-size:${escapeHtml(timerFontSize)}">${parseSecondsToTimerFace(w.timerElapsed || 0)}</div>
      <div class="time-btn-cluster">
        <button class="time-mini-btn" onclick="triggerTimerState(${i},'toggle')">${w.timerRunning ? 'Pause' : 'Start'}</button>
        <button class="time-mini-btn" onclick="triggerTimerState(${i},'clear')">Reset</button>
      </div>
      <div class="clock-options-grid">
        <label>
          Text size
          <input type="text" value="${escapeHtml(timerFontSize)}" placeholder="e.g. 42px, 5rem" onchange="updateWidgetProp(${i},'timerFontSize',this.value)">
        </label>
        <label>
          Sound
          <select onchange="updateWidgetProp(${i},'notificationSound',this.value)">
            <option value="bell" ${w.notificationSound === 'bell' ? 'selected' : ''}>Actual bell</option>
            <option value="soft" ${w.notificationSound === 'soft' ? 'selected' : ''}>Soft</option>
            <option value="chime" ${w.notificationSound === 'chime' ? 'selected' : ''}>Chime</option>
            <option value="ding" ${w.notificationSound === 'ding' ? 'selected' : ''}>Ding</option>
            <option value="pulse" ${w.notificationSound === 'pulse' ? 'selected' : ''}>Pulse</option>
            <option value="custom" ${w.notificationSound === 'custom' ? 'selected' : ''}>Custom audio</option>
            <option value="none" ${w.notificationSound === 'none' ? 'selected' : ''}>None</option>
          </select>
        </label>
        <label>
          Volume
          <input type="range" min="0" max="100" step="1" value="${Math.round(normalizeNotificationVolume(w.notificationVolume, 0.7) * 100)}" onchange="updateWidgetProp(${i},'notificationVolume',this.value)">
        </label>
        <label class="sound-upload-field">
          <span>${w.notificationAudioName ? `Custom: ${escapeHtml(w.notificationAudioName)}` : 'Upload custom sound'}</span>
          <input type="file" accept="audio/*" onchange="setNotificationSoundFile(${i}, this.files[0])">
          ${w.notificationAudioSrc ? `<button type="button" class="time-mini-btn" onclick="clearNotificationSoundFile(${i})">Remove</button>` : ''}
        </label>
      </div>
    </div>`;
}

function renderPomodoro(w, i) {
  const pomodoroFontSize = normalizeCssSize(w.pomodoroFontSize, '3.4rem');
  return `
    <div class="time-widget-stack">
      <div id="pomodoro-face-${i}" class="digital-clock-face" style="font-size:${escapeHtml(pomodoroFontSize)}">${parseMinutesSeconds(w.pomodoroSeconds || 0)}</div>
      <div class="time-btn-cluster">
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'toggle')">${w.pomodoroRunning ? 'Pause' : 'Start'}</button>
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'add15')">15m</button>
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'add30')">30m</button>
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'add60')">60m</button>
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'reset')">Reset</button>
      </div>
      <div class="clock-options-grid">
        <label>
          Text size
          <input type="text" value="${escapeHtml(pomodoroFontSize)}" placeholder="e.g. 42px, 5rem" onchange="updateWidgetProp(${i},'pomodoroFontSize',this.value)">
        </label>
        <label>
          Sound
          <select onchange="updateWidgetProp(${i},'notificationSound',this.value)">
            <option value="bell" ${w.notificationSound === 'bell' ? 'selected' : ''}>Actual bell</option>
            <option value="soft" ${w.notificationSound === 'soft' ? 'selected' : ''}>Soft</option>
            <option value="chime" ${w.notificationSound === 'chime' ? 'selected' : ''}>Chime</option>
            <option value="ding" ${w.notificationSound === 'ding' ? 'selected' : ''}>Ding</option>
            <option value="pulse" ${w.notificationSound === 'pulse' ? 'selected' : ''}>Pulse</option>
            <option value="custom" ${w.notificationSound === 'custom' ? 'selected' : ''}>Custom audio</option>
            <option value="none" ${w.notificationSound === 'none' ? 'selected' : ''}>None</option>
          </select>
        </label>
        <label>
          Volume
          <input type="range" min="0" max="100" step="1" value="${Math.round(normalizeNotificationVolume(w.notificationVolume, 0.7) * 100)}" onchange="updateWidgetProp(${i},'notificationVolume',this.value)">
        </label>
        <label class="sound-upload-field">
          <span>${w.notificationAudioName ? `Custom: ${escapeHtml(w.notificationAudioName)}` : 'Upload custom sound'}</span>
          <input type="file" accept="audio/*" onchange="setNotificationSoundFile(${i}, this.files[0])">
          ${w.notificationAudioSrc ? `<button type="button" class="time-mini-btn" onclick="clearNotificationSoundFile(${i})">Remove</button>` : ''}
        </label>
      </div>
    </div>`;
}

function getSpotifyEmbedUrl(rawUrl = '') {
  const cleanUrl = String(rawUrl || '').trim();
  if (!cleanUrl) return '';
  try {
    const parsed = new URL(cleanUrl);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const type = parts[0] === 'playlist' || parts[0] === 'album' || parts[0] === 'track' ? parts[0] : null;
    const id = parts[1] || '';
    if (!type || !id) return '';
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch (error) {
    return '';
  }
}

function renderSpotify(w, i) {
  const embedUrl = getSpotifyEmbedUrl(w.spotifyUrl || '');
  return `
    <div class="spotify-widget">
      <input type="url" value="${escapeHtml(w.spotifyUrl || '')}" placeholder="Paste a Spotify playlist or song URL" onchange="updateWidgetProp(${i},'spotifyUrl',this.value)">
      ${embedUrl ? `
        <iframe class="spotify-frame" src="${embedUrl}" title="Spotify player" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      ` : `
        <div class="embed-empty-state"><i class="fab fa-spotify"></i><span>Paste a Spotify playlist or song link above</span></div>
      `}
    </div>`;
}

function renderSchedule(w, i) {
  return `
    <div class="schedule-container">
      ${w.schedItems.map((row, ri) => `
        <div class="schedule-row">
          <input type="text" class="schedule-time-lbl" value="${escapeHtml(row.hour)}" onchange="updateScheduleHour(${i},${ri},this.value)">
          <input type="text" class="schedule-input" value="${escapeHtml(row.task)}" onchange="updateScheduleTask(${i},${ri},this.value)">
          <button class="row-del-btn" onclick="deleteScheduleRow(${i},${ri})"><i class="fas fa-times"></i></button>
        </div>`).join('')}
      <button class="workspace-btn" onclick="addScheduleRow(${i})" style="font-size:0.7rem;">+ Slot</button>
    </div>`;
}

function renderLinks(w, i) {
  return `
    <div class="links-deck-wrapper">
      ${w.links.map((link, li) => `
        <div class="link-anchor-row">
          <a href="${escapeHtml(link.url)}" target="_blank">${escapeHtml(link.label || link.url)}</a>
          <button class="del-btn" onclick="deleteLink(${i},${li})"><i class="fas fa-trash"></i></button>
        </div>`).join('')}
      <input type="text" id="link-label-${i}" placeholder="Link name" style="margin-top:8px;">
      <input type="text" id="link-url-${i}" placeholder="https://example.com">
      <button class="workspace-btn" onclick="addLink(${i})" style="font-size:0.7rem;">+ Link</button>
    </div>`;
}

function renderHabits(w, i) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return `
    <div class="habit-table">
      ${w.habits.map((habit, hi) => `
        <div class="habit-row">
          <input type="text" value="${escapeHtml(habit.name)}" onchange="updateHabitName(${i},${hi},this.value)">
          <div class="habit-days">
            ${days.map((day, di) => `<button class="${habit.days?.[di] ? 'active' : ''}" onclick="toggleHabitDay(${i},${hi},${di})">${day}</button>`).join('')}
          </div>
        </div>`).join('')}
      <button class="workspace-btn" onclick="addHabit(${i})" style="font-size:0.7rem;">+ Habit</button>
    </div>`;
}

function renderGoals(w, i) {
  const percent = w.goalTarget ? Math.min(Math.round((w.goalCurrent / w.goalTarget) * 100), 100) : 0;
  return `
    <div class="goal-meter-widget">
      <strong>${w.goalCurrent || 0}/${w.goalTarget || 0}</strong>
      <div class="goal-meter-track"><span style="width:${percent}%"></span></div>
      <label>Current</label>
      <input type="number" value="${w.goalCurrent || 0}" onchange="updateWidgetProp(${i},'goalCurrent',Number(this.value))">
      <label>Target</label>
      <input type="number" value="${w.goalTarget || 1}" onchange="updateWidgetProp(${i},'goalTarget',Number(this.value))">
    </div>`;
}

function renderJournal(w, i) {
  return `
    <div class="journal-widget">
      <select onchange="updateWidgetProp(${i},'journalMood',this.value)">
        <option value="cozy" ${w.journalMood === 'cozy' ? 'selected' : ''}>Cozy</option>
        <option value="dreamy" ${w.journalMood === 'dreamy' ? 'selected' : ''}>Dreamy</option>
        <option value="bright" ${w.journalMood === 'bright' ? 'selected' : ''}>Bright</option>
      </select>
      <textarea class="journal-textarea" onchange="updateWidgetProp(${i},'journalText',this.value)">${escapeHtml(w.journalText || '')}</textarea>
    </div>`;
}

function renderQuote(w, i) {
  return `
    <div class="quote-widget">
      <textarea class="quote-textarea" onchange="updateWidgetProp(${i},'quoteText',this.value)">${escapeHtml(w.quoteText || '')}</textarea>
      <input type="text" value="${escapeHtml(w.quoteAuthor || '')}" placeholder="Author" onchange="updateWidgetProp(${i},'quoteAuthor',this.value)">
    </div>`;
}

function renderMood(w, i) {
  return `
    <div class="mood-widget">
      <select onchange="updateWidgetProp(${i},'mood',this.value)">
        <option value="sparkly" ${w.mood === 'sparkly' ? 'selected' : ''}>Sparkly</option>
        <option value="calm" ${w.mood === 'calm' ? 'selected' : ''}>Calm</option>
        <option value="focus" ${w.mood === 'focus' ? 'selected' : ''}>Focus</option>
      </select>
      <select onchange="updateWidgetProp(${i},'ambience',this.value)">
        <option value="soft" ${w.ambience === 'soft' ? 'selected' : ''}>Soft ambience</option>
        <option value="rain" ${w.ambience === 'rain' ? 'selected' : ''}>Rain</option>
        <option value="cafe" ${w.ambience === 'cafe' ? 'selected' : ''}>Cafe</option>
      </select>
      <div class="mood-pill">${escapeHtml(w.mood || 'sparkly')} · ${escapeHtml(w.ambience || 'soft')}</div>
    </div>`;
}

function renderYoutube(w, i) {
  const youtubeUrl = w.youtubeUrl || w.embedUrl || '';
  const videoId = parseYoutubeVideoId(youtubeUrl);
  const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1` : '';
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';

  return `
    <div class="youtube-widget">
      <input type="url" value="${escapeHtml(youtubeUrl)}" placeholder="Paste a YouTube link" onchange="updateWidgetProp(${i},'youtubeUrl',this.value)">
      ${embedUrl ? `
        <iframe class="youtube-frame" data-video-id="${escapeHtml(videoId)}" src="${embedUrl}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
        <a class="youtube-fallback-link" href="${watchUrl}" target="_blank" rel="noopener">Open on YouTube</a>
      ` : `
        <div class="embed-empty-state"><i class="fab fa-youtube"></i><span>Paste a YouTube link above</span></div>
      `}
    </div>`;
}

function renderImageCover(w, i) {
  if (!w.imageSrc) {
    return `
      <div class="image-cover-widget empty">
        <label class="image-cover-upload">
          <i class="fas fa-image"></i>
          <span>Upload a PNG or transparent image</span>
          <input type="file" accept="image/*" onchange="setImageCoverFile(${i}, this.files[0])">
        </label>
        <input class="image-cover-url" type="url" value="${escapeHtml(w.imageSrc?.startsWith('data:') ? '' : (w.imageSrc || ''))}" placeholder="Or paste image URL" onchange="setImageCoverUrl(${i}, this.value)">
        <button class="image-action-btn image-action-delete" onclick="delWid(${i})"><i class="fas fa-trash"></i> Delete widget</button>
      </div>`;
  }

  return `
    <div class="image-cover-widget has-image">
      <img src="${escapeHtml(w.imageSrc)}" alt="${escapeHtml(w.imageName || 'Image')}" />
      <div class="image-actions">
        <label class="image-action-btn">
          <i class="fas fa-image"></i>
          Replace
          <input type="file" accept="image/*" onchange="setImageCoverFile(${i}, this.files[0])">
        </label>
          <button class="image-action-btn" onclick="clearImageCover(${i})"><i class="fas fa-trash"></i> Clear</button>
      </div>
    </div>`;
}

function renderMedia(w, i) {
  return `
    <div class="media-widget">
      <label class="media-upload-zone">
        <i class="fas fa-cloud-arrow-up"></i>
        <span>Upload files or videos</span>
        <input type="file" accept="image/*,video/*" multiple onchange="addMediaFiles(${i}, this.files)">
      </label>
      <div class="media-grid">
        ${(w.mediaItems || []).map((item, mi) => `
          <div class="media-card">
            ${item.type?.startsWith('video') ? `
              <video src="${item.src}" controls></video>
            ` : `
              <img src="${item.src}" alt="${escapeHtml(item.name || 'Uploaded image')}">
            `}
            <div>
              <span>${escapeHtml(item.name || 'Media')}</span>
              <button onclick="deleteMediaItem(${i}, ${mi})"><i class="fas fa-trash"></i></button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function parseYoutubeVideoId(url = '') {
  const cleanUrl = url.trim();
  if (!cleanUrl) return '';

  try {
    const parsed = new URL(cleanUrl);
    let videoId = '';

    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (parsed.hostname.includes('youtube.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parsed.searchParams.get('v')) videoId = parsed.searchParams.get('v');
      else if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') videoId = parts[1] || '';
    }

    return videoId;
  } catch (error) {
    return '';
  }
}

if (typeof window !== 'undefined') {
  window.getSpotifyEmbedUrl = getSpotifyEmbedUrl;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getSpotifyEmbedUrl };
}

function renderCalculator(w, i) {
  if (!w.equations) w.equations = [{ id: 'y1', expr: 'x^2', color: '#ef4444' }];
  if (!w.graphConfig) w.graphConfig = { minX: -10, maxX: 10, minY: -10, maxY: 10 };

  return `
    <div class="advanced-calc-container" data-wid="${i}">
      
      <div class="calc-custom-header widget-header">
        <span class="calc-header-title">🎀 GraphCalc OS v1.0</span>
        <div class="calc-header-controls">
          <button type="button" class="calc-close-btn" onclick="delWid(${i})" title="Close">&times;</button>
        </div>
      </div>

      <div class="calc-top-row">
        <div class="equations-manager">
          <h5>Functions ($Y=$)</h5>
          <div class="eq-list" id="eq-list-${i}">
            ${renderEquationInputs(w, i)}
          </div>
          <button class="calc-btn-sm" onclick="addNewEquation(${i})">+ Add Function</button>
          <button class="calc-btn-sm combo-btn" onclick="openComboManager(${i})">∑ Add/Combine Eq</button>
        </div>
        
        <div class="graph-canvas-wrapper" style="position:relative;">
          <canvas id="graph-canvas-${i}" width="320" height="260" 
                  onmousemove="trackGraphHover(event, ${i})" 
                  onmouseleave="clearGraphHover(${i})"></canvas>
          <div class="graph-controls">
            <button onclick="zoomGraph(${i}, 0.5)" title="Zoom In">+</button>
            <button onclick="zoomGraph(${i}, 2.0)" title="Zoom Out">-</button>
            <button onclick="resetGraphZoom(${i})" title="Reset">⟲</button>
          </div>
          <div id="graph-tooltip-${i}" class="graph-tooltip hidden"></div>
        </div>
      </div>

      <div class="graph-analysis-bar" id="analysis-bar-${i}">
        <button onclick="analyzeGraph(${i}, 'min')">Find Min</button>
        <button onclick="analyzeGraph(${i}, 'max')">Find Max</button>
        <button onclick="analyzeGraph(${i}, 'zeros')">Find Zeros</button>
        <span class="analysis-result" id="analysis-res-${i}">Select analysis option...</span>
      </div>

      <div class="calc-keyboard">
        <button class="key-fn" onclick="insertKey('x')">X</button>
        <button class="key-fn" onclick="insertKey('^2')">x²</button>
        <button class="key-fn" onclick="insertKey('^')">xʸ</button>
        <button class="key-fn" onclick="insertKey('sqrt(')">√</button>
        <button class="key-op" onclick="clearActiveInput()">CE</button>
        
        <button class="key-fn" onclick="insertKey('sin(')">sin</button>
        <button class="key-num" onclick="insertKey('7')">7</button>
        <button class="key-num" onclick="insertKey('8')">8</button>
        <button class="key-num" onclick="insertKey('9')">9</button>
        <button class="key-op" onclick="insertKey('/')">/</button>
        
        <button class="key-fn" onclick="insertKey('cos(')">cos</button>
        <button class="key-num" onclick="insertKey('4')">4</button>
        <button class="key-num" onclick="insertKey('5')">5</button>
        <button class="key-num" onclick="insertKey('6')">6</button>
        <button class="key-op" onclick="insertKey('*')">*</button>
        
        <button class="key-fn" onclick="insertKey('tan(')">tan</button>
        <button class="key-num" onclick="insertKey('1')">1</button>
        <button class="key-num" onclick="insertKey('2')">2</button>
        <button class="key-num" onclick="insertKey('3')">3</button>
        <button class="key-op" onclick="insertKey('-')">-</button>
        
        <button class="key-fn" onclick="insertKey('pi')">π</button>
        <button class="key-num" onclick="insertKey('0')">0</button>
        <button class="key-num" onclick="insertKey('.')">.</button>
        <button class="key-fn" onclick="insertKey('(')">(</button>
        <button class="key-op" onclick="insertKey('+')">+</button>
      </div>
    </div>
  `;
}
 
function renderGraphWidget(w, i) {
  return `
    <div class="graph-widget">
      <div class="graph-toolbar">
        <label>y = <input id="graph-input-${i}" type="text" value="${escapeHtml(w.graphExpr || '')}" placeholder="sin(x)" onchange="updateWidgetProp(${i},'graphExpr',this.value)" oninput="updateWidgetProp(${i},'graphExpr',this.value)"></label>
        <div class="graph-buttons">
          <button class="graph-btn" onclick="appendGraphToken(${i},'x')">x</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'+')">+</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'-')">−</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'*')">×</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'/')">÷</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'^')">^</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'(')">(</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},')')">)</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'sin(')">sin</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'cos(')">cos</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'tan(')">tan</button>
          <button class="graph-btn" onclick="appendGraphToken(${i},'log(')">log</button>
          <button class="graph-action-btn" onclick="deleteGraphChar(${i})">Del</button>
          <button class="graph-action-btn" onclick="clearGraphExpr(${i})">Clear</button>
        </div>
        <div class="graph-range-grid">
          <label><span>x min</span><input type="number" step="0.5" value="${escapeHtml(w.graphXMin || '')}" onchange="updateWidgetProp(${i},'graphXMin',this.value)"></label>
          <label><span>x max</span><input type="number" step="0.5" value="${escapeHtml(w.graphXMax || '')}" onchange="updateWidgetProp(${i},'graphXMax',this.value)"></label>
          <label><span>y min</span><input type="number" step="0.5" value="${escapeHtml(w.graphYMin || '')}" onchange="updateWidgetProp(${i},'graphYMin',this.value)"></label>
          <label><span>y max</span><input type="number" step="0.5" value="${escapeHtml(w.graphYMax || '')}" onchange="updateWidgetProp(${i},'graphYMax',this.value)"></label>
        </div>
      </div>
      <div class="graph-frame">
        <canvas id="graph-canvas-${i}" width="420" height="220"></canvas>
        <div class="graph-feedback">${escapeHtml(w.graphError || '')}</div>
      </div>
    </div>`;
}



function evaluateCalculator(i) {
  const widget = data?.[activeIdx]?.widgets?.[i];
  if (!widget) return;
  const expression = (widget.calcInput || '').trim();
  if (!expression) {
    updateWidgetProp(i, 'calcResult', 'Enter an expression');
    return;
  }

  try {
    const result = Function(`with(Math){ return ${expression} }`)();
    updateWidgetProp(i, 'calcResult', String(result));
  } catch (error) {
    updateWidgetProp(i, 'calcResult', `Error: ${error.message}`);
  }
}

function drawGraphWidgets() {
  const category = data?.[activeIdx];
  if (!category || !Array.isArray(category.widgets)) return;
  category.widgets.forEach((widget, i) => {
    if (widget.type === 'graph') drawGraphWidget(i);
  });
}

function drawGraphWidget(i) {
  const widget = data?.[activeIdx]?.widgets?.[i];
  const canvas = document.getElementById(`graph-canvas-${i}`);
  if (!canvas || !widget) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const xMin = Number(widget.graphXMin) || -10;
  const xMax = Number(widget.graphXMax) || 10;
  const yMin = Number(widget.graphYMin) || -5;
  const yMax = Number(widget.graphYMax) || 5;
  const expr = (widget.graphExpr || 'x').trim();

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#ccd6f6';
  ctx.lineWidth = 1;

  for (let gx = 0; gx <= 10; gx++) {
    const x = (gx / 10) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let gy = 0; gy <= 10; gy++) {
    const y = (gy / 10) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const xToPx = x => ((x - xMin) / xRange) * width;
  const yToPx = y => height - ((y - yMin) / yRange) * height;

  ctx.strokeStyle = '#2e3a8c';
  ctx.lineWidth = 2;
  ctx.beginPath();

  let graphFunc;
  try {
    graphFunc = Function('x', `with(Math){ return ${expr} }`);
  } catch (error) {
    widget.graphError = `Syntax: ${error.message}`;
    return;
  }

  let first = true;
  for (let step = 0; step <= width; step++) {
    const x = xMin + (xRange * step) / width;
    let y;
    try {
      y = graphFunc(x);
    } catch (error) {
      widget.graphError = `Eval: ${error.message}`;
      return;
    }

    if (typeof y !== 'number' || !isFinite(y)) {
      first = true;
      continue;
    }

    const px = xToPx(x);
    const py = yToPx(y);
    if (first) {
      ctx.moveTo(px, py);
      first = false;
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.stroke();
  widget.graphError = '';
}

function parseHtmlDateBlock() {
  const now = new Date(); const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']; const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `<div class="date-view-wrapper"><span>${days[now.getDay()]}</span><strong>${now.getDate()}</strong><span>${months[now.getMonth()]}</span></div>`;
}

function parseHtmlCalendarBlock(textCol) {
  const now = new Date(); const currentYear = now.getFullYear(); const currentMonth = now.getMonth();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  let daysBuffer = '';
  for (let i = 0; i < firstDay; i++) daysBuffer += `<div></div>`;
  for (let day = 1; day <= totalDays; day++) {
    const isToday = (day === now.getDate()) ? 'active-today' : '';
    daysBuffer += `<div class="cal-day-cell ${isToday}" style="color:${isToday ? '#fff' : textCol}">${day}</div>`;
  }
  return `<div class="cal-view-wrapper"><div class="cal-title">${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now)}</div><div class="cal-grid-days">${daysBuffer}</div></div>`;
}

function renderMp3PlayerMarkup(widget, index) {
  if (!widget.playlists) {
    widget.playlists = { "cute-mix-1": widget.tracks || [] };
  }
  if (!widget.activePlaylistName) {
    widget.activePlaylistName = Object.keys(widget.playlists)[0];
  }
  const jsArg = value => JSON.stringify(String(value)).replace(/"/g, '&quot;');
  const activePlaylistName = widget.activePlaylistName;
  const tracks = widget.playlists[activePlaylistName] || [];
  const currentIndex = widget.currentTrackIndex || 0;
  const currentTrack = tracks[currentIndex];
  const isShuffle = widget.shuffleActive === true;
  const repeatMode = widget.repeatMode || 'off';
  const registry = window._mp3Registry && window._mp3Registry[index];
  const isPlaying = registry ? registry.isPlaying : false;
  const progress = registry && Number.isFinite(registry.progress) ? registry.progress : 0;
  const duration = registry && Number.isFinite(registry.duration) ? registry.duration : 0;
  const currentTime = registry && registry.audio ? registry.audio.currentTime : 0;
  const displayTitle = currentTrack ? currentTrack.name : "Nothing loaded yet";
  const displayCover = currentTrack ? currentTrack.coverImg : '';
  const playlistNames = Object.keys(widget.playlists);
  const playlistCover = widget.playlistCovers && widget.playlistCovers[activePlaylistName];

  const playlistItemsHtml = playlistNames.map(pName => {
    const isSelected = pName === activePlaylistName ? 'is-active-playlist' : '';
    const cover = widget.playlistCovers && widget.playlistCovers[pName];
    const count = (widget.playlists[pName] || []).length;

    return `
      <div class="mp3-playlist-pill ${isSelected}" onclick='switchPlaylist(${index}, ${jsArg(pName)})'>
        <span class="mp3-playlist-cover" ${cover ? `style="background-image:url('${escapeHtml(cover)}')"` : ''}></span>
        <span class="playlist-text-title">${escapeHtml(pName)} <small>${count}</small></span>
        <details class="mp3-menu" onclick="event.stopPropagation();">
          <summary title="Playlist actions"><i class="fas fa-ellipsis-h"></i></summary>
          <div class="mp3-menu-panel">
            <button type="button" onclick='renamePlaylist(${index}, ${jsArg(pName)})'><i class="fas fa-pen"></i> Rename</button>
            <label><i class="fas fa-image"></i> Cover<input type="file" accept="image/*" onchange='setPlaylistCoverFromFile(${index}, ${jsArg(pName)}, this.files[0])'></label>
            <button type="button" onclick='movePlaylist(${index}, ${jsArg(pName)}, -1, event)'><i class="fas fa-arrow-up"></i> Move up</button>
            <button type="button" onclick='movePlaylist(${index}, ${jsArg(pName)}, 1, event)'><i class="fas fa-arrow-down"></i> Move down</button>
            <button type="button" class="danger" onclick='deletePlaylist(${index}, ${jsArg(pName)}, event)'><i class="fas fa-trash"></i> Delete</button>
          </div>
        </details>
      </div>
    `;
  }).join('');

  const trackItemsHtml =
  tracks.length > 0
    ? tracks
        .map((track, tIdx) => {
          const activeClass = tIdx === currentIndex ? 'is-active-row' : ''
          const transferOptions = playlistNames
            .filter(name => name !== activePlaylistName)
            .map(
              name =>
                `<button type="button" onclick='transferTrack(${index}, ${tIdx}, ${jsArg(
                  name
                )})'><i class="fas fa-share"></i> ${escapeHtml(name)}</button>`
            )
            .join('')
          const transferMenu = transferOptions
            ? `
      <details class="mp3-menu mp3-transfer-menu" onclick="event.stopPropagation();">
        <summary title="Move or duplicate track"><i class="fas fa-share"></i></summary>
        <div class="mp3-menu-panel">
          <div class="mp3-menu-label">Move or duplicate to</div>
          ${transferOptions}
        </div>
      </details>
    `
            : ''

          return `
      <div class="mp3-track-chip ${activeClass}" onclick="playSpecificTrack(${index}, ${tIdx})">
        <img class="mp3-track-cover" src="${escapeHtml(
          track.coverImg || ''
        )}" alt="">
        <span class="mp3-track-title">${escapeHtml(track.name)}</span>
        ${transferMenu}
        <details class="mp3-menu" onclick="event.stopPropagation();">
          <summary title="Track actions"><i class="fas fa-ellipsis-h"></i></summary>
          <div class="mp3-menu-panel">
            <button type="button" onclick="renameTrack(${index}, ${tIdx})"><i class="fas fa-pen"></i> Rename</button>
            <label><i class="fas fa-image"></i> Cover<input type="file" accept="image/*" onchange="setTrackCoverFromFile(${index}, ${tIdx}, this.files[0])"></label>
            <button type="button" onclick="moveTrack(${index}, ${tIdx}, -1, event)"><i class="fas fa-arrow-up"></i> Up</button>
            <button type="button" onclick="moveTrack(${index}, ${tIdx}, 1, event)"><i class="fas fa-arrow-down"></i> Down</button>
            <button type="button" class="danger" onclick="deleteTrack(${index}, ${tIdx}, event)"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </details>
      </div>
      `;
    }).join('') : '';

  return `
    <div class="y2k-player-container" id="y2k-player-instance-${index}">
      <div class="mp3-now-deck">
        <div class="mp3-cover-orb" ${displayCover ? `style="background-image:url('${escapeHtml(displayCover)}')"` : playlistCover ? `style="background-image:url('${escapeHtml(playlistCover)}')"` : ''}></div>
        <div class="mp3-title-stack">
          <span class="mp3-kicker">${isPlaying ? 'Playing' : 'Ready'}</span>
          <strong>${escapeHtml(displayTitle)}</strong>
          <small>${escapeHtml(activePlaylistName)}</small>
        </div>
      </div>

      <div class="mp3-transport-row">
        <button class="jelly-btn" type="button" onclick="prevTrack(${index})" title="Previous"><i class="fas fa-backward-step"></i></button>
        <button class="jelly-btn play-trigger" type="button" onclick="togglePlayTrack(${index})" title="Play/Pause">
          <i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
        </button>
        <button class="jelly-btn" type="button" onclick="nextTrack(${index})" title="Next"><i class="fas fa-forward-step"></i></button>
        <button class="jelly-btn ${isShuffle ? 'is-on' : ''}" type="button" onclick="toggleShuffle(${index})" title="Shuffle"><i class="fas fa-random"></i></button>
        <button class="jelly-btn ${repeatMode !== 'off' ? 'is-on' : ''}" type="button" onclick="toggleRepeat(${index})" title="Repeat ${escapeHtml(repeatMode)}"><i class="fas fa-repeat"></i><span>${repeatMode === 'one' ? '1' : ''}</span></button>
      </div>

      <div class="mp3-progress-row">
        <input id="mp3-progress-${index}" type="range" min="0" max="100" step="0.1" value="${progress}" oninput="seekMp3Track(${index}, this.value)">
        <span id="mp3-time-${index}">${typeof formatMp3Time === 'function' ? `${formatMp3Time(currentTime)} / ${formatMp3Time(duration)}` : '0:00 / 0:00'}</span>
      </div>

      <div class="mp3-compact-grid">
        <section class="mp3-pocket playlists-pocket">
          <div class="mp3-section-head">
            <span>Playlists</span>
            <details class="mp3-menu">
              <summary title="Add playlist"><i class="fas fa-plus"></i></summary>
              <div class="mp3-menu-panel add-playlist-panel">
                <input type="text" id="new-playlist-input-${index}" placeholder="Playlist name">
                <button type="button" onclick="createNewPlaylist(${index})">Create</button>
              </div>
            </details>
          </div>
          <div class="mp3-scroll-list">${playlistItemsHtml}</div>
        </section>

        <section class="mp3-pocket tracks-pocket">
          <div class="mp3-section-head">
            <span>Tracks</span>
            <details class="mp3-menu">
              <summary title="Add tracks"><i class="fas fa-plus"></i></summary>
              <div class="mp3-menu-panel add-track-panel">
                <input type="text" id="mp3-url-${index}" placeholder="Audio URL">
                <button type="button" onclick="addAudioUrlTrack(${index})">Load URL</button>
                <label><i class="fas fa-folder-open"></i> Local audio<input type="file" accept="audio/*" multiple onchange="handleLocalFileUpload(this.files, ${index})"></label>
              </div>
            </details>
          </div>
          <div class="mp3-scroll-list tracks-list">${trackItemsHtml}</div>
        </section>
      </div>
    </div>
  ;
}
        </div>
        <label class="y2k-file-trigger">
          ⚡ BROWSE OR FILE DROP LOCAL AUDIO ⚡
          <input type="file" accept="audio/mp3, audio/mpeg" multiple style="display:none;" onchange="handleLocalFileUpload(this.files, ${index})">
        </label>
      </div>
    </div>
  `;
}
