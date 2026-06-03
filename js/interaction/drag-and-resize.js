/* --- PHYSICS & INTERACT.JS --- */

function initPhysics() {
  if (typeof interact === 'undefined') return;

  interact('.widget').draggable({
    allowFrom: '.widget-header, .image-cover-widget',
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
        storage.set('devos_horizon_v7', data);
        storage.set('devos_front_geo_v7', frontPageWidgets);
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
        storage.set('devos_horizon_v7', data);
      }
    }
  });
}
