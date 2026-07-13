/* --- STATE CHANGERS --- */

function addProject() {
  const nextNumber = data.length + 1;
  const planningSub = createDefaultSubcategory('Planering');
  const taskSub = createDefaultSubcategory('Tasks');
  const taskWidget = createDefaultWidget('list');
  const scheduleWidget = createDefaultWidget('schedule');
  taskWidget.subcategoryId = taskSub.id;
  scheduleWidget.subcategoryId = planningSub.id;
  data.push(normalizeCategory({
    name: `Ny kategori ${nextNumber}`,
    icon: 'fa-folder',
    subcategories: [planningSub, taskSub],
    widgets: [taskWidget, scheduleWidget],
    pos: { x: 50 + (data.length * 230), y: 300 },
    size: { w: 220, h: 140 },
    bgColor: '#ffffff'
  }, data.length));
  render();
}

function createStarterWorkspace() {
  const planningSub = createDefaultSubcategory('Planering');
  const focusSub = createDefaultSubcategory('Fokus');
  const routinesSub = createDefaultSubcategory('Rutiner');
  const widgets = [
    createDefaultWidget('list'),
    createDefaultWidget('board'),
    createDefaultWidget('schedule'),
    createDefaultWidget('habits'),
    createDefaultWidget('pomodoro'),
    createDefaultWidget('goals')
  ];
  widgets[0].subcategoryId = planningSub.id;
  widgets[1].subcategoryId = planningSub.id;
  widgets[2].subcategoryId = focusSub.id;
  widgets[3].subcategoryId = routinesSub.id;
  widgets[4].subcategoryId = focusSub.id;
  widgets[5].subcategoryId = routinesSub.id;

  data.push(normalizeCategory({
    name: 'Planner',
    icon: 'fa-calendar',
    bgColor: '#f8fafc',
    accent: '#2563eb',
    subcategories: [planningSub, focusSub, routinesSub],
    widgets,
    pos: { x: 50 + (data.length * 230), y: 300 },
    size: { w: 220, h: 140 }
  }, data.length));
  activeIdx = data.length - 1;
  render();
}

function addWidget() {
  const type = document.getElementById('w-type').value;
  const widget = createDefaultWidget(type);
  widget.subcategoryId = activeSubId && activeSubId !== 'uncategorized' ? activeSubId : null;
  data[activeIdx].widgets.push(widget);
  render();
}

function addTaskWidget() {
  const widget = createDefaultWidget('list');
  widget.subcategoryId = activeSubId && activeSubId !== 'uncategorized' ? activeSubId : null;
  data[activeIdx].widgets.push(widget);
  render();
}

function duplicateWidget(index) {
  const copy = JSON.parse(JSON.stringify(data[activeIdx].widgets[index]));
  copy.pos = { x: copy.pos.x + 28, y: copy.pos.y + 28 };
  copy.title = `${copy.title} COPY`;
  data[activeIdx].widgets.push(copy);
  render();
}

function deleteActiveCategory() {
  if (activeIdx === null) return;
  data.splice(activeIdx, 1);
  activeIdx = null;
  activeSubId = null;
  render();
}

function clearCompletedTasks() {
  if (activeIdx === null) return;
  data[activeIdx].widgets.forEach(widget => {
    if (widget.tasks) widget.tasks = widget.tasks.filter(task => !task.done && task.status !== 'done');
    if (widget.checkItems) widget.checkItems = widget.checkItems.filter(item => !item.done);
  });
  render();
}

function updateMenuActiveStates() {
  const frontpageBtn = document.getElementById('frontpage-btn');
  const plineringBtn = document.getElementById('planering-btn');
  if (frontpageBtn) {
    if (activeIdx === null) {
      frontpageBtn.classList.add('active');
    } else {
      frontpageBtn.classList.remove('active');
    }
  }
  if (plineringBtn) {
    plineringBtn.classList.remove('active');
  }
}

function openProject(i, event) { 
  if (!categoryDragMoved) { 
    activeIdx = i; 
    activeSubId = null; 
    render();
    updateMenuActiveStates();
  } 
}

