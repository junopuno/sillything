// js/render/graph-calc-engine.js

let activeInputTarget = null;

function renderEquationInputs(w, wi) {
  return w.equations.map((eq, idx) => `
    <div class="eq-item">
      <span style="color:${eq.color}; font-weight:bold;">Y${idx + 1}=</span>
      <input type="text" 
             id="input-eq-${wi}-${eq.id}" 
             value="${escapeHtml(eq.expr)}" 
             onfocus="setActiveInputTarget('${wi}-${eq.id}')"
             onchange="updateEquationExpression(${wi}, '${eq.id}', this.value)"
             placeholder="e.g. x^2 - 4">
      ${w.equations.length > 1 ? `<button class="del-eq-btn" onclick="removeEquation(${wi}, '${eq.id}')">&times;</button>` : ''}
    </div>
  `).join('');
}

function setActiveInputTarget(targetId) {
  activeInputTarget = targetId;
}

function insertKey(val) {
  if (!activeInputTarget) return;
  const input = document.getElementById(`input-eq-${activeInputTarget}`);
  if (!input) return;

  const start = input.selectionStart;
  const end = input.selectionEnd;
  const text = input.value;

  input.value = text.slice(0, start) + val + text.slice(end);
  input.focus();

  const newPos = start + val.length;
  input.setSelectionRange(newPos, newPos);

  const parts = activeInputTarget.split('-');
  const wi = parseInt(parts[0]);
  const eqId = parts[1];
  updateEquationExpression(wi, eqId, input.value);
}

function clearActiveInput() {
  if (!activeInputTarget) return;
  const input = document.getElementById(`input-eq-${activeInputTarget}`);
  if (!input) return;
  input.value = '';

  const parts = activeInputTarget.split('-');
  updateEquationExpression(parseInt(parts[0]), parts[1], '');
}

function updateEquationExpression(wi, eqId, value) {
  const w = data[activeIdx].widgets[wi];
  const eq = w.equations.find(e => e.id === eqId);
  if (eq) {
    eq.expr = value;
    drawGraphWidgets(wi);
  }
}

function addNewEquation(wi) {
  const w = data[activeIdx].widgets[wi];
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const nextColor = colors[w.equations.length % colors.length];
  const nextId = 'y' + (Date.now());

  w.equations.push({ id: nextId, expr: '', color: nextColor });

  const container = document.getElementById(`eq-list-${wi}`);
  if (container) container.innerHTML = renderEquationInputs(w, wi);
  saveAllState();
}

function removeEquation(wi, eqId) {
  const w = data[activeIdx].widgets[wi];
  w.equations = w.equations.filter(e => e.id !== eqId);

  const container = document.getElementById(`eq-list-${wi}`);
  if (container) container.innerHTML = renderEquationInputs(w, wi);
  drawGraphWidgets(wi);
  saveAllState();
}

function openComboManager(wi) {
  const w = data[activeIdx].widgets[wi];
  if (w.equations.length < 2) {
    alert("You need at least 2 functions to combine them!");
    return;
  }
  const expr = w.equations.map((e, i) => `( ${e.expr || '0'} )`).join(' + ');
  const nextId = 'y' + (Date.now());

  w.equations.push({ id: nextId, expr: expr, color: '#475569' });

  const container = document.getElementById(`eq-list-${wi}`);
  if (container) container.innerHTML = renderEquationInputs(w, wi);
  drawGraphWidgets(wi);
  saveAllState();
}

function evaluateMath(expr, xVal) {
  try {
    let clean = expr.toLowerCase()
      .replace(/x/g, `(${xVal})`)
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/pi/g, 'Math.PI');

    const res = new Function(`return ${clean}`)();
    return isNaN(res) || !isFinite(res) ? null : res;
  } catch (e) {
    return null;
  }
}

