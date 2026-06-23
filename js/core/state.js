/* --- INITIAL DATA & STATE --- */
const storage = {
  get(key, fallback) {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : fallback;
    } catch (error) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // file:// pages can block localStorage, so the app keeps working in memory.
    }
  }
};

let data = storage.get('ver1', []);
let activeIdx = null;
let activeSubId = null;
let categoryDragMoved = false;
let openInspectorState = null;

function createDefaultStyle() {
  return {
    // Colors
    headBg: '#ffffff',
    bodyBg: '#ffffff',
    textCol: '#1e293b',
    borderCol: '#e2e8f0',
    // Sizes
    fontSz: '14px',
    headerFontSz: '16px',
    borderWidth: '1px',
    cornerRadius: '16px',
    headerHeight: '40px',
    headerPadding: '12px',
    bodyPadding: '16px',
    // Header
    headerFont: 'Inter, sans-serif',
    headerTextCol: '#1e293b',
    headerBorderBottom: '1px solid #e2e8f0',
    // Display
    showHeader: true
  };
}

let frontPageWidgets = storage.get('alvis_front_geo', [
  { id: 'geo-date', type: 'date', title: 'Today', pos: { x: 40, y: 30 }, size: { w: 160, h: 180 }, style: createDefaultStyle() },
  { id: 'geo-cal', type: 'cal', title: 'Calendar Grid', pos: { x: 230, y: 30 }, size: { w: 320, h: 180 }, style: createDefaultStyle() }
]);

let widgetPresets = storage.get('alvis_widget_presets', [
  { id: 'preset-clean', name: 'Clean', style: createDefaultStyle() },
  { id: 'preset-bold', name: 'Bold', style: { ...createDefaultStyle(), borderWidth: '2px', headerHeight: '45px', headerBorderBottom: '2px solid #7b2cbf' } },
  { id: 'preset-minimal', name: 'Minimal', style: { ...createDefaultStyle(), borderWidth: '0px', headerHeight: '35px', headerBg: 'transparent', headerBorderBottom: 'none' } }
]);

const taskStatuses = ['todo', 'doing', 'done'];
const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High' };

function createDefaultTask(text = 'New task') {
  return {
    text,
    done: false,
    status: 'todo',
    priority: 'medium',
    deadline: '',
    note: '',
    tags: ''
  };
}

function createDefaultWidget(type) {
  const base = {
    type,
    subcategoryId: null,
    title: type.toUpperCase(),
    pos: { x: 50, y: 50 },
    size: { w: 280, h: 230 },
    tasks: [],
    links: [],
    content: '',
    deadline: '',
    timerElapsed: 0,
    timerRunning: false,
    pomodoroSeconds: 25 * 60,
    pomodoroRunning: false,
    goalTarget: 10,
    goalCurrent: 3,
    mediaItems: [],
    embedUrl: '',
    youtubeUrl: '',
    imageSrc: '',
    imageName: '',
    schedItems: [{ hour: '09:00', task: '' }],
    checkItems: [],
    habits: [
      { name: 'Water', days: [false, false, false, false, false, false, false] },
      { name: 'Focus', days: [false, false, false, false, false, false, false] }
    ],
    style: createDefaultStyle()
  };

  if (type === 'board') {
    base.title = 'TASK BOARD';
    base.size = { w: 520, h: 300 };
    base.tasks = [createDefaultTask('Plan next step'), { ...createDefaultTask('Build the page'), status: 'doing', priority: 'high' }];
  }

  if (type === 'list') base.tasks = [createDefaultTask('Add first task')];
  if (type === 'pomodoro') base.title = 'POMODORO';
  if (type === 'clock') {
    base.title = 'CLOCK';
    base.clockFontSize = '2.2rem';
    base.clockFontFamily = 'Inter, sans-serif';
    base.clockFormat = '24';
    base.clockShowSeconds = true;
  }
  if (type === 'habits') base.title = 'HABITS';
  if (type === 'goals') base.title = 'GOALS';
  if (type === 'media') {
    base.title = 'MEDIA';
    base.size = { w: 360, h: 280 };
  }
  if (type === 'youtube') {
    base.title = 'YOUTUBE';
    base.size = { w: 420, h: 300 };
  }
  if (type === 'image') {
    base.title = 'IMAGE';
    base.size = { w: 360, h: 280 };
    base.style = { headBg: 'transparent', bodyBg: 'transparent', textCol: '#1e293b', borderCol: 'transparent', fontSz: '14px' };
  }
  if (type === 'calculator') {
    base.title = 'CALCULATOR';
    base.size = { w: 340, h: 240 };
    base.calcInput = '';
    base.calcResult = '';
  }
  if (type === 'graph') {
    base.title = 'GRAPH';
    base.size = { w: 440, h: 320 };
    base.graphExpr = 'sin(x)';
    base.graphXMin = '-10';
    base.graphXMax = '10';
    base.graphYMin = '-5';
    base.graphYMax = '5';
    base.graphError = '';
  }

  return base;
}

function createDefaultSubcategory(name = 'New section') {
  return {
    id: `sub-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name
  };
}

function normalizeTask(task) {
  return {
    ...createDefaultTask(task?.text || 'Untitled task'),
    ...task,
    status: task?.done ? 'done' : (task?.status || 'todo')
  };
}

function normalizeWidget(widget) {
  const normalized = { ...createDefaultWidget(widget.type || 'note'), ...widget };
  normalized.subcategoryId = widget.subcategoryId || null;
  normalized.tasks = (normalized.tasks || []).map(normalizeTask);
  normalized.links = normalized.links || [];
  normalized.mediaItems = normalized.mediaItems || [];
  normalized.embedUrl = normalized.embedUrl || '';
  normalized.youtubeUrl = normalized.youtubeUrl || '';
  normalized.imageSrc = normalized.imageSrc || '';
  normalized.imageName = normalized.imageName || '';
  normalized.schedItems = normalized.schedItems || [];
  normalized.checkItems = normalized.checkItems || [];
  normalized.habits = normalized.habits || [];
  normalized.style = { ...createDefaultWidget('note').style, ...(widget.style || {}) };
  return normalized;
}

function normalizeCategory(category, index) {
  return {
    name: category.name || `Ny kategori ${index + 1}`,
    icon: category.icon || 'fa-folder',
    iconImage: category.iconImage || '',
    bgColor: category.bgColor || '#ffffff',
    accent: category.accent || '#2563eb',
    subcategories: category.subcategories || [],
    pos: category.pos || { x: 50 + (index * 220), y: 250 },
    size: category.size || { w: 200, h: 120 },
    widgets: (category.widgets || []).filter(widget => widget.type !== 'progress').map(normalizeWidget)
  };
}

data = data.map(normalizeCategory);
