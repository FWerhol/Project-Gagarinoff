// modules/estimate/estimateForm.js
(function() {
  // --- Элементы DOM ---
  let categorySelect, workSelect, unitSelect, priceInput, quantityInput, addBtn, previewTotalSpan, clearBtn, saveBtn, pdfBtn;
  
  let currentSelectedWork = null;
  let BASE_KNOWLEDGE = null;
  let onAddWorkCallback = null;
  let onClearCallback = null;
  let onSaveCallback = null;
  let onPDFCallback = null;

  function setCallbacks(callbacks) {
    if (callbacks.onAddWork) onAddWorkCallback = callbacks.onAddWork;
    if (callbacks.onClear) onClearCallback = callbacks.onClear;
    if (callbacks.onSave) onSaveCallback = callbacks.onSave;
    if (callbacks.onPDF) onPDFCallback = callbacks.onPDF;
  }

  function setBaseKnowledge(knowledge) {
    BASE_KNOWLEDGE = knowledge;
    if (categorySelect && BASE_KNOWLEDGE) {
      loadCategories();
    }
  }

  function updatePreviewTotal() {
    const quantity = parseFloat(quantityInput?.value) || 0;
    const price = parseFloat(priceInput?.value) || 0;
    const total = quantity * price;
    if (previewTotalSpan) previewTotalSpan.textContent = `${total.toLocaleString()} ₽`;
  }

  function loadCategories() {
    if (!categorySelect || !BASE_KNOWLEDGE) return;
    categorySelect.innerHTML = '<option value="">-- Выберите раздел --</option>';
    BASE_KNOWLEDGE.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  }

  function loadWorksByCategory(categoryId) {
    if (!workSelect || !BASE_KNOWLEDGE) return;
    workSelect.disabled = false;
    workSelect.innerHTML = '<option value="">-- Выберите работу --</option>';
    
    const filteredWorks = BASE_KNOWLEDGE.works.filter(w => w.categoryId == categoryId);
    filteredWorks.forEach(work => {
      const option = document.createElement('option');
      option.value = work.id;
      option.textContent = `${work.name} (${work.price.toLocaleString()} ₽/${work.unit})`;
      option.dataset.price = work.price;
      option.dataset.unit = work.unit;
      option.dataset.name = work.name;
      workSelect.appendChild(option);
    });
  }

  function onWorkSelect() {
    const selectedOption = workSelect?.options[workSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
      currentSelectedWork = {
        name: selectedOption.dataset.name,
        price: parseFloat(selectedOption.dataset.price),
        unit: selectedOption.dataset.unit
      };
      if (priceInput) {
        priceInput.value = currentSelectedWork.price;
        priceInput.disabled = false;
      }
      if (unitSelect) {
        unitSelect.innerHTML = '';
        const units = ['м²', 'м.п.', 'шт', 'м³', 'компл', 'мешок', 'уп'];
        units.forEach(unit => {
          const opt = document.createElement('option');
          opt.value = unit;
          opt.textContent = unit;
          if (unit === currentSelectedWork.unit) opt.selected = true;
          unitSelect.appendChild(opt);
        });
        unitSelect.disabled = false;
      }
      if (quantityInput) quantityInput.disabled = false;
      if (addBtn) addBtn.disabled = false;
      updatePreviewTotal();
    } else {
      currentSelectedWork = null;
      if (priceInput) {
        priceInput.value = '';
        priceInput.disabled = true;
      }
      if (unitSelect) unitSelect.disabled = true;
      if (quantityInput) quantityInput.disabled = true;
      if (addBtn) addBtn.disabled = true;
      if (previewTotalSpan) previewTotalSpan.textContent = '0 ₽';
    }
  }

  function addWorkToEstimate() {
    if (!currentSelectedWork) {
      alert('Выберите работу');
      return;
    }
    
    const quantity = parseFloat(quantityInput?.value);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Введите корректное количество');
      return;
    }
    
    const price = parseFloat(priceInput?.value);
    if (isNaN(price) || price <= 0) {
      alert('Введите корректную цену');
      return;
    }
    
    const unit = unitSelect ? unitSelect.value : 'м²';
    const total = quantity * price;
    
    const newItem = {
      id: Date.now() + Math.random(),
      name: currentSelectedWork.name,
      quantity: quantity,
      unit: unit,
      price: price,
      total: total
    };
    
    if (onAddWorkCallback) onAddWorkCallback(newItem);
    
    // Сброс формы
    if (workSelect) workSelect.value = '';
    currentSelectedWork = null;
    if (priceInput) {
      priceInput.value = '';
      priceInput.disabled = true;
    }
    if (unitSelect) unitSelect.disabled = true;
    if (quantityInput) quantityInput.value = 1;
    if (addBtn) addBtn.disabled = true;
    if (previewTotalSpan) previewTotalSpan.textContent = '0 ₽';
    if (categorySelect) categorySelect.value = '';
    if (workSelect) {
      workSelect.disabled = true;
      workSelect.innerHTML = '<option value="">-- Сначала выберите раздел --</option>';
    }
  }

  function clearEstimate() {
    if (confirm('Очистить все позиции сметы?')) {
      if (onClearCallback) onClearCallback();
    }
  }

  function saveEstimate() {
    if (onSaveCallback) onSaveCallback();
  }

  function generatePDF() {
    if (onPDFCallback) onPDFCallback();
  }

  function init() {
    // Находим элементы
    categorySelect = document.getElementById('estimate-category-select');
    workSelect = document.getElementById('estimate-work-select');
    unitSelect = document.getElementById('estimate-unit-select');
    priceInput = document.getElementById('estimate-price-input');
    quantityInput = document.getElementById('estimate-quantity');
    addBtn = document.getElementById('estimate-add-btn');
    previewTotalSpan = document.getElementById('estimate-preview-total');
    clearBtn = document.getElementById('estimate-clear-btn');
    saveBtn = document.getElementById('estimate-save-btn');
    pdfBtn = document.getElementById('estimate-pdf-btn');
    
    if (!categorySelect) {
      console.warn('EstimateForm: элементы формы не найдены');
      return;
    }
    
    // Если база уже есть — загружаем категории
    if (BASE_KNOWLEDGE) {
      loadCategories();
    }
    
    // Навешиваем обработчики
    categorySelect.addEventListener('change', () => {
      const categoryId = categorySelect.value;
      if (categoryId) {
        loadWorksByCategory(categoryId);
        workSelect.disabled = false;
      } else {
        workSelect.disabled = true;
        workSelect.innerHTML = '<option value="">-- Сначала выберите раздел --</option>';
        currentSelectedWork = null;
        if (priceInput) priceInput.disabled = true;
        if (unitSelect) unitSelect.disabled = true;
        if (quantityInput) quantityInput.disabled = true;
        if (addBtn) addBtn.disabled = true;
      }
    });
    
    if (workSelect) workSelect.addEventListener('change', onWorkSelect);
    if (priceInput) priceInput.addEventListener('input', updatePreviewTotal);
    if (quantityInput) quantityInput.addEventListener('input', updatePreviewTotal);
    if (addBtn) addBtn.addEventListener('click', addWorkToEstimate);
    if (clearBtn) clearBtn.addEventListener('click', clearEstimate);
    if (saveBtn) saveBtn.addEventListener('click', saveEstimate);
    if (pdfBtn) pdfBtn.addEventListener('click', generatePDF);
    
    // Начальное состояние
    if (priceInput) priceInput.disabled = true;
    if (unitSelect) unitSelect.disabled = true;
    if (quantityInput) quantityInput.disabled = true;
    if (addBtn) addBtn.disabled = true;
  }

  window.EstimateForm = {
    init,
    setCallbacks,
    setBaseKnowledge,
    loadCategories,
    loadWorksByCategory,
    updatePreviewTotal
  };
})();