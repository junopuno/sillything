/* --- RENDER ENGINE --- */

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getWidgetStyleString(style) {
  const s = { ...createDefaultStyle(), ...style };
  return `background:${s.bodyBg}; color:${s.textCol}; border-color:${s.borderCol}; border-width:${s.borderWidth}; border-radius:${s.cornerRadius}`;
}

function getWidgetHeaderStyleString(style) {
  const s = { ...createDefaultStyle(), ...style };
  return `background:${s.headBg}; color:${s.headerTextCol}; font-size:${s.headerFontSz}; font-family:${s.headerFont}; padding:${s.headerPadding}; border-bottom:${s.headerBorderBottom}; height:${s.headerHeight}; display:${s.showHeader ? 'flex' : 'none'}`;
}

function getWidgetBodyStyleString(style) {
  const s = { ...createDefaultStyle(), ...style };
  return `font-size:${s.fontSz}; padding:${s.bodyPadding}`;
}

function getAllTasks() {
  return data.flatMap((category, categoryIndex) =>
    category.widgets.flatMap((widget, widgetIndex) =>
      (widget.tasks || []).map((task, taskIndex) => ({
        ...normalizeTask(task),
        categoryIndex,
        widgetIndex,
        taskIndex,
        categoryName: category.name
      }))
    )
  );
}

