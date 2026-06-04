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
  const clockText = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: w.clockShowSeconds ? '2-digit' : undefined,
    hour12: w.clockFormat === '12'
    
  });

  return `
    <div class="time-widget-stack clock-widget">
      <div id="clock-face-${i}" class="digital-clock-face live-clock-face" style="font-size:${escapeHtml(w.clockFontSize)}; font-family:${escapeHtml(w.clockFontFamily)}">${escapeHtml(clockText)}</div>
      <div class="clock-options-grid">
        <label>
          Font size
          <select onchange="updateWidgetProp(${i},'clockFontSize',this.value)">
            <option value="1.6rem" ${w.clockFontSize === '1.6rem' ? 'selected' : ''}>Small</option>
            <option value="2.2rem" ${w.clockFontSize === '2.2rem' ? 'selected' : ''}>Medium</option>
            <option value="3rem" ${w.clockFontSize === '3rem' ? 'selected' : ''}>Large</option>
            <option value="4rem" ${w.clockFontSize === '4rem' ? 'selected' : ''}>Huge</option>
          </select>
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
        <iframe class="youtube-frame" src="${embedUrl}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
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

function renderCalculator(w, i) {
  return `
    <div class="calculator-widget">
      <div class="calculator-display">
        <input id="calc-input-${i}" type="text" value="${escapeHtml(w.calcInput || '')}" placeholder="0" onchange="updateWidgetProp(${i},'calcInput',this.value)">
        <div class="calculator-result">${escapeHtml(w.calcResult || '') || '<span class="hint">Result appears here</span>'}</div>
      </div>
      <div class="calculator-keypad">
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'7')">7</button>
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'8')">8</button>
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'9')">9</button>
        <button class="calc-btn operator" onclick="appendCalculatorToken(${i},'/')">÷</button>
        <button class="calc-btn fn" onclick="appendCalculatorToken(${i},'sin(')">sin</button>

        <button class="calc-btn" onclick="appendCalculatorToken(${i},'4')">4</button>
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'5')">5</button>
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'6')">6</button>
        <button class="calc-btn operator" onclick="appendCalculatorToken(${i},'*')">×</button>
        <button class="calc-btn fn" onclick="appendCalculatorToken(${i},'cos(')">cos</button>

        <button class="calc-btn" onclick="appendCalculatorToken(${i},'1')">1</button>
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'2')">2</button>
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'3')">3</button>
        <button class="calc-btn operator" onclick="appendCalculatorToken(${i},'-')">−</button>
        <button class="calc-btn fn" onclick="appendCalculatorToken(${i},'tan(')">tan</button>

        <button class="calc-btn" onclick="appendCalculatorToken(${i},'0')">0</button>
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'.')">.</button>
        <button class="calc-btn" onclick="appendCalculatorToken(${i},'^')">^</button>
        <button class="calc-btn operator" onclick="appendCalculatorToken(${i},'+')">+</button>
        <button class="calc-btn fn" onclick="appendCalculatorToken(${i},'log(')">log</button>

        <button class="calc-action-btn" onclick="deleteCalculatorChar(${i})">Del</button>
        <button class="calc-action-btn" onclick="clearCalculator(${i})">C</button>
        <button class="calc-action-btn wide" onclick="evaluateCalculator(${i})">=</button>
      </div>
    </div>`;
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
