/* --- ULTIMATE PLANNER ENGINE: WEEK-SPECIFIC LOGIC & ALL-DAY EVENTS --- */

let plannerDate = new Date(); // Datumet vi "tittar" på
let activeTargetDate = null;  // Det exakta datumet (YYYY-MM-DD) för ett nytt event
let currentIconType = 'emoji';
let selectedIconData = '✨';

// Hämta sparade data från localStorage
let plannerEvents = JSON.parse(localStorage.getItem('alvis_planner_events_v2')) || {};

// Ändrad till ett objekt där nyckeln blir veckan, t.ex. "2026-W26"
let plannerWeeklyData = JSON.parse(localStorage.getItem('alvis_planner_weekly_data')) || {};

/* --- NAVIGATION --- */
function changePlannerMonth(direction) {
  plannerDate.setMonth(plannerDate.getMonth() + direction);
  renderFullscreenPlanner();
}

function changePlannerWeek(direction) {
  plannerDate.setDate(plannerDate.getDate() + (direction * 7));
  renderFullscreenPlanner();
}

function goToDate(day, month, year) {
  plannerDate = new Date(year, month, day);
  renderFullscreenPlanner();
}

// Hjälpfunktion för att hitta måndagen i den vecka ett visst datum befinner sig
function getMonday(d) {
  d = new Date(d);
  const day = d.getDay(),
    diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Formaterar datumet helt efter lokal tidszon istället för UTC
function formatDateKey(date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

// Skapar en unik nyckel för veckan, t.ex. "2026-W25"
function getWeekKey(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target) / 604800000);
  return `${target.getFullYear()}-W${weekNum}`;
}

// Hämtar data för den aktuella veckan, eller skapar tomma mallar om det inte finns
function getCurrentWeeklyData() {
  const weekKey = getWeekKey(plannerDate);
  if (!plannerWeeklyData[weekKey]) {
    plannerWeeklyData[weekKey] = {
      goals: [],
      todos: [],
      notes: '',
      reminders: ''
    };
  }
  return plannerWeeklyData[weekKey];
}

function saveWeeklyDataState() {
  localStorage.setItem('alvis_planner_weekly_data', JSON.stringify(plannerWeeklyData));
}

/* --- MODAL / EVENT LOGIK --- */
function openEventModal(dateKey) {
  activeTargetDate = dateKey;
  currentIconType = 'emoji';
  selectedIconData = '✨';

  const modal = document.getElementById('planner-event-modal');
  if (modal) {
    modal.classList.add('open');
    document.getElementById('event-title').value = '';
    document.getElementById('event-is-allday').checked = false;
    document.getElementById('event-time-row').style.display = 'block';
    document.getElementById('event-time').value = '12:00';
    document.getElementById('event-color').value = '#e2d5f3';
    document.getElementById('event-textcolor').value = '#431d5b';
    document.getElementById('event-location').value = '';
    document.getElementById('event-notes').value = '';
    document.getElementById('event-custom-emoji').value = '✨';
  }
}

function toggleAllDaySelector(checked) {
  const timeRow = document.getElementById('event-time-row');
  if (timeRow) {
    timeRow.style.display = checked ? 'none' : 'block';
  }
}

function closeEventModal() {
  const modal = document.getElementById('planner-event-modal');
  if (modal) modal.classList.remove('open');
}

function savePlannerEvent() {
  if (!activeTargetDate) return;
  const title = document.getElementById('event-title').value.trim();
  if (!title) return alert('Vänligen fyll i en titel!');

  if (currentIconType === 'emoji') {
    selectedIconData = document.getElementById('event-custom-emoji').value.trim() || '✨';
  }

  const isAllDay = document.getElementById('event-is-allday').checked;

  const newEvent = {
    id: Date.now(),
    title,
    isAllDay,
    time: isAllDay ? '00:00' : document.getElementById('event-time').value,
    color: document.getElementById('event-color').value,
    textColor: document.getElementById('event-textcolor').value,
    location: document.getElementById('event-location').value.trim(),
    notes: document.getElementById('event-notes').value.trim(),
    iconType: currentIconType,
    icon: selectedIconData
  };

  if (!plannerEvents[activeTargetDate]) plannerEvents[activeTargetDate] = [];
  plannerEvents[activeTargetDate].push(newEvent);

  // Sortera: Heldag först, därefter efter klockslag
  plannerEvents[activeTargetDate].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return a.time.localeCompare(b.time);
  });

  localStorage.setItem('alvis_planner_events_v2', JSON.stringify(plannerEvents));
  closeEventModal();
  renderFullscreenPlanner();
}

