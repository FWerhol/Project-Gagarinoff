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
    if (!estimateItems || estimateItems.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-[var(--text-secondary)] py-8">Смета пуста. Добавьте работы слева.</td></tr>';
      if (totalSpan) totalSpan.innerHTML = '<span>Итого: 0 ₽</span>';
      return;
    }
    
    tbody.innerHTML = '';
    let grandTotal = 0;
    
    estimateItems.forEach((item, index) => {
      grandTotal += item.total;
      const row = document.createElement('tr');
      row.className = 'border-b border-[var(--border)]';
      row.innerHTML = `
        <td class="py-2 pr-2 text-[var(--text-primary)]">${escapeHtml(item.name)}</td>
        <td class="py-2 pr-2 text-[var(--text-primary)] quantity-cell" data-index="${index}">
          <input type="number" step="0.1" value="${item.quantity}" class="edit-quantity w-20 p-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]" data-index="${index}">
        </td>
        <td class="py-2 pr-2 text-[var(--text-primary)]">${item.unit}</td>
        <td class="py-2 pr-2 text-[var(--text-primary)] price-cell" data-index="${index}">
          <input type="number" step="0.1" value="${item.price}" class="edit-price w-24 p-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]" data-index="${index}">
        </td>
        <td class="py-2 text-[var(--accent)] font-semibold item-total-${index}">${item.total.toLocaleString()} ₽</td>
        <td class="py-2 text-center">
          <button class="remove-item-btn text-red-500 hover:text-red-700 transition" data-index="${index}" aria-label="Удалить позицию">✖</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    if (totalSpan) totalSpan.innerHTML = `<span>Итого: ${grandTotal.toLocaleString()} ₽</span>`;
    
    // Обработчики удаления
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(btn.dataset.index);
        if (onPriceChangeCallback) onPriceChangeCallback('remove', index);
      });
    });
    
    // Обработчики изменения количества
    document.querySelectorAll('.edit-quantity').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(input.dataset.index);
        const newQuantity = parseFloat(input.value);
        if (!isNaN(newQuantity) && newQuantity > 0) {
          if (onPriceChangeCallback) onPriceChangeCallback('quantity', index, newQuantity);
        } else {
          input.value = estimateItems[index]?.quantity || 1;
        }
      });
    });
    
    // Обработчики изменения цены
    document.querySelectorAll('.edit-price').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(input.dataset.index);
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