function drawGraphWidgets(specificWi = null) {
  const widgetsToDraw = specificWi !== null ? [specificWi] : [];

  if (specificWi === null && activeIdx !== null && data[activeIdx]?.widgets) {
    data[activeIdx].widgets.forEach((w, index) => {
      if (w.type === 'calculator' || w.type === 'graph') widgetsToDraw.push(index);
    });
  }

  widgetsToDraw.forEach(wi => {
    const w = data[activeIdx]?.widgets[wi];
    if (!w) return;
    const canvas = document.getElementById(`graph-canvas-${wi}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cfg = w.graphConfig;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let x = cfg.minX; x <= cfg.maxX; x += (cfg.maxX - cfg.minX) / 10) {
      let cx = ((x - cfg.minX) / (cfg.maxX - cfg.minX)) * canvas.width;
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();
    }
    for (let y = cfg.minY; y <= cfg.maxY; y += (cfg.maxY - cfg.minY) / 10) {
      let cy = canvas.height - (((y - cfg.minY) / (cfg.maxY - cfg.minY)) * canvas.height);
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    let origoX = ((0 - cfg.minX) / (cfg.maxX - cfg.minX)) * canvas.width;
    let origoY = canvas.height - (((0 - cfg.minY) / (cfg.maxY - cfg.minY)) * canvas.height);

    if (origoX >= 0 && origoX <= canvas.width) {
      ctx.beginPath(); ctx.moveTo(origoX, 0); ctx.lineTo(origoX, canvas.height); stroke();
    }
    if (origoY >= 0 && origoY <= canvas.height) {
      ctx.beginPath(); ctx.moveTo(0, origoY); ctx.lineTo(canvas.width, origoY); ctx.stroke();
    }

    w.equations.forEach(eq => {
      if (!eq.expr) return;
      ctx.beginPath();
      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2.5;

      let first = true;
      for (let cx = 0; cx < canvas.width; cx++) {
        let pctX = cx / canvas.width;
        let xVal = cfg.minX + pctX * (cfg.maxX - cfg.minX);
        let yVal = evaluateMath(eq.expr, xVal);

        if (yVal !== null) {
          let cy = canvas.height - (((yVal - cfg.minY) / (cfg.maxY - cfg.minY)) * canvas.height);
          if (first) {
            ctx.moveTo(cx, cy);
            first = false;
          } else {
            ctx.lineTo(cx, cy);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    });
  });
}

function zoomGraph(wi, factor) {
  const w = data[activeIdx].widgets[wi];
  const cfg = w.graphConfig;

  let midX = (cfg.minX + cfg.maxX) / 2;
  let midY = (cfg.minY + cfg.maxY) / 2;
  let rangeX = (cfg.maxX - cfg.minX) * factor;
  let rangeY = (cfg.maxY - cfg.minY) * factor;

  w.graphConfig = {
    minX: midX - rangeX / 2,
    maxX: midX + rangeX / 2,
    minY: midY - rangeY / 2,
    maxY: midY + rangeY / 2
  };

  drawGraphWidgets(wi);
  saveAllState();
}

function resetGraphZoom(wi) {
  data[activeIdx].widgets[wi].graphConfig = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
  drawGraphWidgets(wi);
  saveAllState();
}

function trackGraphHover(e, wi) {
  const w = data[activeIdx]?.widgets[wi];
  if (!w) return;
  const canvas = document.getElementById(`graph-canvas-${wi}`);
  const tooltip = document.getElementById(`graph-tooltip-${wi}`);
  if (!canvas || !tooltip) return;

  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  const cfg = w.graphConfig;
  const xVal = cfg.minX + (cx / canvas.width) * (cfg.maxX - cfg.minX);

  let tooltipContent = `X: ${xVal.toFixed(2)}<br>`;
  let foundValid = false;

  w.equations.forEach((eq, idx) => {
    if (!eq.expr) return;
    const yVal = evaluateMath(eq.expr, xVal);
    if (yVal !== null) {
      foundValid = true;
      tooltipContent += `<span style="color:${eq.color}">Y${idx + 1}: ${yVal.toFixed(2)}</span><br>`;
    }
  });

  if (foundValid) {
    tooltip.classList.remove('hidden');
    tooltip.style.left = `${cx + 10}px`;
    tooltip.style.top = `${cy + 10}px`;
    tooltip.innerHTML = tooltipContent;
  } else {
    tooltip.classList.add('hidden');
  }
}

function clearGraphHover(wi) {
  const tooltip = document.getElementById(`graph-tooltip-${wi}`);
  if (tooltip) tooltip.classList.add('hidden');
}

function analyzeGraph(wi, type) {
  const w = data[activeIdx].widgets[wi];
  const cfg = w.graphConfig;
  const resLabel = document.getElementById(`analysis-res-${wi}`);

  const eq = w.equations.find(e => e.expr !== '');
  if (!eq) {
    resLabel.textContent = "Error: No active function!";
    return;
  }

  let bestX = null;
  let bestY = type === 'min' ? Infinity : -Infinity;
  let zeroX = null;
  let minDiff = Infinity;

  const steps = 300;
  for (let i = 0; i <= steps; i++) {
    let x = cfg.minX + (i / steps) * (cfg.maxX - cfg.minX);
    let y = evaluateMath(eq.expr, x);

    if (y !== null) {
      if (type === 'min' && y < bestY) { bestY = y; bestX = x; }
      if (type === 'max' && y > bestY) { bestY = y; bestX = x; }
      if (type === 'zeros' && Math.abs(y) < minDiff) { minDiff = Math.abs(y); zeroX = x; }
    }
  }

  if (type === 'min' || type === 'max') {
    resLabel.innerHTML = bestX !== null
      ? `Local ${type}: (${bestX.toFixed(2)}, ${bestY.toFixed(2)})`
      : "No point found.";
  } else if (type === 'zeros') {
    resLabel.innerHTML = minDiff < 0.1
      ? `Root/Zero point near: X = ${zeroX.toFixed(2)}`
      : "No zero point found in view.";
  }
}

// --- Y2K FÖNSTER-DRAGGER LOGIK FÖR DEVO-S ---
document.addEventListener('mousedown', function (e) {
  // Kolla om vi klickade på vår special-header eller någon text inuti den
  const header = e.target.closest('.calc-custom-header');
  if (!header) return;

  // Hitta hela räknar-containern
  const container = header.closest('.draggable-y2k-calc');
  if (!container) return;

  // Förhindra att text markeras när vi drar
  e.preventDefault();

  const index = parseInt(container.getAttribute('data-index'));

  // Hämta nuvarande positioner
  let currentX = parseFloat(container.getAttribute('data-x')) || 0;
  let currentY = parseFloat(container.getAttribute('data-y')) || 0;

  let startX = e.clientX;
  let startY = e.clientY;

  function onMouseMove(moveEvent) {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;

    const newX = currentX + dx;
    const newY = currentY + dy;

    // Uppdatera elementets utseende direkt på skärmen
    container.style.transform = `translate(${newX}px, ${newY}px)`;

    // Uppdatera data-attributen så att nästa drag utgår härifrån
    container.setAttribute('data-x', newX);
    container.setAttribute('data-y', newY);

    // Spara positionen i ditt DevOS-system/state så att det kommes ihåg vid reload
    if (window.data && window.activeIdx !== null && window.data[window.activeIdx]?.widgets[index]) {
      window.data[window.activeIdx].widgets[index].pos = { x: newX, y: newY };
    }

    startX = moveEvent.clientX;
    startY = moveEvent.clientY;
    currentX = newX;
    currentY = newY;
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    // Spara hela statet till localstorage om din app har en save-funktion
    if (typeof saveAllState === 'function') saveAllState();
    else if (typeof saveState === 'function') saveState();
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

// --- RESIZE BEVAKNING ---
// Lyssnar på om användaren drar i hörnet för att ändra storlek, och sparar det i statet
document.addEventListener('mouseup', function (e) {
  const container = e.target.closest('.draggable-y2k-calc');
  if (!container) return;

  const index = parseInt(container.getAttribute('data-index'));
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  if (window.data && window.activeIdx !== null && window.data[window.activeIdx]?.widgets[index]) {
    window.data[window.activeIdx].widgets[index].size = { w: width, h: height };
    if (typeof saveAllState === 'function') saveAllState();
  }

  // Rita om grafen så att den anpassar sig till den nya storleken!
  if (typeof drawGraphWidgets === 'function') {
    drawGraphWidgets(index);
  }
});