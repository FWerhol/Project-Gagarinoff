script.
  (function() {
    // Безопасное получение элемента
    function getElement(id) {
      const el = document.getElementById(id);
      if (!el) console.warn(`[room-editor] Элемент с id "${id}" не найден`);
      return el;
    }

    const canvas = getElement('room-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let points = [];
    let isClosed = false;
    let wallTypes = [];
    let referenceWallIndex = -1;
    let referenceRealLength = 0;

    function initCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawCanvas();
    }

    function drawCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'var(--accent)';
      ctx.fillStyle = 'rgba(52, 211, 153, 0.1)';
      ctx.lineWidth = 2;

      if (points.length === 0) return;

      // Рисуем отрезки
      for (let i = 0; i < points.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.stroke();
      }
      if (isClosed && points.length > 2) {
        ctx.beginPath();
        ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Рисуем точки
      for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'var(--accent)';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.fillText(i + 1, points[i].x - 4, points[i].y - 6);
      }
    }

    function addPoint(event) {
      if (isClosed) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      let clientX, clientY;

      if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
        event.preventDefault();
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      let canvasX = (clientX - rect.left) * scaleX;
      let canvasY = (clientY - rect.top) * scaleY;
      canvasX = Math.min(Math.max(canvasX, 10), canvas.width - 10);
      canvasY = Math.min(Math.max(canvasY, 10), canvas.height - 10);
      points.push({ x: canvasX, y: canvasY });
      drawCanvas();
    }

    function closePolygon() {
      if (points.length < 3 || isClosed) return;
      isClosed = true;
      drawCanvas();
      updateWallsTable();
      calculateStats();
    }

    function undo() {
      if (isClosed) {
        isClosed = false;
        wallTypes = [];
      } else if (points.length > 0) {
        points.pop();
      }
      drawCanvas();
      if (points.length < 3) {
        const tbody = getElement('walls-table');
        if (tbody) tbody.innerHTML = '<tr><td colspan="3" class="text-center text-[var(--text-secondary)] py-4">Нарисуйте помещение, чтобы увидеть стены</td></tr>';
        const statsDiv = getElement('stats-text');
        if (statsDiv) statsDiv.innerHTML = '<span>Пока не заданы точки</span>';
      } else {
        updateWallsTable();
        calculateStats();
      }
    }

    function clearAll() {
      points = [];
      isClosed = false;
      wallTypes = [];
      drawCanvas();
      const tbody = getElement('walls-table');
      if (tbody) tbody.innerHTML = '<tr><td colspan="3" class="text-center text-[var(--text-secondary)] py-4">Нарисуйте помещение, чтобы увидеть стены</td></tr>';
      const statsDiv = getElement('stats-text');
      if (statsDiv) statsDiv.innerHTML = '<span>Пока не заданы точки</span>';
    }

    function getSegmentLengthsPx() {
      const segLengths = [];
      for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        segLengths.push(Math.hypot(dx, dy));
      }
      if (isClosed && points.length > 2) {
        const dx = points[0].x - points[points.length - 1].x;
        const dy = points[0].y - points[points.length - 1].y;
        segLengths.push(Math.hypot(dx, dy));
      }
      return segLengths;
    }

    function getAreaPx() {
      if (!isClosed || points.length < 3) return 0;
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
      }
      return Math.abs(area) / 2;
    }

    function calculateStats() {
      const pxLengths = getSegmentLengthsPx();
      let scale = 1;
      if (referenceWallIndex >= 0 && referenceRealLength > 0 && pxLengths[referenceWallIndex] > 0) {
        scale = referenceRealLength / pxLengths[referenceWallIndex];
      } else {
        scale = 1 / 100;
      }
      const realLengths = pxLengths.map(l => +(l * scale).toFixed(2));
      const totalPerimeter = realLengths.reduce((a, b) => a + b, 0);
      const areaM2 = +(getAreaPx() * scale * scale).toFixed(2);

      const statsDiv = getElement('stats-text');
      if (statsDiv) {
        statsDiv.innerHTML = `
          <span>Периметр: ${totalPerimeter.toFixed(2)} м</span><br>
          <span>Площадь: ${areaM2.toFixed(2)} м²</span>
        `;
      }
      return realLengths;
    }

    function updateWallsTable() {
      if (!isClosed || points.length < 3) return;
      const lengths = calculateStats();
      if (wallTypes.length !== lengths.length) {
        wallTypes = new Array(lengths.length).fill('Не выбран');
      }
      const tbody = getElement('walls-table');
      if (!tbody) return;

      tbody.innerHTML = '';
      for (let i = 0; i < lengths.length; i++) {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-[var(--border)]';

        const tdWall = document.createElement('td');
        tdWall.className = 'py-2 text-[var(--text-primary)]';
        tdWall.textContent = `Стена ${i + 1}`;

        const tdLength = document.createElement('td');
        tdLength.className = 'py-2 text-[var(--text-secondary)]';
        tdLength.textContent = `${lengths[i].toFixed(2)} м`;

        const tdType = document.createElement('td');
        tdType.className = 'py-2';
        const select = document.createElement('select');
        select.className = 'wall-type-select bg-[var(--bg-primary)] border border-[var(--border)] rounded p-1 text-sm text-[var(--text-primary)]';
        select.dataset.wallIndex = i;

        const options = ['Не выбран', 'Плитка', 'Покраска', 'Обои', 'Штукатурка', 'Стяжка'];
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          if (wallTypes[i] === opt) option.selected = true;
          select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
          const idx = parseInt(select.dataset.wallIndex, 10);
          wallTypes[idx] = select.value;
        });

        tdType.appendChild(select);
        tr.appendChild(tdWall);
        tr.appendChild(tdLength);
        tr.appendChild(tdType);
        tbody.appendChild(tr);
      }
    }

    function saveRoom() {
      if (!isClosed || points.length < 3) {
        alert('Сначала нарисуйте замкнутое помещение (двойной клик для завершения)');
        return;
      }
      const pxLengths = getSegmentLengthsPx();
      let scale = 1;
      if (referenceWallIndex >= 0 && referenceRealLength > 0 && pxLengths[referenceWallIndex] > 0) {
        scale = referenceRealLength / pxLengths[referenceWallIndex];
      } else {
        scale = 1 / 100;
      }
      const realLengths = pxLengths.map(l => +(l * scale).toFixed(2));
      const areaM2 = +(getAreaPx() * scale * scale).toFixed(2);
      const roomData = {
        points: points,
        isClosed: isClosed,
        wallTypes: wallTypes,
        realLengths: realLengths,
        area: areaM2,
        reference: referenceWallIndex >= 0 ? {
          wallIndex: referenceWallIndex,
          realLength: referenceRealLength
        } : null
      };
      console.log('Сохранённая схема:', roomData);
      alert('Схема сохранена! Данные в консоли (F12)');
      // Здесь можно отправить roomData на сервер
    }

    // Привязка событий с проверками
    if (canvas) {
      canvas.addEventListener('click', addPoint);
      canvas.addEventListener('dblclick', closePolygon);
      canvas.addEventListener('touchstart', addPoint);
    }
    const clearBtn = getElement('clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    const undoBtn = getElement('undo-btn');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    const saveBtn = getElement('save-room-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveRoom);

    window.addEventListener('resize', initCanvas);
    initCanvas();
  })();