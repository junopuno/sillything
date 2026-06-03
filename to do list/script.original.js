/* --- INITIAL DATA & STATE --- */
let data = JSON.parse(localStorage.getItem('devos_horizon_v7')) || [];
let activeIdx = null;
let categoryDragMoved = false;
let openInspectorState = null;

let frontPageWidgets = JSON.parse(localStorage.getItem('devos_front_geo_v7')) || [
  { id: 'geo-date', type: 'date', title: 'Today', pos: { x: 40, y: 30 }, size: { w: 160, h: 180 }, style: { headBg: '#ffffff', bodyBg: '#ffffff', textCol: '#1e293b', borderCol: '#e2e8f0', fontSz: '14px' } },
  { id: 'geo-cal', type: 'cal', title: 'Calendar Grid', pos: { x: 230, y: 30 }, size: { w: 320, h: 180 }, style: { headBg: '#ffffff', bodyBg: '#ffffff', textCol: '#1e293b', borderCol: '#e2e8f0', fontSz: '12px' } }
];

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

/* --- TICKING SYSTEMS (Clock, Countdown, Timer) --- */

function runGlobalTickingSystems() {
  const now = new Date();
  const hrs = now.getHours();

  // Dynamic Greeting
  let currentGreeting = "Good Night";
  if (hrs >= 5 && hrs < 12) currentGreeting = "Good Morning";
  else if (hrs >= 12 && hrs < 17) currentGreeting = "Good Afternoon";
  else if (hrs >= 17 && hrs < 22) currentGreeting = "Good Evening";

  const greetingText = document.getElementById('greeting-text');
  if (greetingText && activeIdx === null) {
    greetingText.innerHTML = `${currentGreeting}, Alva<span class="dot">.</span>`;
  }

  // Live Clocks
  document.querySelectorAll('.live-clock-face').forEach(face => {
    face.innerText = new Date().toLocaleTimeString('sv-SE');
  });

  // Widget Specific Timers
  if (activeIdx !== null) {
    data[activeIdx].widgets.forEach((w, index) => {
      if (w.type === 'countdown' && w.deadline) {
        const distance = new Date(w.deadline).getTime() - new Date().getTime();
        const face = document.getElementById(`count-face-${index}`);
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
      }
      if (w.type === 'timer' && w.timerRunning) {
        w.timerElapsed += 1;
        const face = document.getElementById(`timer-face-${index}`);
        if (face) face.innerText = parseSecondsToTimerFace(w.timerElapsed);
      }
    });
  }
}
setInterval(runGlobalTickingSystems, 1000);