function deletePlannerEvent(dateKey, eventId) {
  plannerEvents[dateKey] = plannerEvents[dateKey].filter(e => e.id !== eventId);
  localStorage.setItem('alvis_planner_events_v2', JSON.stringify(plannerEvents));
  renderFullscreenPlanner();
}

/* --- DYNAMISKA LISTOR (VECKO-SPECIFIKA) --- */
function addPlannerItem(type) {
  const weekData = getCurrentWeeklyData();
  weekData[type].push({ id: Date.now(), text: '', checked: false });
  saveWeeklyDataState();
  renderFullscreenPlanner();
}

function togglePlannerItemCheck(type, id, checked) {
  const weekData = getCurrentWeeklyData();
  const item = weekData[type].find(i => i.id === id);
  if (item) item.checked = checked;
  saveWeeklyDataState();
}

function updatePlannerItemText(type, id, val) {
  const weekData = getCurrentWeeklyData();
  const item = weekData[type].find(i => i.id === id);
  if (item) item.text = val;
  saveWeeklyDataState();
}

function deletePlannerItem(type, id) {
  const weekData = getCurrentWeeklyData();
  weekData[type] = weekData[type].filter(i => i.id !== id);
  saveWeeklyDataState();
  renderFullscreenPlanner();
}

function updateWeeklyFreeText(key, val) {
  const weekData = getCurrentWeeklyData();
  weekData[key] = val;
  saveWeeklyDataState();
}

function renderDynamicListHtml(type) {
  const weekData = getCurrentWeeklyData();
  const list = weekData[type] || [];
  return list.map(item => `
    <div class="planner-list-item dynamic-item">
      <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="togglePlannerItemCheck('${type}', ${item.id}, this.checked)">
      <input type="text" value="${escapeHtml(item.text)}" onchange="updatePlannerItemText('${type}', ${item.id}, this.value)">
      <button class="list-item-del-btn" onclick="deletePlannerItem('${type}', ${item.id})"><i class="fas fa-trash"></i></button>
    </div>`).join('') || `<div class="no-events">Klicka på + för att lägga till...</div>`;
}