function goHome() { 
  activeIdx = null; 
  activeSubId = null; 
  render();
  updateMenuActiveStates();
}
function delWid(i) { data[activeIdx].widgets.splice(i, 1); render(); }
function updateWidgetProp(wi, prop, val) {
  if (prop === 'clockFontSize' || prop === 'timerFontSize' || prop === 'pomodoroFontSize') {
    val = normalizeCssSize(val, '3.4rem');
  }
  if (prop === 'notificationVolume') {
    val = normalizeNotificationVolume(val, 0.7);
  }
  data[activeIdx].widgets[wi][prop] = val;
  render();
}

function setNotificationSoundFile(wi, file) {
  if (!file || activeIdx === null) return;
  const widget = data[activeIdx].widgets[wi];
  if (!widget) return;
  const reader = new FileReader();
  reader.onload = () => {
    widget.notificationSound = 'custom';
    widget.notificationAudioSrc = reader.result;
    widget.notificationAudioName = file.name || 'custom-audio';
    render();
  };
  reader.readAsDataURL(file);
}

function clearNotificationSoundFile(wi) {
  if (activeIdx === null) return;
  const widget = data[activeIdx].widgets[wi];
  if (!widget) return;
  widget.notificationSound = 'bell';
  widget.notificationAudioSrc = '';
  widget.notificationAudioName = '';
  render();
}
function appendCalculatorToken(wi, token) {
  let w = data[activeIdx].widgets[wi];
  w.calcInput = `${w.calcInput || ''}${token}`;
  render();
}
function deleteCalculatorChar(wi) {
  let w = data[activeIdx].widgets[wi];
  w.calcInput = (w.calcInput || '').slice(0, -1);
  render();
}
function clearCalculator(wi) {
  let w = data[activeIdx].widgets[wi];
  w.calcInput = '';
  w.calcResult = '';
  render();
}
function appendGraphToken(wi, token) {
  let w = data[activeIdx].widgets[wi];
  w.graphExpr = `${w.graphExpr || ''}${token}`;
  render();
}
function deleteGraphChar(wi) {
  let w = data[activeIdx].widgets[wi];
  w.graphExpr = (w.graphExpr || '').slice(0, -1);
  render();
}
function clearGraphExpr(wi) {
  let w = data[activeIdx].widgets[wi];
  w.graphExpr = '';
  render();
}
function updateFrontTitle(id, val) { let w = frontPageWidgets.find(i => i.id === id); if (w) w.title = val; render(); }

function updateCategoryName(value, shouldRender = true) {
  data[activeIdx].name = value || `Kategori ${activeIdx + 1}`;
  if (shouldRender) render();
  else {
    document.getElementById('category-title-banner').innerText = data[activeIdx].name;
    document.getElementById('category-index').innerText = data[activeIdx].name;
    storage.set('_horizon_v7', data);
  }
}

function updateCategoryIcon(value) {
  data[activeIdx].icon = value;
  data[activeIdx].iconImage = '';
  render();
}

function updateCategoryIconImage(value) {
  data[activeIdx].iconImage = value.trim();
  render();
}

function updateCategoryIconImageFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    data[activeIdx].iconImage = reader.result;
    render();
  };
  reader.readAsDataURL(file);
}

function clearCategoryIconImage() {
  data[activeIdx].iconImage = '';
  render();
}

function addMediaFiles(wi, files) {
  const widget = data[activeIdx].widgets[wi];
  const fileList = Array.from(files || []);
  if (!fileList.length) return;

  let pending = fileList.length;
  fileList.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      widget.mediaItems.push({
        name: file.name,
        type: file.type,
        src: reader.result
      });
      pending -= 1;
      if (pending === 0) render();
    };
    reader.readAsDataURL(file);
  });
}

function deleteMediaItem(wi, mediaIndex) {
  data[activeIdx].widgets[wi].mediaItems.splice(mediaIndex, 1);
  render();
}

function setImageCoverFile(wi, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    data[activeIdx].widgets[wi].imageSrc = reader.result;
    data[activeIdx].widgets[wi].imageName = file.name;
    render();
  };
  reader.readAsDataURL(file);
}

