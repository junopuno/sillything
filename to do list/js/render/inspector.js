/* --- INSPECTOR & STYLING LOGIC --- */

function renderInspectorMarkup(scope, targetRef, style) {
  return `
    <div class="inspector-close-row">
      <div>
        <span>Customize widget</span>
        <small>Colors and text scale</small>
      </div>
      <button class="inspector-close-btn" onclick="closeInspector('${scope}','${targetRef}')">×</button>
    </div>
    ${renderColorPickerInput('Header', scope, targetRef, 'headBg', style?.headBg || '#f1f5f9')}
    ${renderColorPickerInput('Body', scope, targetRef, 'bodyBg', style?.bodyBg || '#ffffff')}
    ${renderColorPickerInput('Border', scope, targetRef, 'borderCol', style?.borderCol || '#e2e8f0')}
    ${renderColorPickerInput('Text', scope, targetRef, 'textCol', style?.textCol || '#1e293b')}
    <div class="inspector-control"><label>Font Size</label>
        <select onchange="mutateStyle('${scope}','${targetRef}','fontSz',this.value)">
            <option value="12px" ${style?.fontSz === '12px' ? 'selected' : ''}>Small</option>
            <option value="14px" ${style?.fontSz === '14px' ? 'selected' : ''}>Medium</option>
            <option value="18px" ${style?.fontSz === '18px' ? 'selected' : ''}>Large</option>
        </select>
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
    storage.set('devos_front_geo_v7', frontPageWidgets);
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
