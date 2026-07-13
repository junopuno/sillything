/* --- PHYSICS & INTERACT.JS --- */

function initPhysics() {
  if (typeof interact === 'undefined') return;

  interact('.widget').draggable({
    inertia: true,
    allowFrom: '.widget-header, .image-cover-widget',
    listeners: {
      start(event) { 
        const t = event.target;
        t.style.zIndex = "1000";
        t.classList.add('is-dragging');
      },
      move(event) {
        const target = event.target;
        const prevX = parseFloat(target.getAttribute('data-x')) || 0;
        const prevY = parseFloat(target.getAttribute('data-y')) || 0;
        const x = prevX + event.dx;
        const y = prevY + event.dy;
        // batch DOM updates via requestAnimationFrame for smoother rendering
        if (target._dragRaf) cancelAnimationFrame(target._dragRaf);
        target._dragRaf = requestAnimationFrame(() => {
          // use translate3d to promote to its own layer for GPU compositing
          target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          target.setAttribute('data-x', x); target.setAttribute('data-y', y);
        });
        if (activeIdx === null) {
          let w = frontPageWidgets.find(f => f.id === target.dataset.geoId);
          if (w) w.pos = { x, y };
        } else {
          data[activeIdx].widgets[target.dataset.index].pos = { x, y };
        }
      },
      end(event) {
        const t = event.target;
        t.style.zIndex = "";
        t.classList.remove('is-dragging');
        storage.set('_horizon_v7', data);
        storage.set('alvis_front_geo', frontPageWidgets);
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
    inertia: true,
    listeners: {
      move(event) {
        categoryDragMoved = true;
        const target = event.target;
        const prevX = parseFloat(target.getAttribute('data-x')) || 0;
        const prevY = parseFloat(target.getAttribute('data-y')) || 0;
        const x = prevX + event.dx;
        const y = prevY + event.dy;
        if (target._dragRaf) cancelAnimationFrame(target._dragRaf);
        target._dragRaf = requestAnimationFrame(() => {
          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute('data-x', x); target.setAttribute('data-y', y);
        });
        data[target.dataset.catIndex].pos = { x, y };
      },
      end() {
        setTimeout(() => categoryDragMoved = false, 100);
        storage.set('_horizon_v7', data);
      }
    }
  });
}
 