function setImageCoverUrl(wi, value) {
  data[activeIdx].widgets[wi].imageSrc = value.trim();
  data[activeIdx].widgets[wi].imageName = value.trim() ? 'Linked image' : '';
  render();
}

function clearImageCover(wi) {
  data[activeIdx].widgets[wi].imageSrc = '';
  data[activeIdx].widgets[wi].imageName = '';
  render();
}

function updateCategoryAccent(value) {
  data[activeIdx].accent = value;
  document.documentElement.style.setProperty('--ui-accent', value);
  render();
}

function triggerUploadImage() {
  if (activeIdx === null) {
    if (!data.length) addProject();
    activeIdx = data.length - 1;
    activeSubId = null;
    render();
  }
  const input = document.getElementById('image-widget-upload');
  if (input) {
    input.value = '';
    input.click();
  }
}

function handleUploadImageFile(files) {
  if (!files || !files.length) return;
  const file = files[0];
  if (!file) return;
  if (activeIdx === null) {
    if (!data.length) addProject();
    activeIdx = data.length - 1;
    activeSubId = null;
  }

  const widget = createDefaultWidget('image');
  widget.subcategoryId = activeSubId && activeSubId !== 'uncategorized' ? activeSubId : null;
  widget.title = '';
  widget.imageName = file.name;
  data[activeIdx].widgets.push(widget);
  const newIndex = data[activeIdx].widgets.length - 1;

  const reader = new FileReader();
  reader.onload = () => {
    data[activeIdx].widgets[newIndex].imageSrc = reader.result;
    render();
  };
  reader.readAsDataURL(file);
  render();
}

