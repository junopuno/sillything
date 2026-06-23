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
    </div>`;
}

function renderClock(w, i) {
  const clockFontSize = normalizeCssSize(w.clockFontSize, '2.2rem');
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
  return `
    <div class="time-widget-stack">
      <div id="timer-face-${i}" class="digital-clock-face">${parseSecondsToTimerFace(w.timerElapsed || 0)}</div>
      <div class="time-btn-cluster">
        <button class="time-mini-btn" onclick="triggerTimerState(${i},'toggle')">${w.timerRunning ? 'Pause' : 'Start'}</button>
        <button class="time-mini-btn" onclick="triggerTimerState(${i},'clear')">Reset</button>
      </div>
    </div>`;
}

function renderPomodoro(w, i) {
  return `
    <div class="time-widget-stack">
      <div id="pomodoro-face-${i}" class="digital-clock-face">${parseMinutesSeconds(w.pomodoroSeconds || 0)}</div>
      <div class="time-btn-cluster">
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'toggle')">${w.pomodoroRunning ? 'Pause' : 'Start'}</button>
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'add15')">15m</button>
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'add30')">30m</button>
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'add60')">60m</button>
        <button class="time-mini-btn" onclick="triggerPomodoro(${i},'reset')">Reset</button>
      </div>
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
/* --- AVANCERAD GRAFRITANDE MINIRÄKNARE-LOGIK --- */

