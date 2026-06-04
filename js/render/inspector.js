/* --- INSPECTOR & STYLING LOGIC --- */

function renderInspectorMarkup(scope, targetRef, style) {
  const normalizedStyle = { ...createDefaultStyle(), ...style };
  const presetOptions = widgetPresets.map(p => `<option value="${p.id}" ${p.style === normalizedStyle ? 'selected' : ''}>${p.name}</option>`).join('');
  
  return `
    <div class="inspector-close-row">
      <div>
        <span>Customize widget</span>
        <small>Colors, sizing, and presets</small>
      </div>
      <button class="inspector-close-btn" onclick="closeInspector('${scope}','${targetRef}')">×</button>
    </div>
    
    <div class="inspector-section">
      <h4>Preset</h4>
      <select class="inspector-preset-select" onchange="applyWidgetPreset('${scope}','${targetRef}',this.value)">
        <option value="">--- Load preset ---</option>
        ${presetOptions}
      </select>
      <button class="inspector-btn-small" onclick="saveWidgetPreset('${scope}','${targetRef}')">Save as Preset</button>
    </div>

    <div class="inspector-section">
      <h4>Colors</h4>
      ${renderColorPickerInput('Header BG', scope, targetRef, 'headBg', normalizedStyle.headBg)}
      ${renderColorPickerInput('Body BG', scope, targetRef, 'bodyBg', normalizedStyle.bodyBg)}
      ${renderColorPickerInput('Header Text', scope, targetRef, 'headerTextCol', normalizedStyle.headerTextCol)}
      ${renderColorPickerInput('Body Text', scope, targetRef, 'textCol', normalizedStyle.textCol)}
      ${renderColorPickerInput('Border', scope, targetRef, 'borderCol', normalizedStyle.borderCol)}
    </div>

    <div class="inspector-section">
      <h4>Border & Corners</h4>
      <div class="inspector-control">
        <label>Border Width</label>
        <input type="range" min="0" max="4" step="0.5" value="${parseFloat(normalizedStyle.borderWidth)}" onchange="mutateStyle('${scope}','${targetRef}','borderWidth',this.value + 'px')">
        <span class="size-value">${normalizedStyle.borderWidth}</span>
      </div>
      <div class="inspector-control">
        <label>Corner Radius</label>
        <input type="range" min="0" max="24" step="2" value="${parseFloat(normalizedStyle.cornerRadius)}" onchange="mutateStyle('${scope}','${targetRef}','cornerRadius',this.value + 'px')">
        <span class="size-value">${normalizedStyle.cornerRadius}</span>
      </div>
    </div>

    <div class="inspector-section">
      <h4>Header</h4>
      <div class="inspector-control">
        <label>Show Header <input type="checkbox" ${normalizedStyle.showHeader ? 'checked' : ''} onchange="mutateStyle('${scope}','${targetRef}','showHeader',this.checked)"></label>
      </div>
      <div class="inspector-control">
        <label>Header Height</label>
        <input type="range" min="25" max="60" step="5" value="${parseFloat(normalizedStyle.headerHeight)}" onchange="mutateStyle('${scope}','${targetRef}','headerHeight',this.value + 'px')">
        <span class="size-value">${normalizedStyle.headerHeight}</span>
      </div>
      <div class="inspector-control">
        <label>Header Font Size</label>
        <select onchange="mutateStyle('${scope}','${targetRef}','headerFontSz',this.value)">
          <option value="12px" ${normalizedStyle.headerFontSz === '12px' ? 'selected' : ''}>Small (12px)</option>
          <option value="14px" ${normalizedStyle.headerFontSz === '14px' ? 'selected' : ''}>Medium (14px)</option>
          <option value="16px" ${normalizedStyle.headerFontSz === '16px' ? 'selected' : ''}>Large (16px)</option>
          <option value="18px" ${normalizedStyle.headerFontSz === '18px' ? 'selected' : ''}>XL (18px)</option>
        </select>
      </div>
      <div class="inspector-control">
        <label>Header Font</label>
        <select onchange="mutateStyle('${scope}','${targetRef}','headerFont',this.value)">
          <option value="Inter, sans-serif" ${normalizedStyle.headerFont === 'Inter, sans-serif' ? 'selected' : ''}>Inter</option>
          <option value="Georgia, serif" ${normalizedStyle.headerFont === 'Georgia, serif' ? 'selected' : ''}>Georgia</option>
          <option value="Courier New, monospace" ${normalizedStyle.headerFont === 'Courier New, monospace' ? 'selected' : ''}>Monospace</option>
          <option value="Verdana, sans-serif" ${normalizedStyle.headerFont === 'Verdana, sans-serif' ? 'selected' : ''}>Verdana</option>
        </select>
      </div>
      <div class="inspector-control">
        <label>Header Padding</label>
        <input type="range" min="4" max="20" step="2" value="${parseFloat(normalizedStyle.headerPadding)}" onchange="mutateStyle('${scope}','${targetRef}','headerPadding',this.value + 'px')">
        <span class="size-value">${normalizedStyle.headerPadding}</span>
      </div>
      <div class="inspector-control">
        <label>Border Bottom</label>
        <input type="text" value="${normalizedStyle.headerBorderBottom}" placeholder="e.g., 1px solid #e2e8f0" onchange="mutateStyle('${scope}','${targetRef}','headerBorderBottom',this.value)">
      </div>
    </div>

    <div class="inspector-section">
      <h4>Body</h4>
      <div class="inspector-control">
        <label>Body Font Size</label>
        <select onchange="mutateStyle('${scope}','${targetRef}','fontSz',this.value)">
          <option value="12px" ${normalizedStyle.fontSz === '12px' ? 'selected' : ''}>Small (12px)</option>
          <option value="14px" ${normalizedStyle.fontSz === '14px' ? 'selected' : ''}>Medium (14px)</option>
          <option value="16px" ${normalizedStyle.fontSz === '16px' ? 'selected' : ''}>Large (16px)</option>
          <option value="18px" ${normalizedStyle.fontSz === '18px' ? 'selected' : ''}>XL (18px)</option>
        </select>
      </div>
      <div class="inspector-control">
        <label>Body Padding</label>
        <input type="range" min="4" max="32" step="2" value="${parseFloat(normalizedStyle.bodyPadding)}" onchange="mutateStyle('${scope}','${targetRef}','bodyPadding',this.value + 'px')">
        <span class="size-value">${normalizedStyle.bodyPadding}</span>
      </div>
    </div>`;
}