function parseSecondsToTimerFace(totalSecs) {
  const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
  const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
  const secs = (totalSecs % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

/* --- RENDER ENGINE --- */

function render() {
  const canvas = document.getElementById('main-canvas');
  const actions = document.getElementById('top-actions');
  const nav = document.getElementById('nav-list');
  const dashHeader = document.getElementById('dashboard-header');
  const catHeader = document.getElementById('category-header');

  // Sidebar Navigation
  nav.innerHTML = data.map((p, i) => `
    <div class="menu-item ${activeIdx === i ? 'active' : ''}" onclick="openProject(${i})">
      <i class="far fa-list-alt"></i> ${p.name}
    </div>`).join('');

  if (activeIdx === null) {
    // FRONT PAGE VIEW
    dashHeader.classList.remove('hidden');
    catHeader.classList.add('hidden');
    actions.innerHTML = `Open a category to access tools`;
    document.documentElement.style.setProperty('--page-bg', 'linear-gradient(135deg, var(--gradient-1) 0%, var(--gradient-2) 100%)');
    canvas.style.background = '';

    let html = frontPageWidgets.map((w) => `
      <div class="widget" data-geo-id="${w.id}" data-x="${w.pos.x}" data-y="${w.pos.y}" 
           style="transform: translate(${w.pos.x}px, ${w.pos.y}px); width:${w.size.w}px; height:${w.size.h}px; background:${w.style?.bodyBg || '#ffffff'}; color:${w.style?.textCol || '#1e293b'}; border-color:${w.style?.borderCol || '#e2e8f0'}">
          <div class="widget-header" style="background:${w.style?.headBg || 'rgba(0,0,0,0.01)'}">
              <input type="text" value="${w.title}" onchange="updateFrontTitle('${w.id}', this.value)">
              <div class="widget-controls-group"><i class="fas fa-ellipsis-v" onclick="openInspector('front','${w.id}')"></i></div>
          </div>
          <div id="inspect-front-${w.id}" class="design-inspector hidden">${renderInspectorMarkup('front', w.id, w.style)}</div>
          <div class="widget-body" style="font-size:${w.style?.fontSz || '14px'}">
              ${w.type === 'date' ? parseHtmlDateBlock() : parseHtmlCalendarBlock(w.style?.textCol)}
          </div>
      </div>`).join('');

    html += data.map((p, i) => {
      const x = p.pos?.x ?? (40 + (i * 220));
      const y = p.pos?.y ?? 250;
      return `<div class="category-shortcut-card" data-cat-index="${i}" data-x="${x}" data-y="${y}" onclick="openProject(${i}, event)" style="position:absolute; transform: translate(${x}px, ${y}px); width:${p.size?.w ?? 200}px; height:${p.size?.h ?? 120}px;">
                <h4>${p.name}</h4><span>${p.widgets.length} Components</span>
              </div>`;
    }).join('');
    canvas.innerHTML = html;

  } else {
    // CATEGORY VIEW
    dashHeader.classList.add('hidden');
    catHeader.classList.remove('hidden');
    document.getElementById('category-index').innerText = `#CAT-00${activeIdx + 1}`;
    document.getElementById('category-title-banner').innerText = data[activeIdx].name;

    const categoryBg = data[activeIdx].bgColor || '#f8fafc';
    document.documentElement.style.setProperty('--page-bg', categoryBg);

    actions.innerHTML = `
      <select id="w-type" style="padding:8px; border-radius:8px; width:100%; border:1px solid #cbd5e1; margin-bottom:10px;">
          <option value="list">Tasks Panel</option>
          <option value="checklist">Checklist</option>
          <option value="note">Plain Note</option>
          <option value="links">Quick Links</option>
          <option value="clock">Digital Clock</option>
          <option value="countdown">Countdown</option>
          <option value="timer">Stopwatch</option>
          <option value="calendar">Calendar</option>
          <option value="schedule">Hourly Schedule</option>
      </select>
      <div class="color-picker-block" style="margin-bottom:10px;">
        <label style="font-size:0.75rem; font-weight:700;">Canvas Color</label>
        <div class="color-picker-row">
          <input type="color" id="cat-bg-picker" value="${categoryBg}" oninput="updateCategoryBg(this.value, false)">
          <div class="theme-swatch-row">
            <button class="theme-swatch" title="Accent" onclick="applyThemeSwatch('cat','category','categoryBg','--ui-accent')"></button>
            <button class="theme-swatch" title="Tint 1" onclick="applyThemeSwatch('cat','category','categoryBg','--gradient-1')"></button>
          </div>
        </div>
      </div>
      <button class="workspace-btn" onclick="addWidget()">+ Add Module</button>
      <button class="workspace-btn" onclick="goHome()" style="background:#64748b; margin-top:8px;">Back to Dashboard</button>
    `;

    canvas.innerHTML = data[activeIdx].widgets.map((w, i) => `
      <div class="widget" data-index="${i}" data-x="${w.pos.x}" data-y="${w.pos.y}" 
           style="transform: translate(${w.pos.x}px, ${w.pos.y}px); width:${w.size.w}px; height:${w.size.h}px; background:${w.style.bodyBg}; color:${w.style.textCol}; border-color:${w.style.borderCol}">
          <div class="widget-header" style="background:${w.style.headBg}">
              <input type="text" value="${w.title}" onchange="updateWidgetProp(${i}, 'title', this.value)">
              <div class="widget-controls-group">
                  <i class="fas fa-ellipsis-v" onclick="openInspector('cat', ${i})"></i>
                  <i class="fas fa-times" onclick="delWid(${i})" style="color:#ef4444;"></i>
              </div>
          </div>
          <div id="inspect-cat-${i}" class="design-inspector hidden">${renderInspectorMarkup('cat', i, w.style)}</div>
          <div class="widget-body" style="font-size:${w.style.fontSz}">${renderWidgetBody(w, i)}</div>
      </div>`).join('');
  }

  initPhysics();

  // Re-open inspector if it was open before render
  if (openInspectorState) {
    const openEl = document.getElementById(`inspect-${openInspectorState.scope}-${openInspectorState.ref}`);
    if (openEl) openEl.classList.remove('hidden');
  }

  localStorage.setItem('devos_horizon_v7', JSON.stringify(data));
}

/* --- INSPECTOR & STYLING LOGIC --- */

function renderInspectorMarkup(scope, targetRef, style) {
  return `
    <div class="inspector-close-row"><span>Customize</span><button class="inspector-close-btn" onclick="closeInspector('${scope}','${targetRef}')">×</button></div>
    ${renderColorPickerInput('Header', scope, targetRef, 'headBg', style?.headBg || '#f1f5f9')}
    ${renderColorPickerInput('Body', scope, targetRef, 'bodyBg', style?.bodyBg || '#ffffff')}
    ${renderColorPickerInput('Border', scope, targetRef, 'borderCol', style?.borderCol || '#e2e8f0')}
    ${renderColorPickerInput('Text', scope, targetRef, 'textCol', style?.textCol || '#1e293b')}
    <div><label>Font Size</label>
        <select onchange="mutateStyle('${scope}','${targetRef}','fontSz',this.value)">
            <option value="12px" ${style?.fontSz === '12px' ? 'selected' : ''}>Small</option>
            <option value="14px" ${style?.fontSz === '14px' ? 'selected' : ''}>Medium</option>
            <option value="18px" ${style?.fontSz === '18px' ? 'selected' : ''}>Large</option>
        </select>
    </div>`;
}

function renderColorPickerInput(label, scope, targetRef, property, value) {
  return `
    <div class="color-picker-block">
      <label>${label}</label>
      <div class="color-picker-row">
        <input type="color" value="${value}" oninput="mutateStyle('${scope}','${targetRef}','${property}', this.value, false)">
        <div class="theme-swatch-row">
            <button class="theme-swatch" onclick="applyThemeSwatch('${scope}','${targetRef}','${property}','--ui-accent')"></button>
            <button class="theme-swatch" onclick="applyThemeSwatch('${scope}','${targetRef}','${property}','--gradient-1')"></button>
        </div>
      </div>
    </div>`;
}

function applyThemeSwatch(scope, ref, property, cssVar) {
  const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  property === 'categoryBg' ? updateCategoryBg(color, false) : mutateStyle(scope, ref, property, color, false);
}

function openInspector(scope, ref) {
  openInspectorState = { scope, ref };
  document.querySelectorAll('.design-inspector').forEach(el => el.classList.add('hidden'));
  document.getElementById(`inspect-${scope}-${ref}`)?.classList.remove('hidden');
}

function closeInspector(scope, ref) {
  document.getElementById(`inspect-${scope}-${ref}`)?.classList.add('hidden');
  openInspectorState = null;
}

function mutateStyle(scope, ref, property, value, shouldRender = true) {
  if (scope === 'front') {
    let w = frontPageWidgets.find(item => item.id === ref);
    if (w) w.style[property] = value;
    localStorage.setItem('devos_front_geo_v7', JSON.stringify(frontPageWidgets));
  } else {
    data[activeIdx].widgets[ref].style[property] = value;
  }

  if (!shouldRender) {
    updateWidgetDomStyles(scope, ref, property, value);
  } else {
    render();
  }
}

function updateWidgetDomStyles(scope, ref, property, value) {
  const widget = document.getElementById(`inspect-${scope}-${ref}`)?.closest('.widget');
  if (!widget) return;
  if (property === 'headBg') widget.querySelector('.widget-header').style.background = value;
  if (property === 'bodyBg') widget.style.background = value;
  if (property === 'borderCol') widget.style.borderColor = value;
  if (property === 'textCol') widget.style.color = value;
}

/* --- WIDGET CONTENT GENERATORS --- */

function renderWidgetBody(w, i) {
  switch (w.type) {
    case 'list': return `
      <div class="list-widget">
        ${w.tasks.map((t, ti) => `
          <div class="task-composite-row">
            <div class="task-main-line">
              <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${i},${ti})">
              <span style="${t.done ? 'text-decoration:line-through; opacity:0.4' : ''}">${t.text}</span>
              <button class="del-btn" onclick="deleteTask(${i},${ti})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="task-extended-inputs">
              <input type="text" value="${t.note || ''}" placeholder="Note..." onchange="updateTaskSub(${i},${ti},'note',this.value)">
            </div>
          </div>`).join('')}
        <input type="text" id="t-in-${i}" placeholder="+ Add Task" onkeydown="if(event.key==='Enter')addTask(${i})" style="margin-top:10px; width:100%; padding:5px; border-radius:5px; border:1px solid #ddd;">
      </div>`;
    case 'checklist': return `
      <div class="checklist-container">
        ${w.checkItems.map((item, ci) => `
          <div class="checklist-row">
            <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleCheckItem(${i}, ${ci})">
            <input type="text" class="checklist-text" value="${item.text}" onchange="updateCheckItemText(${i}, ${ci}, this.value)">
          </div>`).join('')}
        <button class="workspace-btn" onclick="addCheckItem(${i})" style="font-size:0.7rem; padding:2px;">+ Item</button>
      </div>`;
    case 'clock': return `<div class="digital-clock-face live-clock-face">--:--:--</div>`;
    case 'timer': return `
      <div style="text-align:center;">
        <div id="timer-face-${i}" class="digital-clock-face">${parseSecondsToTimerFace(w.timerElapsed || 0)}</div>
        <div class="time-btn-cluster">
          <button class="time-mini-btn" onclick="triggerTimerState(${i},'toggle')">${w.timerRunning ? 'Pause' : 'Start'}</button>
          <button class="time-mini-btn" onclick="triggerTimerState(${i},'clear')">Reset</button>
        </div>
      </div>`;
    case 'calendar': return parseHtmlCalendarBlock(w.style?.textCol);
    case 'schedule': return `
      <div class="schedule-container">
        ${w.schedItems.map((row, ri) => `
          <div class="schedule-row">
            <input type="text" class="schedule-time-lbl" value="${row.hour}" onchange="updateScheduleHour(${i},${ri},this.value)">
            <input type="text" class="schedule-input" value="${row.task}" onchange="updateScheduleTask(${i},${ri},this.value)">
          </div>`).join('')}
        <button class="workspace-btn" onclick="addScheduleRow(${i})" style="font-size:0.7rem;">+ Slot</button>
      </div>`;
    default: return `<textarea onchange="updateWidgetProp(${i},'content',this.value)" style="width:100%; height:100%; background:transparent; border:none; color:inherit; resize:none; outline:none;">${w.content || ''}</textarea>`;
  }
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

/* --- PHYSICS & INTERACT.JS --- */

function initPhysics() {
  interact('.widget').draggable({
    allowFrom: '.widget-header',
    listeners: {
      start(event) { event.target.style.zIndex = "1000"; },
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x); target.setAttribute('data-y', y);
        if (activeIdx === null) {
          let w = frontPageWidgets.find(f => f.id === target.dataset.geoId);
          if (w) w.pos = { x, y };
        } else {
          data[activeIdx].widgets[target.dataset.index].pos = { x, y };
        }
      },
      end(event) {
        event.target.style.zIndex = "";
        localStorage.setItem('devos_horizon_v7', JSON.stringify(data));
        localStorage.setItem('devos_front_geo_v7', JSON.stringify(frontPageWidgets));
      }
    }
  }).resizable({
    edges: { right: true, bottom: true },
    listeners: {
      move(event) {
        const target = event.target;
        target.style.width = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';
        if (activeIdx === null) {
          let w = frontPageWidgets.find(f => f.id === target.dataset.geoId);
          if (w) w.size = { w: event.rect.width, h: event.rect.height };
        } else {
          data[activeIdx].widgets[target.dataset.index].size = { w: event.rect.width, h: event.rect.height };
        }
      }
    }
  });

  interact('.category-shortcut-card').draggable({
    listeners: {
      move(event) {
        categoryDragMoved = true;
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x); target.setAttribute('data-y', y);
        data[target.dataset.catIndex].pos = { x, y };
      },
      end() {
        setTimeout(() => categoryDragMoved = false, 100);
        localStorage.setItem('devos_horizon_v7', JSON.stringify(data));
      }
    }
  });
}