function exportAppData() {
  const exportBlob = new Blob([JSON.stringify({
    version: 1,
    data,
    frontPageWidgets
  }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(exportBlob);
  link.download = `to-do-export-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  if (typeof showToast === 'function') showToast('success', 'Export started.');
}

function triggerImportData() {
  const input = document.getElementById('import-data-file');
  if (!input) return;
  input.value = '';
  input.click();
}
function handleImportDataFile(files) {
  if (!files || !files.length) return;
  const file = files[0];
  if (!file) return;

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    if (!confirm('File is larger than 5MB and may take time to import. Continue?')) return;
  }

  const progWrap = document.getElementById('import-progress');
  const progBar = document.getElementById('import-progress-bar');
  const progText = document.getElementById('import-progress-text');
  if (progWrap) { progWrap.style.display = 'flex'; if (progBar) progBar.value = 0; if (progText) progText.textContent = '0%'; }

  pushSnapshot(); // allow undo

  const reader = new FileReader();
  reader.onprogress = (e) => {
    if (e.lengthComputable && progBar) {
      const p = Math.round((e.loaded / e.total) * 100);
      progBar.value = p;
      if (progText) progText.textContent = p + '%';
    }
  };
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (typeof validateImport === 'function') {
        const result = validateImport(imported);
        if (!result.valid) throw new Error(result.errors.join('; '));
      } else {
        if (!imported || typeof imported !== 'object') throw new Error('Invalid JSON');
        if (!Array.isArray(imported.data) || !Array.isArray(imported.frontPageWidgets)) {
          throw new Error('The import file must contain a valid data structure.');
        }
      }
      if (!confirm('Importing data will replace your current workspace and lists. Continue?')) { if (progWrap) progWrap.style.display = 'none'; return; }

      data = imported.data.map(normalizeCategory);
      frontPageWidgets = imported.frontPageWidgets.map(widget => normalizeWidget(widget));
      activeIdx = null;
      activeSubId = null;
      storage.set('_horizon_v7', data);
      storage.set('alvis_front_geo', frontPageWidgets);
      render();
      showToast('success', 'Data imported successfully.');
    } catch (error) {
      console.error(error);
      showToast('error', 'Unable to import data: ' + (error.message || error));
    } finally {
      if (progWrap) { setTimeout(() => { progWrap.style.display = 'none'; if (progBar) progBar.value = 0; if (progText) progText.textContent = ''; }, 500); }
    }
  };
  reader.onerror = () => { showToast('error','Unable to read file.'); if (progWrap) progWrap.style.display = 'none'; };
  reader.readAsText(file);
}

// --- Import UX helpers: toast, snapshots, drag/drop, undo ---
function showToast(type, message, timeout = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.right = '16px';
    container.style.top = '16px';
    container.style.zIndex = 9999;
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + (type || 'info');
  el.textContent = message;
  el.style.margin = '6px 0';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '6px';
  el.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
  el.style.color = '#fff';
  el.style.fontSize = '13px';
  el.style.opacity = '1';
  if (type === 'success') el.style.background = '#10b981';
  else if (type === 'error') el.style.background = '#ef4444';
  else el.style.background = 'rgba(30,41,59,0.9)';
  container.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity 0.3s ease'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, timeout);
}

function pushSnapshot() {
  window._snapshots = window._snapshots || [];
  try {
    const snap = { data: JSON.parse(JSON.stringify(data || [])), frontPageWidgets: JSON.parse(JSON.stringify(frontPageWidgets || [])) };
    window._snapshots.push(snap);
    if (window._snapshots.length > 20) window._snapshots.shift();
    const btn = document.getElementById('undo-import-btn'); if (btn) btn.disabled = false;
  } catch (e) { console.error('Snapshot failed', e); }
}

function undoLastChange() {
  window._snapshots = window._snapshots || [];
  if (!window._snapshots.length) { showToast('error','Nothing to undo'); return; }
  const snap = window._snapshots.pop();
  data = snap.data || [];
  frontPageWidgets = snap.frontPageWidgets || [];
  storage.set('_horizon_v7', data);
  storage.set('alvis_front_geo', frontPageWidgets);
  render();
  showToast('success','Undo successful');
  const btn = document.getElementById('undo-import-btn'); if (btn && !window._snapshots.length) btn.disabled = true;
}

function setupImportDropZone() {
  const zone = document.getElementById('import-drop-zone');
  if (!zone) return;
  ['dragenter','dragover','dragleave','drop'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }));
  zone.addEventListener('drop', e => {
    const dt = e.dataTransfer; if (dt && dt.files) handleImportDataFile(dt.files);
  });
  zone.addEventListener('click', () => triggerImportData());
  zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerImportData(); } });
}

document.addEventListener('DOMContentLoaded', () => {
  setupImportDropZone();
  const undoBtn = document.getElementById('undo-import-btn'); if (undoBtn) undoBtn.disabled = !(window._snapshots && window._snapshots.length);
});

// Subcategory Helpers
function addSubcategory() {
  if (activeIdx === null) return;
  const nextNumber = (data[activeIdx].subcategories || []).length + 1;
  const subcategory = createDefaultSubcategory(`Subkategori ${nextNumber}`);
  data[activeIdx].subcategories.push(subcategory);
  activeSubId = subcategory.id;
  render();
}

function selectSubcategory(subcategoryId) {
  activeSubId = subcategoryId;
  render();
}

function updateSubcategoryName(subcategoryId, value) {
  const subcategory = data[activeIdx].subcategories.find(item => item.id === subcategoryId);
  if (!subcategory) return;
  subcategory.name = value || 'Untitled section';
  render();
}

function deleteSubcategory(subcategoryId) {
  const category = data[activeIdx];
  category.subcategories = category.subcategories.filter(item => item.id !== subcategoryId);
  category.widgets.forEach(widget => {
    if (widget.subcategoryId === subcategoryId) widget.subcategoryId = null;
  });
  if (activeSubId === subcategoryId) activeSubId = null;
  render();
}

function moveWidgetToSubcategory(widgetIndex, subcategoryId) {
  data[activeIdx].widgets[widgetIndex].subcategoryId = subcategoryId || null;
  render();
}

// List Helpers
function addTask(wi) {
  const input = document.getElementById(`t-in-${wi}`);
  const value = input?.value.trim();
  if (!value) return;
  data[activeIdx].widgets[wi].tasks.push(createDefaultTask(value));
  render();
}

function toggleTask(wi, ti) {
  const task = data[activeIdx].widgets[wi].tasks[ti];
  const wasDone = Boolean(task.done);
  task.done = !task.done;
  task.status = task.done ? 'done' : 'todo';

  if (activeIdx !== null && activeIdx !== 'planering') {
    const category = data[activeIdx];
    if (!category.rewardState) {
      category.rewardState = { completedTasks: 0, streak: 0, badges: [] };
    }
    if (!wasDone && task.done) {
      category.rewardState.completedTasks += 1;
      category.rewardState.streak += 1;
      const badgeList = category.rewardState.badges || [];
      if (category.rewardState.completedTasks >= 1 && !badgeList.includes('sparkle')) badgeList.push('sparkle');
      if (category.rewardState.completedTasks >= 5 && !badgeList.includes('star')) badgeList.push('star');
      if (category.rewardState.completedTasks >= 10 && !badgeList.includes('crown')) badgeList.push('crown');
      category.rewardState.badges = badgeList;
    } else if (wasDone && !task.done) {
      category.rewardState.streak = Math.max(0, category.rewardState.streak - 1);
    }
  }

  render();
}

function cycleTaskStatus(wi, ti) {
  const task = data[activeIdx].widgets[wi].tasks[ti];
  const currentIndex = taskStatuses.indexOf(task.status || 'todo');
  task.status = taskStatuses[(currentIndex + 1) % taskStatuses.length];
  task.done = task.status === 'done';
  render();
}

function deleteTask(wi, ti) { data[activeIdx].widgets[wi].tasks.splice(ti, 1); render(); }

function updateTaskSub(wi, ti, prop, val) {
  const task = data[activeIdx].widgets[wi].tasks[ti];
  task[prop] = val;
  if (prop === 'status') task.done = val === 'done';
  if (prop === 'done') task.status = val ? 'done' : 'todo';
  storage.set('_horizon_v7', data);
}

// Checklist Helpers
function addCheckItem(wi) { data[activeIdx].widgets[wi].checkItems.push({ text: 'New item', done: false }); render(); }
function toggleCheckItem(wi, ci) { data[activeIdx].widgets[wi].checkItems[ci].done = !data[activeIdx].widgets[wi].checkItems[ci].done; render(); }
function updateCheckItemText(wi, ci, val) { data[activeIdx].widgets[wi].checkItems[ci].text = val; storage.set('_horizon_v7', data); }
function deleteCheckItem(wi, ci) { data[activeIdx].widgets[wi].checkItems.splice(ci, 1); render(); }

// Link Helpers
function addLink(wi) {
  const labelInput = document.getElementById(`link-label-${wi}`);
  const urlInput = document.getElementById(`link-url-${wi}`);
  const url = urlInput.value.trim();
  if (!url) return;
  data[activeIdx].widgets[wi].links.push({ label: labelInput.value.trim() || url, url });
  render();
}

function deleteLink(wi, li) { data[activeIdx].widgets[wi].links.splice(li, 1); render(); }

// Timer Helpers
function triggerTimerState(wi, cmd) {
  let w = data[activeIdx].widgets[wi];
  if (cmd === 'toggle') w.timerRunning = !w.timerRunning;
  if (cmd === 'clear') { w.timerRunning = false; w.timerElapsed = 0; }
  render();
}

function triggerPomodoro(wi, cmd) {
  let w = data[activeIdx].widgets[wi];
  if (cmd === 'toggle') w.pomodoroRunning = !w.pomodoroRunning;
  if (cmd === 'reset') { w.pomodoroRunning = false; w.pomodoroSeconds = 0; }
  if (cmd === 'add15') { w.pomodoroSeconds = (w.pomodoroSeconds || 0) + 15 * 60; }
  if (cmd === 'add30') { w.pomodoroSeconds = (w.pomodoroSeconds || 0) + 30 * 60; }
  if (cmd === 'add60') { w.pomodoroSeconds = (w.pomodoroSeconds || 0) + 60 * 60; }
  render();
}

// Category BG
function updateCategoryBg(color, shouldRender = true) {
  data[activeIdx].bgColor = color;
  const bgStyle = resolveCategoryBackgroundStyle(data[activeIdx]);
  document.documentElement.style.setProperty('--page-bg', bgStyle);
  const mainContent = document.getElementById('main-content');
  const canvas = document.getElementById('main-canvas');
  if (mainContent) {
    mainContent.style.background = bgStyle;
    mainContent.style.backgroundColor = color;
  }
  if (canvas) {
    canvas.style.background = bgStyle;
    canvas.style.backgroundColor = color;
  }
  if (shouldRender) render();
  else storage.set('_horizon_v7', data);
}

function updateCategoryBgType(bgType, shouldRender = true) {
  data[activeIdx].bgType = bgType;
  const bgStyle = resolveCategoryBackgroundStyle(data[activeIdx]);
  document.documentElement.style.setProperty('--page-bg', bgStyle);
  const mainContent = document.getElementById('main-content');
  const canvas = document.getElementById('main-canvas');
  if (mainContent) {
    mainContent.style.background = bgStyle;
    mainContent.style.backgroundColor = data[activeIdx].bgColor;
  }
  if (canvas) {
    canvas.style.background = bgStyle;
    canvas.style.backgroundColor = data[activeIdx].bgColor;
  }
  if (shouldRender) render();
  else storage.set('_horizon_v7', data);
}

function updateCategoryBgGradient(start, end, shouldRender = true) {
  data[activeIdx].bgGradientStart = start;
  data[activeIdx].bgGradientEnd = end;
  const bgStyle = resolveCategoryBackgroundStyle(data[activeIdx]);
  document.documentElement.style.setProperty('--page-bg', bgStyle);
  const mainContent = document.getElementById('main-content');
  const canvas = document.getElementById('main-canvas');
  if (mainContent) {
    mainContent.style.background = bgStyle;
    mainContent.style.backgroundColor = data[activeIdx].bgColor;
  }
  if (canvas) {
    canvas.style.background = bgStyle;
    canvas.style.backgroundColor = data[activeIdx].bgColor;
  }
  if (shouldRender) render();
  else storage.set('_horizon_v7', data);
}

function updateCategoryBgAngle(angle, shouldRender = true) {
  data[activeIdx].bgGradientAngle = angle;
  const bgStyle = resolveCategoryBackgroundStyle(data[activeIdx]);
  document.documentElement.style.setProperty('--page-bg', bgStyle);
  const mainContent = document.getElementById('main-content');
  const canvas = document.getElementById('main-canvas');
  if (mainContent) {
    mainContent.style.background = bgStyle;
    mainContent.style.backgroundColor = data[activeIdx].bgColor;
  }
  if (canvas) {
    canvas.style.background = bgStyle;
    canvas.style.backgroundColor = data[activeIdx].bgColor;
  }
  if (shouldRender) render();
  else storage.set('_horizon_v7', data);
}

// Hourly Schedule Helpers
function addScheduleRow(wi) { data[activeIdx].widgets[wi].schedItems.push({ hour: '12:00', task: '' }); render(); }
function updateScheduleHour(wi, ri, val) { data[activeIdx].widgets[wi].schedItems[ri].hour = val; storage.set('_horizon_v7', data); }
function updateScheduleTask(wi, ri, val) { data[activeIdx].widgets[wi].schedItems[ri].task = val; storage.set('_horizon_v7', data); }
function deleteScheduleRow(wi, ri) { data[activeIdx].widgets[wi].schedItems.splice(ri, 1); render(); }

// Habit Helpers
function addHabit(wi) {
  data[activeIdx].widgets[wi].habits.push({ name: 'New habit', days: [false, false, false, false, false, false, false] });
  render();
}

function updateHabitName(wi, hi, value) {
  data[activeIdx].widgets[wi].habits[hi].name = value;
  storage.set('_horizon_v7', data);
}

function toggleHabitDay(wi, hi, di) {
  const habit = data[activeIdx].widgets[wi].habits[hi];
  habit.days[di] = !habit.days[di];
  render();
}
 