function renderColorPickerInput(label, scope, targetRef, property, value) {
  return `
    <div class="color-picker-block inspector-control">
      <label>${label}</label>
      <div class="color-picker-row">
        <input type="color" value="${value}" oninput="mutateStyle('${scope}','${targetRef}','${property}', this.value, false)">
        <span class="color-value">${value}</span>
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
    storage.set('alvis_front_geo', frontPageWidgets);
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
  
  const header = widget.querySelector('.widget-header');
  const body = widget.querySelector('.widget-body');
  
  if (property === 'headBg' && header) header.style.background = value;
  if (property === 'bodyBg') widget.style.background = value;
  if (property === 'borderCol') widget.style.borderColor = value;
  if (property === 'textCol') widget.style.color = value;
  if (property === 'borderWidth') widget.style.borderWidth = value;
  if (property === 'cornerRadius') widget.style.borderRadius = value;
  if (property === 'headerHeight' && header) header.style.height = value;
  if (property === 'headerFontSz' && header) header.style.fontSize = value;
  if (property === 'headerFont' && header) header.style.fontFamily = value;
  if (property === 'headerTextCol' && header) header.style.color = value;
  if (property === 'headerPadding' && header) header.style.padding = value;
  if (property === 'headerBorderBottom' && header) header.style.borderBottom = value;
  if (property === 'fontSz' && body) body.style.fontSize = value;
  if (property === 'bodyPadding' && body) body.style.padding = value;
  if (property === 'showHeader' && header) header.style.display = value ? 'flex' : 'none';
}

function applyWidgetPreset(scope, ref, presetId) {
  if (!presetId) return;
  const preset = widgetPresets.find(p => p.id === presetId);
  if (!preset) return;
  
  if (scope === 'front') {
    let w = frontPageWidgets.find(item => item.id === ref);
    if (w) w.style = JSON.parse(JSON.stringify(preset.style));
    storage.set('alvis_front_geo', frontPageWidgets);
  } else {
    data[activeIdx].widgets[ref].style = JSON.parse(JSON.stringify(preset.style));
  }
  
  render();
}

function saveWidgetPreset(scope, ref) {
  const presetName = prompt('Enter preset name:');
  if (!presetName) return;
  
  let style;
  if (scope === 'front') {
    let w = frontPageWidgets.find(item => item.id === ref);
    style = w?.style;
  } else {
    style = data[activeIdx].widgets[ref].style;
  }
  
  if (!style) return;
  
  const newPreset = {
    id: 'preset-' + Date.now(),
    name: presetName,
    style: JSON.parse(JSON.stringify(style))
  };
  
  widgetPresets.push(newPreset);
  storage.set('alvis_widget_presets', widgetPresets);
  render();
}