/* --- STATE CHANGERS --- */

function addProject() {
  const n = prompt("Folder Name:");
  if (n) {
    data.push({ name: n, widgets: [], pos: { x: 50, y: 250 }, size: { w: 200, h: 120 }, bgColor: '#ffffff' });
    render();
  }
}

function addWidget() {
  const t = document.getElementById('w-type').value;
  data[activeIdx].widgets.push({
    type: t, title: t.toUpperCase(), pos: { x: 50, y: 50 }, size: { w: 250, h: 200 },
    tasks: [], links: [], content: '', deadline: '', timerElapsed: 0, timerRunning: false,
    schedItems: [{ hour: '09:00', task: '' }], checkItems: [],
    style: { headBg: '#ffffff', bodyBg: '#ffffff', textCol: '#1e293b', borderCol: '#e2e8f0', fontSz: '14px' }
  });
  render();
}

function openProject(i, event) { if (!categoryDragMoved) { activeIdx = i; render(); } }
function goHome() { activeIdx = null; render(); }
function delWid(i) { data[activeIdx].widgets.splice(i, 1); render(); }
function updateWidgetProp(wi, prop, val) { data[activeIdx].widgets[wi][prop] = val; render(); }
function updateFrontTitle(id, val) { let w = frontPageWidgets.find(i => i.id === id); if (w) w.title = val; render(); }