// 1. UTÖKAD MINIRÄKNARE (Scientific / Multi-line Input)
function renderCalculator(w, i) {
  // Initiera internt tillstånd om det inte finns
  if (w.calcExpression === undefined) w.calcExpression = '';
  if (w.calcResult === undefined) w.calcResult = '0';
  if (w.calcHistory === undefined) w.calcHistory = [];

  const historyHtml = w.calcHistory.map(h => `<div class="calc-hist-item">${escapeHtml(h)}</div>`).join('');

  return `
    <div class="adv-calc-container" style="display:flex; flex-direction:column; gap:8px; height:100%; padding:4px;">
      <div class="calc-screen" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:12px; padding:10px; text-align:right; font-family:monospace; min-height:85px; display:flex; flex-direction:column; justify-content:end; box-shadow:inset 0 2px 4px rgba(0,0,0,0.05);">
        <div class="calc-history-area" style="font-size:0.7rem; color:#64748b; max-height:40px; overflow-y:auto; margin-bottom:4px;">${historyHtml}</div>
        <div class="calc-input-line" style="font-size:1.1rem; color:#0f172a; word-break:break-all; min-height:22px;">${escapeHtml(w.calcExpression || '0')}</div>
        <div class="calc-result-line" style="font-weight:700; font-size:1.3rem; color:#2563eb; margin-top:2px;">${escapeHtml(w.calcResult)}</div>
      </div>
      
      <div class="calc-keypad" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:4px; font-size:0.8rem;">
        <button class="calc-btn fn" onclick="handleAdvCalcInput(${i}, 'sin(')" style="background:#e0e7ff; font-weight:bold;">sin</button>
        <button class="calc-btn fn" onclick="handleAdvCalcInput(${i}, 'cos(')" style="background:#e0e7ff; font-weight:bold;">cos</button>
        <button class="calc-btn fn" onclick="handleAdvCalcInput(${i}, 'tan(')" style="background:#e0e7ff; font-weight:bold;">tan</button>
        <button class="calc-btn fn" onclick="handleAdvCalcInput(${i}, '^')" style="background:#e0e7ff; font-weight:bold;">^</button>
        <button class="calc-btn danger" onclick="handleAdvCalcInput(${i}, 'CLEAR')" style="background:#fee2e2; color:#ef4444; font-weight:bold;">CLR</button>
        
        <button class="calc-btn fn" onclick="handleAdvCalcInput(${i}, 'sqrt(')" style="background:#e0e7ff; font-weight:bold;">√</button>
        <button class="calc-btn fn" onclick="handleAdvCalcInput(${i}, 'log(')" style="background:#e0e7ff; font-weight:bold;">log</button>
        <button class="calc-btn fn" onclick="handleAdvCalcInput(${i}, 'ln(')" style="background:#e0e7ff; font-weight:bold;">ln</button>
        <button class="calc-btn" onclick="handleAdvCalcInput(${i}, '(')" style="background:#f1f5f9;">(</button>
        <button class="calc-btn" onclick="handleAdvCalcInput(${i}, ')')" style="background:#f1f5f9;">)</button>

        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '7')" style="background:#fff; font-weight:600;">7</button>
        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '8')" style="background:#fff; font-weight:600;">8</button>
        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '9')" style="background:#fff; font-weight:600;">9</button>
        <button class="calc-btn op" onclick="handleAdvCalcInput(${i}, 'DEL')" style="background:#fed7aa; color:#ea580c; font-weight:bold;">DEL</button>
        <button class="calc-btn op" onclick="handleAdvCalcInput(${i}, '/')" style="background:#f1f5f9; font-weight:bold;">/</button>

        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '4')" style="background:#fff; font-weight:600;">4</button>
        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '5')" style="background:#fff; font-weight:600;">5</button>
        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '6')" style="background:#fff; font-weight:600;">6</button>
        <button class="calc-btn fn" onclick="handleAdvCalcInput(${i}, 'pi')" style="background:#e0e7ff; font-weight:bold;">π</button>
        <button class="calc-btn op" onclick="handleAdvCalcInput(${i}, '*')" style="background:#f1f5f9; font-weight:bold;">*</button>

        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '1')" style="background:#fff; font-weight:600;">1</button>
        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '2')" style="background:#fff; font-weight:600;">2</button>
        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '3')" style="background:#fff; font-weight:600;">3</button>
        <button class="calc-btn op" onclick="handleAdvCalcInput(${i}, '-')" style="background:#f1f5f9; font-weight:bold;">-</button>
        <button class="calc-btn op" onclick="handleAdvCalcInput(${i}, '+')" style="background:#f1f5f9; font-weight:bold;">+</button>

        <button class="calc-btn num" onclick="handleAdvCalcInput(${i}, '0')" style="background:#fff; font-weight:600; grid-column: span 2;">0</button>
        <button class="calc-btn" onclick="handleAdvCalcInput(${i}, '.')" style="background:#fff; font-weight:600;">.</button>
        <button class="calc-btn action" onclick="handleAdvCalcInput(${i}, 'ENTER')" style="background:#2563eb; color:white; font-weight:bold; grid-column: span 2;">ENTER</button>
      </div>
    </div>
  `;
}

