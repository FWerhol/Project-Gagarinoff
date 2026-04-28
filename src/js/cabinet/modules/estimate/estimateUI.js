// modules/estimate/estimateUI.js
(function() {
  const tbody = document.getElementById('estimate-items-body');
  const totalSpan = document.getElementById('estimate-total');
  let onPriceChangeCallback = null;

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setCallbacks(callbacks) {
    if (callbacks.onPriceChange) onPriceChangeCallback = callbacks.onPriceChange;
  }

  function renderEstimateTable(estimateItems) {
    if (!tbody) return;

    if (!estimateItems || estimateItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-[var(--text-secondary)] py-8">Смета пуста. Добавьте работы или группы.</td></tr>';
      updateTotalDisplay(0);
      return;
    }

    tbody.innerHTML = '';
    let grandTotal = 0;
    let groupCounter = 0;
    let workCounter = 0;

    estimateItems.forEach((item, index) => {
      if (item.type === 'group') {
        groupCounter++;
        workCounter = 0;

        const row = document.createElement('tr');
        row.className = 'bg-[var(--bg-primary)]/30';
        row.innerHTML = `
          <td colspan="7" class="py-2 font-bold text-[var(--text-primary)] text-left">
            <span class="mr-2">📁</span> ${escapeHtml(item.name)}
            <button class="remove-group-btn float-right text-red-500 hover:text-red-700 text-sm" data-index="${index}">✖ Удалить группу</button>
          </td>
        `;
        tbody.appendChild(row);
        return;
      }

      if (item.type === 'work') {
        workCounter++;
        grandTotal += item.total;
        const workNumber = groupCounter > 0 ? `${groupCounter}.${workCounter}` : `${workCounter}`;

        const row = document.createElement('tr');
        row.className = 'border-b border-[var(--border)]';
        row.innerHTML = `
          <td class="py-2 pr-2 text-[var(--text-primary)] text-center w-12">${workNumber}</td>
          <td class="py-2 pr-2 text-[var(--text-primary)]">${escapeHtml(item.name)}</td>
          <td class="py-2 pr-2 text-[var(--text-primary)]">${item.quantity}</td>
          <td class="py-2 pr-2 text-[var(--text-primary)]">${item.unit}</td>
          <td class="py-2 pr-2 text-[var(--text-primary)]">
            <input type="number" step="0.1" value="${item.price}" class="edit-price w-24 p-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]" data-index="${index}">
          </td>
          <td class="py-2 text-[var(--accent)] font-semibold text-right w-24">${item.total.toLocaleString()} ₽</td>
          <td class="py-2 text-center w-8">
            <button class="remove-item-btn text-red-500 hover:text-red-700 transition" data-index="${index}">✖</button>
          </td>
        `;
        tbody.appendChild(row);
      }
    });

    updateTotalDisplay(grandTotal);

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        if (onPriceChangeCallback) onPriceChangeCallback('remove', index);
      });
    });

    document.querySelectorAll('.remove-group-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        if (confirm('Удалить группу со всеми работами внутри?')) {
          if (onPriceChangeCallback) onPriceChangeCallback('removeGroup', index);
        }
      });
    });

    document.querySelectorAll('.edit-price').forEach(input => {
      input.addEventListener('change', () => {
        const index = parseInt(input.dataset.index, 10);
        const newPrice = parseFloat(input.value);
        if (!isNaN(newPrice) && newPrice > 0) {
          if (onPriceChangeCallback) onPriceChangeCallback('price', index, newPrice);
        } else {
          input.value = estimateItems[index]?.price || 0;
        }
      });
    });
  }

  function updateTotalDisplay(total) {
    if (totalSpan) totalSpan.innerHTML = `<span>Итого: ${total.toLocaleString()} ₽</span>`;
  }

  window.EstimateUI = {
    renderEstimateTable,
    updateTotalDisplay,
    setCallbacks
  };
})();