// List Helpers
function addTask(wi) {
  const val = document.getElementById(`t-in-${wi}`).value;
  if (val) { data[activeIdx].widgets[wi].tasks.push({ text: val, done: false }); render(); }
}
function toggleTask(wi, ti) { data[activeIdx].widgets[wi].tasks[ti].done = !data[activeIdx].widgets[wi].tasks[ti].done; render(); }
function deleteTask(wi, ti) { data[activeIdx].widgets[wi].tasks.splice(ti, 1); render(); }
function updateTaskSub(wi, ti, prop, val) { data[activeIdx].widgets[wi].tasks[ti][prop] = val; }

// Timer Helpers
function triggerTimerState(wi, cmd) {
  let w = data[activeIdx].widgets[wi];
  if (cmd === 'toggle') w.timerRunning = !w.timerRunning;
  if (cmd === 'clear') { w.timerRunning = false; w.timerElapsed = 0; }
  render();
}

// Category BG
function updateCategoryBg(color, shouldRender = true) {
  data[activeIdx].bgColor = color;
  document.documentElement.style.setProperty('--page-bg', color);
  if (shouldRender) render();
}

// Hourly Schedule Helpers
function addScheduleRow(wi) { data[activeIdx].widgets[wi].schedItems.push({ hour: '12:00', task: '' }); render(); }
function updateScheduleHour(wi, ri, val) { data[activeIdx].widgets[wi].schedItems[ri].hour = val; }
function updateScheduleTask(wi, ri, val) { data[activeIdx].widgets[wi].schedItems[ri].task = val; }

// Initial Launch
render();