function handleAdvCalcInput(wi, cmd) {
  let w = activeIdx === null ? frontPageWidgets[wi] : data[activeIdx].widgets[wi];
  if (!w) return;

  if (cmd === 'CLEAR') {
    w.calcExpression = '';
    w.calcResult = '0';
  } else if (cmd === 'DEL') {
    w.calcExpression = w.calcExpression.slice(0, -1);
  } else if (cmd === 'ENTER') {
    if (!w.calcExpression) return;
    try {
      // Förbered uttrycket för säker evaluering via Math-funktioner
      let expr = w.calcExpression
        .replaceAll('sin(', 'Math.sin(')
        .replaceAll('cos(', 'Math.cos(')
        .replaceAll('tan(', 'Math.tan(')
        .replaceAll('sqrt(', 'Math.sqrt(')
        .replaceAll('log(', 'Math.log10(')
        .replaceAll('ln(', 'Math.log(')
        .replaceAll('pi', 'Math.PI')
        .replaceAll('^', '**'); // Javascripts potens-operator

      // Utvärdera säkert
      let result = new Function(`return (${expr})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        // Avrunda till 6 decimaler för renare display
        w.calcResult = Number(result.toFixed(6)).toString();
        w.calcHistory.push(`${w.calcExpression} = ${w.calcResult}`);
        if (w.calcHistory.length > 3) w.calcHistory.shift();
      } else {
        w.calcResult = 'Error';
      }
    } catch (e) {
      w.calcResult = 'Syntax Error';
    }
  } else {
    w.calcExpression += cmd;
  }

  if (activeIdx === null) storage.set('ver1_front', frontPageWidgets);
  else storage.set('ver1', data);
  render();
}


function renderGraphWidget(w, i) {
  // Initiera array om den inte finns
  if (!w.equations) {
    w.equations = w.equation ? [w.equation] : ['x * x'];
  }
  if (w.zoom === undefined) w.zoom = 10; // Standardzoom (visar -10 till 10)

  // Skapa funktionsrader
  const rowsHtml = w.equations.map((eq, eqIdx) => `
    <div class="graph-function-row">
      <span style="font-size:0.75rem; font-weight:bold; color:var(--ui-accent)">f${eqIdx + 1}(x)=</span>
      <input type="text" 
             id="graph-eq-${i}-${eqIdx}" 
             value="${escapeHtml(eq)}" 
             onfocus="window.activeGraphInput = {widgetIdx: ${i}, eqIdx: ${eqIdx}}"
             onchange="updateGraphEquation(${i}, ${eqIdx}, this.value)">
      <button class="calc-btn" style="padding:4px 8px; font-size:0.75rem;" onclick="removeGraphEquation(${i}, ${eqIdx})">×</button>
    </div>
  `).join('');

  return `
    <div class="graph-container">
      <div class="graph-functions-list">
        ${rowsHtml}
      </div>
      
      <div class="graph-controls-row">
        <button class="workspace-btn" style="padding:4px 10px; font-size:0.75rem;" onclick="addGraphEquation(${i})">+ Lägg till funktion</button>
        <button class="workspace-btn" style="padding:4px 10px; font-size:0.75rem;" onclick="combineGraphEquations(${i})">∑ Addera funktioner</button>
        <div style="display:flex; gap:4px;">
          <button class="calc-btn" style="padding:4px 8px;" title="Zooma in" onclick="changeGraphZoom(${i}, -2)"><i class="fas fa-search-plus"></i></button>
          <button class="calc-btn" style="padding:4px 8px;" title="Zooma ut" onclick="changeGraphZoom(${i}, 2)"><i class="fas fa-search-minus"></i></button>
        </div>
      </div>

      <div class="graph-keypad">
        <button class="graph-key" onclick="insertGraphTerm('x')">x</button>
        <button class="graph-key" onclick="insertGraphTerm('7')">7</button>
        <button class="graph-key" onclick="insertGraphTerm('8')">8</button>
        <button class="graph-key" onclick="insertGraphTerm('9')">9</button>
        <button class="graph-key op" onclick="insertGraphTerm('/')">/</button>
        <button class="graph-key action" onclick="clearGraphInput()">C</button>
        
        <button class="graph-key" onclick="insertGraphTerm('*')">*</button>
        <button class="graph-key" onclick="insertGraphTerm('4')">4</button>
        <button class="graph-key" onclick="insertGraphTerm('5')">5</button>
        <button class="graph-key" onclick="insertGraphTerm('6')">6</button>
        <button class="graph-key op" onclick="insertGraphTerm('*')">*</button>
        <button class="graph-key op" onclick="insertGraphTerm('Math.sin(')">sin</button>
        
        <button class="graph-key" onclick="insertGraphTerm('Math.pow(x,2)')">x²</button>
        <button class="graph-key" onclick="insertGraphTerm('1')">1</button>
        <button class="graph-key" onclick="insertGraphTerm('2')">2</button>
        <button class="graph-key" onclick="insertGraphTerm('3')">3</button>
        <button class="graph-key op" onclick="insertGraphTerm('-')">-</button>
        <button class="graph-key op" onclick="insertGraphTerm('Math.cos(')">cos</button>
        
        <button class="graph-key" onclick="insertGraphTerm('Math.pow(x,3)')">x³</button>
        <button class="graph-key" onclick="insertGraphTerm('0')">0</button>
        <button class="graph-key" onclick="insertGraphTerm('.')">.</button>
        <button class="graph-key op" onclick="insertGraphTerm('(')">(</button>
        <button class="graph-key op" onclick="insertGraphTerm('+')">+</button>
        <button class="graph-key op" onclick="insertGraphTerm(')')">)</button>
      </div>

      <div class="graph-canvas-wrapper" id="graph-wrapper-${i}">
        <div class="graph-tooltip" id="graph-tooltip-${i}"></div>
        <canvas id="graph-canvas-${i}" width="240" height="200" 
                style="width:100%; height:100%; display:block; background:#fff; border:1px solid #e2e8f0; border-radius:12px;"
                onmousemove="handleGraphHover(event, ${i})"
                onmouseleave="handleGraphLeave(${i})">
        </canvas>
      </div>
      <div style="color:red; font-size:0.7rem; min-height:12px;" id="graph-error-${i}"></div>
    </div>
  `;
}

// 3. CENTRAL REDERINGS-DRIVRUTIN FÖR CANVAS
function drawGraphWidgets() {
  const currentWidgets = activeIdx === null ? frontPageWidgets : (data[activeIdx]?.widgets || []);

  currentWidgets.forEach((w, i) => {
    if (w.type !== 'graph' || w.graphMode === 'window') return;
    const canvas = document.getElementById(`adv-graph-canvas-${i}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Hämta inställda fönster-axlar
    const xMin = parseFloat(w.xMin);
    const xMax = parseFloat(w.xMax);
    const yMin = parseFloat(w.yMin);
    const yMax = parseFloat(w.yMax);

    // Pixelskonverterare
    const xToPx = (x) => ((x - xMin) / (xMax - xMin)) * width;
    const yToPx = (y) => height - (((y - yMin) / (yMax - yMin)) * height);

    // Rita Rutnät (Grid-linjer)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Vertikala linjer
    const xStep = Math.max(1, Math.floor((xMax - xMin) / 10));
    for (let x = Math.floor(xMin); x <= xMax; x += xStep) {
      ctx.beginPath(); ctx.moveTo(xToPx(x), 0); ctx.lineTo(xToPx(x), height); ctx.stroke();
    }
    // Horisontella linjer
    const yStep = Math.max(1, Math.floor((yMax - yMin) / 10));
    for (let y = Math.floor(yMin); y <= yMax; y += yStep) {
      ctx.beginPath(); ctx.moveTo(0, yToPx(y)); ctx.lineTo(width, yToPx(y)); ctx.stroke();
    }

    // Rita X och Y Huvudaxlar (Svarta tjockare linjer)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    // X-axel
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath(); ctx.moveTo(0, yToPx(0)); ctx.lineTo(width, yToPx(0)); ctx.stroke();
    }
    // Y-axel
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath(); ctx.moveTo(xToPx(0), 0); ctx.lineTo(xToPx(0), height); ctx.stroke();
    }

    // Funktion för att parsa stränguttryck till körbar Math-kod
    const parseFunction = (exprString, xVal) => {
      try {
        if (!exprString.trim()) return null;
        let clean = exprString.toLowerCase()
          .replace(/(\d)(x)/g, '$1*$2') // Fixar implicit multiplikation: t.ex. 2x -> 2*x
          .replaceAll('x', `(${xVal})`)
          .replaceAll('sin(', 'Math.sin(')
          .replaceAll('cos(', 'Math.cos(')
          .replaceAll('tan(', 'Math.tan(')
          .replaceAll('sqrt(', 'Math.sqrt(')
          .replaceAll('pi', 'Math.PI')
          .replaceAll('^', '**');
        return new Function(`return (${clean})`)();
      } catch (e) {
        return null;
      }
    };

    // Rita Funktion Y1 (Blå)
    if (w.y1) {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let first = true;
      for (let px = 0; px < width; px++) {
        const x = xMin + (px / width) * (xMax - xMin);
        const y = parseFunction(w.y1, x);
        if (y !== null && isFinite(y)) {
          if (first) { ctx.moveTo(px, yToPx(y)); first = false; }
          else { ctx.lineTo(px, yToPx(y)); }
        }
      }
      ctx.stroke();
    }

    // Rita Funktion Y2 (Röd)
    if (w.y2) {
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let first = true;
      for (let px = 0; px < width; px++) {
        const x = xMin + (px / width) * (xMax - xMin);
        const y = parseFunction(w.y2, x);
        if (y !== null && isFinite(y)) {
          if (first) { ctx.moveTo(px, yToPx(y)); first = false; }
          else { ctx.lineTo(px, yToPx(y)); }
        }
      }
      ctx.stroke();
    }

    // Hantera TRACE-indikator (Blinkande hårkors/punkt)
    if (w.isTraceActive) {
      const tx = parseFloat(w.traceX);
      const ty1 = parseFunction(w.y1 || '', tx);
      const ty2 = parseFunction(w.y2 || '', tx);

      // Uppdatera realtids-textblocken
      const t1El = document.getElementById(`trace-y1-val-${i}`);
      const t2El = document.getElementById(`trace-y2-val-${i}`);

      if (t1El) t1El.innerText = (ty1 !== null && !isNaN(ty1)) ? `Y1: ${Number(ty1.toFixed(2))}` : 'Y1: --';
      if (t2El) t2El.innerText = (ty2 !== null && !isNaN(ty2)) ? `Y2: ${Number(ty2.toFixed(2))}` : 'Y2: --';

      // Rita hårkors för Y1 om den existerar
      if (ty1 !== null && isFinite(ty1)) {
        ctx.fillStyle = '#1e40af';
        ctx.beginPath();
        ctx.arc(xToPx(tx), yToPx(ty1), 5, 0, 2 * Math.PI);
        ctx.fill();
      }
      // Rita hårkors för Y2 om den existerar
      if (ty2 !== null && isFinite(ty2)) {
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(xToPx(tx), yToPx(ty2), 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  });
}

// HJÄLPFUNKTIONER FÖR INTERAKTION
function toggleGraphMode(wi, mode) {
  let w = activeIdx === null ? frontPageWidgets[wi] : data[activeIdx].widgets[wi];
  if (w) w.graphMode = mode;
  render();
}

function updateGraphWindow(wi, key, val) {
  let w = activeIdx === null ? frontPageWidgets[wi] : data[activeIdx].widgets[wi];
  if (w) w[key] = parseFloat(val) || 0;
  if (activeIdx === null) storage.set('ver1_front', frontPageWidgets);
  else storage.set('ver1', data);
}

function quickZoomGraph(wi, preset) {
  let w = activeIdx === null ? frontPageWidgets[wi] : data[activeIdx].widgets[wi];
  if (w && preset === 'std') {
    w.xMin = -10; w.xMax = 10;
    w.yMin = -10; w.yMax = 10;
    w.traceX = 0;
  }
  render();
}

function toggleGraphTrace(wi) {
  let w = activeIdx === null ? frontPageWidgets[wi] : data[activeIdx].widgets[wi];
  if (w) w.isTraceActive = !w.isTraceActive;
  render();
}

function moveGraphTrace(wi, direction) {
  let w = activeIdx === null ? frontPageWidgets[wi] : data[activeIdx].widgets[wi];
  if (w) {
    const step = (parseFloat(w.xMax) - parseFloat(w.xMin)) / 40; // Flytta trace dynamiskt baserat på zoomnivå
    w.traceX += (direction * step);
  }
  render();
}