function getPlannerStats(category = null, subcategoryId = undefined) {
  let widgets = category ? category.widgets : data.flatMap(item => item.widgets);
  if (subcategoryId !== undefined) {
    widgets = widgets.filter(widget => (widget.subcategoryId || null) === subcategoryId);
  }
  const tasks = widgets.flatMap(widget => widget.tasks || []).map(normalizeTask);
  const total = tasks.length;
  const done = tasks.filter(task => task.done || task.status === 'done').length;
  const overdue = tasks.filter(task => task.deadline && !task.done && new Date(task.deadline) < startOfToday()).length;
  const high = tasks.filter(task => task.priority === 'high' && !task.done).length;
  return { total, done, open: total - done, overdue, high, percent: total ? Math.round((done / total) * 100) : 0 };
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function renderStatStrip(stats) {
  return `
    <div class="stat-strip">
      <div><strong>${stats.open}</strong><span>Open</span></div>
      <div><strong>${stats.done}</strong><span>Done</span></div>
      <div><strong>${stats.high}</strong><span>High</span></div>
      <div><strong>${stats.percent}%</strong><span>Complete</span></div>
    </div>`;
}

function renderCategoryIcon(category, extraClass = '') {
  if (category.iconImage) {
    return `<img class="category-image-icon ${extraClass}" src="${escapeHtml(category.iconImage)}" alt="">`;
  }

  return `<i class="far ${escapeHtml(category.icon || 'fa-folder')} ${extraClass}"></i>`;
}

function getWidgetScale(widget) {
  const widthScale = (widget.size?.w || 280) / 280;
  const heightScale = (widget.size?.h || 230) / 230;
  return Math.max(0.85, Math.min(1.45, Math.min(widthScale, heightScale)));
}

function renderWidgetSectionMenu(category, widgetIndex, widget) {
  return `
    <details class="widget-section-menu">
      <summary title="Choose section"><i class="fas fa-folder-tree"></i></summary>
      <div class="widget-section-dropdown">
        <button onclick="moveWidgetToSubcategory(${widgetIndex}, '')" class="${!widget.subcategoryId ? 'active' : ''}">No section</button>
        ${(category.subcategories || []).map(sub => `
          <button onclick="moveWidgetToSubcategory(${widgetIndex}, '${sub.id}')" class="${widget.subcategoryId === sub.id ? 'active' : ''}">
            ${escapeHtml(sub.name)}
          </button>`).join('')}
      </div>
    </details>`;
}

function renderTodayPanel() {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const todaysTasks = getAllTasks()
    .filter(task => !task.done && task.deadline && new Date(task.deadline) < tomorrow)
    .slice(0, 6);

  return `
    <section class="front-summary">
      <div>
        <span class="card-meta">Today</span>
        <h3>Focus queue</h3>
      </div>
      <div class="today-list">
        ${todaysTasks.length ? todaysTasks.map(task => `
          <button class="today-task" onclick="openProject(${task.categoryIndex})">
            <span>${escapeHtml(task.text)}</span>
            <small>${escapeHtml(task.categoryName)} · ${escapeHtml(task.priority)}</small>
          </button>`).join('') : '<p>No dated tasks for today. Nice and clean.</p>'}
      </div>
    </section>`;
}

function renderSubcategoryTabs(category) {
  const subcategories = category.subcategories || [];
  return `
    <div class="subcategory-tabs">
      <button class="${activeSubId === null ? 'active' : ''}" onclick="selectSubcategory(null)">All</button>
      <button class="${activeSubId === 'uncategorized' ? 'active' : ''}" onclick="selectSubcategory('uncategorized')">No section</button>
      ${subcategories.map(sub => `
        <button class="${activeSubId === sub.id ? 'active' : ''}" onclick="selectSubcategory('${sub.id}')">
          ${escapeHtml(sub.name)}
        </button>`).join('')}
    </div>`;
}

function renderSubcategoryManager(category) {
  const subcategories = category.subcategories || [];
  return `
    <div class="subcat-manager">
      <div class="subcat-heading">
        <span>Subcategories</span>
        <button onclick="addSubcategory()"><i class="fas fa-plus"></i></button>
      </div>
      ${subcategories.length ? subcategories.map((sub, index) => `
        <div class="subcat-row">
          <input type="text" value="${escapeHtml(sub.name)}" onchange="updateSubcategoryName('${sub.id}', this.value)">
          <button onclick="selectSubcategory('${sub.id}')" title="Open"><i class="fas fa-arrow-right"></i></button>
          <button class="danger-icon" onclick="deleteSubcategory('${sub.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>`).join('') : '<p class="empty-note">No subcategories yet.</p>'}
    </div>`;
}

function render() {
  data = data.map(normalizeCategory);
  if (activeIdx !== null) {
    const currentCategory = data[activeIdx];
    const subExists = currentCategory?.subcategories?.some(sub => sub.id === activeSubId);
    if (activeSubId && activeSubId !== 'uncategorized' && !subExists) activeSubId = null;
  }

  const canvas = document.getElementById('main-canvas');
  const widgetControls = document.getElementById('widget-controls');
  const canvasControls = document.getElementById('canvas-controls');
  const categoryControls = document.getElementById('category-controls');
  const nav = document.getElementById('nav-list');
  const dashHeader = document.getElementById('dashboard-header');
  const catHeader = document.getElementById('category-header');

  nav.innerHTML = data.map((p, i) => {
    const stats = getPlannerStats(p);
    return `
      <div class="menu-item ${activeIdx === i ? 'active' : ''}" onclick="openProject(${i})">
        ${renderCategoryIcon(p)}
        <span>${escapeHtml(p.name)}</span>
        <small>${stats.open}</small>
      </div>`;
  }).join('');

  if (activeIdx === null) {
    const stats = getPlannerStats();
    dashHeader.classList.remove('hidden');
    catHeader.classList.add('hidden');
    if (widgetControls) widgetControls.innerHTML = `
      <div class="tool-note">No category selected. Add a category or open one from the left panel.</div>
      <button class="workspace-btn" onclick="addProject()">+ New Category</button>
      <button class="workspace-btn secondary-btn" onclick="createStarterWorkspace()">Starter Workspace</button>`;
    if (canvasControls) canvasControls.innerHTML = `
      <div class="tool-note">Canvas customization is available when a category is open.</div>`;
    if (categoryControls) categoryControls.innerHTML = `
      <div class="tool-note">Select a category on the left to edit its settings.</div>`;
    document.documentElement.style.setProperty('--page-bg', 'linear-gradient(135deg, var(--gradient-1) 0%, var(--gradient-2) 100%)');
    document.documentElement.style.setProperty('--ui-accent', '#2563eb');
    canvas.style.background = '';

    let html = renderTodayPanel();
    html += frontPageWidgets.map((w) => `
      <div class="widget" data-geo-id="${w.id}" data-x="${w.pos.x}" data-y="${w.pos.y}" 
           style="transform: translate(${w.pos.x}px, ${w.pos.y}px); width:${w.size.w}px; height:${w.size.h}px; --widget-scale:${getWidgetScale(w)}; ${getWidgetStyleString(w.style)}">
          <div class="widget-header" style="${getWidgetHeaderStyleString(w.style)}">
              <input type="text" value="${escapeHtml(w.title)}" onchange="updateFrontTitle('${w.id}', this.value)">
              <div class="widget-controls-group"><i class="fas fa-ellipsis-v" onclick="openInspector('front','${w.id}')"></i></div>
          </div>
          <div id="inspect-front-${w.id}" class="design-inspector hidden">${renderInspectorMarkup('front', w.id, w.style)}</div>
          <div class="widget-body" style="${getWidgetBodyStyleString(w.style)}">
              ${w.type === 'date' ? parseHtmlDateBlock() : parseHtmlCalendarBlock(w.style?.textCol)}
          </div>
      </div>`).join('');

    html += data.map((p, i) => {
      const x = p.pos?.x ?? (40 + (i * 220));
      const y = p.pos?.y ?? 300;
      const categoryStats = getPlannerStats(p);
      return `<div class="category-shortcut-card" data-cat-index="${i}" data-x="${x}" data-y="${y}" onclick="openProject(${i}, event)" style="position:absolute; transform: translate(${x}px, ${y}px); width:${p.size?.w ?? 220}px; height:${p.size?.h ?? 140}px; border-color:${p.accent || '#e2e8f0'};">
                <div>${renderCategoryIcon(p)}<h4>${escapeHtml(p.name)}</h4></div>
                <span>${p.widgets.length} widgets · ${categoryStats.percent}% done</span>
              </div>`;
    }).join('');
    canvas.innerHTML = html;
  } else {
    const category = data[activeIdx];
    const selectedSubId = activeSubId === 'uncategorized' ? null : activeSubId;
    const stats = getPlannerStats(category, activeSubId === null ? undefined : selectedSubId);
    dashHeader.classList.add('hidden');
    catHeader.classList.remove('hidden');
    document.getElementById('category-index').innerText = category.name;
    document.getElementById('category-title-banner').innerText = category.name;

    const categoryBg = category.bgColor || '#f8fafc';
    document.documentElement.style.setProperty('--page-bg', categoryBg);
    document.documentElement.style.setProperty('--ui-accent', category.accent || '#2563eb');

    if (widgetControls) widgetControls.innerHTML = `
      <label>Widget type</label>
      <select id="w-type">
        <option value="list">Smart Tasks</option>
        <option value="board">Task Board</option>
        <option value="checklist">Checklist</option>
        <option value="note">Plain Note</option>
        <option value="links">Quick Links</option>
        <option value="clock">Digital Clock</option>
        <option value="countdown">Countdown</option>
        <option value="timer">Stopwatch</option>
        <option value="pomodoro">Pomodoro</option>
        <option value="calendar">Calendar</option>
        <option value="schedule">Hourly Schedule</option>
        <option value="habits">Habit Tracker</option>
        <option value="youtube">YouTube Video</option>
        <option value="image">Image Cover</option>
        <option value="calculator">Calculator</option>
        <option value="graph">Graphing</option>
        <option value="media">File Gallery</option>
        <option value="goals">Goal Tracker</option>
      </select>
      <button class="workspace-btn" onclick="addWidget()">+ Add Module</button>
      <button class="workspace-btn secondary-btn" onclick="addTaskWidget()">+ Quick Task Panel</button>
      <button class="workspace-btn secondary-btn" onclick="triggerUploadImage()">Upload Image</button>`;

    if (canvasControls) canvasControls.innerHTML = `
      <label>Canvas color</label>
      <input type="color" id="cat-bg-picker" value="${categoryBg}" oninput="updateCategoryBg(this.value, false)">
      <label>Accent</label>
      <input type="color" value="${category.accent || '#2563eb'}" oninput="updateCategoryAccent(this.value)">
      <div class="tool-note">Customize the workspace canvas and accent for this category.</div>`;

    if (categoryControls) categoryControls.innerHTML = `
      <label>Category name</label>
      <input type="text" value="${escapeHtml(category.name)}" oninput="updateCategoryName(this.value, false)" onchange="updateCategoryName(this.value)">
      <label>Icon</label>
      <select onchange="updateCategoryIcon(this.value)">
        ${['fa-folder','fa-star','fa-calendar','fa-book','fa-briefcase','fa-heart','fa-bolt'].map(icon => `<option value="${icon}" ${category.icon === icon ? 'selected' : ''}>${icon.replace('fa-', '')}</option>`).join('')}
      </select>
      <label>Image icon</label>
      <input type="url" value="${escapeHtml(category.iconImage || '')}" placeholder="Paste image URL" onchange="updateCategoryIconImage(this.value)">
      <input type="file" accept="image/*" onchange="updateCategoryIconImageFromFile(this.files[0])">
      <button class="workspace-btn secondary-btn" onclick="clearCategoryIconImage()">Use Font Icon</button>
      ${renderSubcategoryManager(category)}`;

    document.documentElement.style.setProperty('--page-bg', categoryBg);
    document.documentElement.style.setProperty('--ui-accent', category.accent || '#2563eb');

    const visibleWidgets = category.widgets
      .map((widget, index) => ({ widget, index }))
      .filter(item => activeSubId === null || (activeSubId === 'uncategorized' ? !item.widget.subcategoryId : item.widget.subcategoryId === activeSubId));

    canvas.innerHTML = renderSubcategoryTabs(category) + visibleWidgets.map(({ widget: w, index: i }) => {
      const widgetClass = w.type === 'image' ? 'widget image-widget' : 'widget';
      const bgColor = w.type === 'image' ? 'transparent' : w.style.bodyBg;
      const headerHtml = w.type === 'image' ? '' : `
          <div class="widget-header" style="${getWidgetHeaderStyleString(w.style)}">
              <input type="text" value="${escapeHtml(w.title)}" onchange="updateWidgetProp(${i}, 'title', this.value)">
              <div class="widget-controls-group">
                  ${renderWidgetSectionMenu(category, i, w)}
                  <i class="fas fa-ellipsis-v" onclick="openInspector('cat', ${i})"></i>
                  <i class="fas fa-copy" onclick="duplicateWidget(${i})"></i>
                  <i class="fas fa-times" onclick="delWid(${i})" style="color:#ef4444;"></i>
              </div>
          </div>`;

      const widgetStyle = `transform: translate(${w.pos.x}px, ${w.pos.y}px); width:${w.size.w}px; height:${w.size.h}px; --widget-scale:${getWidgetScale(w)}; background:${bgColor}; color:${w.style.textCol}; border-color:${w.style.borderCol}; border-width:${w.style.borderWidth}; border-radius:${w.style.cornerRadius}`;
      
      return `
      <div class="${widgetClass}" data-index="${i}" data-x="${w.pos.x}" data-y="${w.pos.y}" 
           style="${widgetStyle}">
          ${headerHtml}
          <div id="inspect-cat-${i}" class="design-inspector hidden">${renderInspectorMarkup('cat', i, w.style)}</div>
          <div class="widget-body" style="${getWidgetBodyStyleString(w.style)}">${renderWidgetBody(w, i)}</div>
      </div>`;
    }).join('');
  }

  initPhysics();

  if (typeof drawGraphWidgets === 'function') {
    requestAnimationFrame(drawGraphWidgets);
  }

  if (openInspectorState) {
    const openEl = document.getElementById(`inspect-${openInspectorState.scope}-${openInspectorState.ref}`);
    if (openEl) openEl.classList.remove('hidden');
  }

  storage.set('_horizon_v7', data);
}