/* --- HUVUDRENDERING --- */
function renderFullscreenPlanner() {
  const canvas = document.getElementById('main-canvas');
  if (!canvas) return;

  const today = new Date();
  const todayKey = formatDateKey(today);

  const viewYear = plannerDate.getFullYear();
  const viewMonth = plannerDate.getMonth();
  const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  const weekdayNamesShort = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  if (document.getElementById('category-title-banner')) {
    const bannerNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
    document.getElementById('category-title-banner').innerText = `${bannerNames[today.getDay()]} ${today.getDate()} ${monthNames[today.getMonth()]}`;
  }

  // Hämta veckans texter
  const weekData = getCurrentWeeklyData();

  // --- MINIKALENDER (VÄNSTER) ---
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const swedishFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  let miniCalHtml = '';
  for (let i = 0; i < swedishFirstDay; i++) miniCalHtml += `<div class="mini-cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    const dateKey = formatDateKey(dateObj);
    const isToday = dateKey === todayKey ? 'today' : '';
    const isSelected = formatDateKey(plannerDate) === dateKey ? 'selected' : '';

    miniCalHtml += `
      <div class="mini-cal-day ${isToday} ${isSelected}" onclick="goToDate(${d}, ${viewMonth}, ${viewYear})">
        ${d}
      </div>`;
  }

  // --- VECKOPLAN MED NAVIGATION (MITTEN) ---
  const startOfWeek = getMonday(plannerDate);
  let weekGridHtml = '';
  const dayNamesLong = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    const dateKey = formatDateKey(currentDay);
    const isDayToday = dateKey === todayKey;

    weekGridHtml += `
      <div class="week-day-box ${isDayToday ? 'today-box' : ''} ${i === 6 ? 'full-width' : ''}">
        <div class="week-day-header-row">
          <div class="week-day-title">
            ${dayNamesLong[i]} <small>${currentDay.getDate()}/${currentDay.getMonth() + 1}</small>
          </div>
          <button class="add-event-trigger-btn" onclick="openEventModal('${dateKey}')"><i class="fas fa-plus"></i></button>
        </div>
        <div class="week-day-events-viewport">
          ${renderEventsForDate(dateKey)}
        </div>
      </div>
    `;
  }

  // Sortera fram veckonummer i formatet "Vecka X"
  const currentWeekNum = getWeekKey(plannerDate).split('-W')[1];

  canvas.innerHTML = `
    <div class="full-screen-planner-view">
      <div class="planner-panel">
        <div class="mini-calendar-section">
          <div class="planner-month-nav">
            <button class="planner-nav-btn" onclick="changePlannerMonth(-1)"><i class="fas fa-chevron-left"></i></button>
            <span class="planner-nav-title">${monthNames[viewMonth]}</span>
            <button class="planner-nav-btn" onclick="changePlannerMonth(1)"><i class="fas fa-chevron-right"></i></button>
          </div>
          <div class="mini-cal-grid">
            ${weekdayNamesShort.map(n => `<div class="mini-cal-header">${n}</div>`).join('')}
            ${miniCalHtml}
          </div>
        </div>
        <div class="section-header-with-btn">
          <h3><i class="fas fa-bullseye"></i> Veckans Mål</h3>
          <button class="add-list-item-btn" onclick="addPlannerItem('goals')"><i class="fas fa-plus"></i></button>
        </div>
        <div class="planner-list-container">${renderDynamicListHtml('goals')}</div>
        <div class="planner-free-notes-box">
          <h3><i class="fas fa-sticky-note"></i> Veckonoteringar</h3>
          <textarea placeholder="Skriv fritt för denna vecka..." oninput="updateWeeklyFreeText('notes', this.value)">${escapeHtml(weekData.notes)}</textarea>
        </div>
      </div>

      <div class="planner-panel">
        <div class="planner-week-header inline-navigation">
          <div class="week-nav-wrapper">
            <button class="week-nav-arrow" onclick="changePlannerWeek(-1)"><i class="fas fa-chevron-left"></i></button>
            <h3><i class="far fa-clock"></i> Vecka ${currentWeekNum}</h3>
            <button class="week-nav-arrow" onclick="changePlannerWeek(1)"><i class="fas fa-chevron-right"></i></button>
          </div>
          <button class="planner-today-btn" onclick="goToDate(${today.getDate()}, ${today.getMonth()}, ${today.getFullYear()})">Idag</button>
        </div>
        <div class="week-grid">${weekGridHtml}</div>
      </div>

      <div class="planner-panel">
        <div class="section-header-with-btn">
          <h3><i class="fas fa-check-square"></i> Veckans To-Do</h3>
          <button class="add-list-item-btn" onclick="addPlannerItem('todos')"><i class="fas fa-plus"></i></button>
        </div>
        <div class="planner-list-container">${renderDynamicListHtml('todos')}</div>
        <div class="planner-reminders-box">
          <h3><i class="fas fa-bell"></i> Kom ihåg!</h3>
          <textarea placeholder="Viktigt för denna vecka..." oninput="updateWeeklyFreeText('reminders', this.value)">${escapeHtml(weekData.reminders)}</textarea>
        </div>
      </div>
    </div>

    <div id="planner-event-modal" class="planner-modal-overlay">
      <div class="planner-modal-window">
        <div class="planner-modal-header">
          <h4>Planera Event</h4>
          <button class="modal-close-x" onclick="closeEventModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="planner-modal-body">
          <label>Titel <input type="text" id="event-title" placeholder="Vad händer?"></label>
          
          <label class="modal-checkbox-row">
            <input type="checkbox" id="event-is-allday" onchange="toggleAllDaySelector(this.checked)">
            <span>Heldagsevent</span>
          </label>

          <div class="modal-tab-container">
            <div class="modal-tabs">
              <button id="btn-icon-emoji" class="modal-tab-btn active" onclick="setIconType('emoji')">Emoji</button>
              <button id="btn-icon-upload" class="modal-tab-btn" onclick="setIconType('image')">Bild</button>
            </div>
          </div>
          <div id="modal-emoji-section" class="emoji-picker-view">
            <div class="quick-emojis-grid">
              <span onclick="selectQuickEmoji('🌸')">🌸</span><span onclick="selectQuickEmoji('📚')">📚</span>
              <span onclick="selectQuickEmoji('☕')">☕</span><span onclick="selectQuickEmoji('🎧')">🎧</span>
              <span onclick="selectQuickEmoji('💖')">💖</span><span onclick="selectQuickEmoji('🐾')">🐾</span>
            </div>
            <input type="text" id="event-custom-emoji" value="✨">
          </div>
          <div id="modal-upload-section" style="display:none;">
            <label class="modal-file-upload-label">Ladda upp ikon <input type="file" accept="image/*" onchange="handleIconImageUpload(this)"></label>
            <div id="modal-icon-img-preview" class="modal-icon-preview-box"></div>
          </div>
          <div class="modal-split-row">
            <label>Bakgrund <input type="color" id="event-color" value="#e2d5f3"></label>
            <label>Text <input type="color" id="event-textcolor" value="#431d5b"></label>
          </div>
          
          <div class="modal-flex-row">
            <div id="event-time-row" style="flex:1;">
              <label>Tid <input type="time" id="event-time" value="12:00"></label>
            </div>
            <div style="flex:1;">
              <label>Plats <input type="text" id="event-location" placeholder="Var?"></label>
            </div>
          </div>
          <label>Notes <textarea id="event-notes"></textarea></label>
        </div>
        <div class="planner-modal-footer">
          <button class="planner-btn-save-full" onclick="savePlannerEvent()">Spara</button>
        </div>
      </div>
    </div>
  `;
  setupColorPickerListeners();
}

function renderEventsForDate(dateKey) {
  const events = plannerEvents[dateKey] || [];
  if (events.length === 0) return `<div class="no-events">Inget planerat</div>`;
  return events.map(e => `
    <div class="planner-event-card completely-covered" style="background: ${e.color}; color: ${e.textColor};">
      <div class="event-card-main">
        ${e.iconType === 'image' ? `<img src="${e.icon}" class="event-card-custom-icon-img" />` : `<span class="event-card-icon">${e.icon}</span>`}
        <div class="event-card-details">
          <div class="event-card-header-line">
            <strong style="color: ${e.textColor};">${e.title}</strong>
            <span class="event-card-time-tag">${e.isAllDay ? 'Heldag' : e.time}</span>
          </div>
          ${e.location ? `<small style="opacity:0.8;"><i class="fas fa-map-marker-alt"></i> ${e.location}</small>` : ''}
        </div>
        <button class="event-del-btn" style="color: ${e.textColor}; opacity:0.5;" onclick="deletePlannerEvent('${dateKey}', ${e.id})"><i class="fas fa-times"></i></button>
      </div>
    </div>
  `).join('');
}

/* --- EXTRA HJÄLPFUNKTIONER --- */
function setupColorPickerListeners() {
  const bgInput = document.getElementById('event-color');
  const textInput = document.getElementById('event-textcolor');
  if (bgInput) bgInput.oninput = (e) => { };
  if (textInput) textInput.oninput = (e) => { };
}
function setIconType(type) {
  currentIconType = type;
  document.getElementById('btn-icon-emoji').classList.toggle('active', type === 'emoji');
  document.getElementById('btn-icon-upload').classList.toggle('active', type === 'image');
  document.getElementById('modal-emoji-section').style.display = type === 'emoji' ? 'block' : 'none';
  document.getElementById('modal-upload-section').style.display = type === 'image' ? 'block' : 'none';
}
function selectQuickEmoji(emoji) { document.getElementById('event-custom-emoji').value = emoji; selectedIconData = emoji; }
function handleIconImageUpload(input) {
  const reader = new FileReader();
  reader.onload = e => { selectedIconData = e.target.result; document.getElementById('modal-icon-img-preview').innerHTML = `<img src="${e.target.result}" />`; };
  reader.readAsDataURL(input.files[0]);
}
function setupColorPickerListeners() { }