// cabinet/estimate.js
(function() {
  let BASE_KNOWLEDGE = null;
  if (typeof window !== 'undefined' && window.BASE_KNOWLEDGE) {
    BASE_KNOWLEDGE = window.BASE_KNOWLEDGE;
  }
  if (!BASE_KNOWLEDGE) {
    const checkInterval = setInterval(() => {
      if (window.BASE_KNOWLEDGE) {
        BASE_KNOWLEDGE = window.BASE_KNOWLEDGE;
        clearInterval(checkInterval);
        init();
      }
    }, 100);
    setTimeout(() => clearInterval(checkInterval), 5000);
  } else {
    init();
  }

  // --- Пользовательские работы и категории ---
  function loadUserWorks() {
    const saved = localStorage.getItem('user_works');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch(e) { return []; }
    }
    return [];
  }

  function saveUserWorks(works) {
    localStorage.setItem('user_works', JSON.stringify(works));
  }

  function loadUserCategories() {
    const saved = localStorage.getItem('user_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch(e) { return []; }
    }
    return [];
  }

  function saveUserCategories(categories) {
    localStorage.setItem('user_categories', JSON.stringify(categories));
  }

  function isCategoryExists(name, excludeId = null) {
    const allCats = getAllCategories();
    return allCats.some(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId);
  }

  function addUserCategory(name) {
    if (isCategoryExists(name)) {
      alert(`Раздел "${name}" уже существует!`);
      return null;
    }
    const userCats = loadUserCategories();
    const newId = 900 + Date.now();
    const newCat = { id: newId, name: name, isUserDefined: true };
    userCats.push(newCat);
    saveUserCategories(userCats);
    return newCat;
  }

  function deleteUserCategory(categoryId) {
    let userCats = loadUserCategories();
    const updatedCats = userCats.filter(cat => cat.id !== categoryId);
    saveUserCategories(updatedCats);
    let userWorks = loadUserWorks();
    const updatedWorks = userWorks.filter(work => work.categoryId !== categoryId);
    saveUserWorks(updatedWorks);
    return true;
  }

  function addUserWork(name, unit, price, categoryId) {
    const userWorks = loadUserWorks();
    const newWork = {
      id: 'user_' + Date.now(),
      name: name,
      unit: unit,
      price: parseFloat(price),
      categoryId: categoryId,
      isUserDefined: true
    };
    userWorks.push(newWork);
    saveUserWorks(userWorks);
    return newWork;
  }

  function getAllCategories() {
    const baseCats = BASE_KNOWLEDGE ? BASE_KNOWLEDGE.categories : [];
    const userCats = loadUserCategories();
    return [...baseCats, ...userCats];
  }

  function getAllWorksByCategory(categoryId) {
    let works = BASE_KNOWLEDGE.works.filter(w => w.categoryId == categoryId);
    const userWorks = loadUserWorks();
    const filteredUserWorks = userWorks.filter(w => w.categoryId == categoryId);
    works = [...works, ...filteredUserWorks];
    return works;
  }
  
  function init() {
    if (!BASE_KNOWLEDGE) {
      console.error('База знаний не загружена');
      return;
    }
    
    const categorySelect = document.getElementById('estimate-category-select');
    const workSelect = document.getElementById('estimate-work-select');
    const unitSelect = document.getElementById('estimate-unit-select');
    const priceInput = document.getElementById('estimate-price-input');
    const quantityInput = document.getElementById('estimate-quantity');
    const previewTotalSpan = document.getElementById('estimate-preview-total');
    const addBtn = document.getElementById('estimate-add-btn');
    const addGroupBtn = document.getElementById('estimate-add-group-btn');
    const saveBtn = document.getElementById('estimate-save-btn');
    const clearBtn = document.getElementById('estimate-clear-btn');
    const pdfBtn = document.getElementById('estimate-pdf-btn');
    const tbody = document.getElementById('estimate-items-body');
    const totalSpan = document.getElementById('estimate-total');  
    const newWorkName = document.getElementById('estimate-new-work-name');
    const newWorkUnit = document.getElementById('estimate-new-work-unit');
    const newWorkPrice = document.getElementById('estimate-new-work-price');
    const newWorkCategory = document.getElementById('estimate-new-work-category');
    const addWorkBtn = document.getElementById('estimate-add-work-btn');
    const newCategoryName = document.getElementById('estimate-new-category-name');
    const addCategoryBtn = document.getElementById('estimate-add-category-btn');
    const deleteCategoryBtn = document.getElementById('estimate-delete-category-btn');
    const targetGroupSelect = document.getElementById('estimate-target-group-select');
    
    let currentCategoryId = null;
    let estimateItems = [];
    let currentSelectedWork = null;
    
    function escapeHtml(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    
    function updatePreviewTotal() {
      const quantity = parseFloat(quantityInput.value) || 0;
      const price = parseFloat(priceInput.value) || 0;
      const total = quantity * price;
      if (previewTotalSpan) previewTotalSpan.textContent = `${total.toLocaleString()} ₽`;
    }
    
    function populateUnitSelect(selectedUnit) {
      const units = ['м²', 'м.п.', 'шт', 'м³', 'компл', 'мешок', 'уп'];
      unitSelect.innerHTML = '';
      units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        if (unit === selectedUnit) option.selected = true;
        unitSelect.appendChild(option);
      });
    }
    
    function updateGroupSelect() {
      if (!targetGroupSelect) return;
      const groups = estimateItems.filter(item => item.type === 'group');
      const currentValue = targetGroupSelect.value;
      targetGroupSelect.innerHTML = '<option value="none">-- Без группы (в конец) --</option>';
      groups.forEach((group, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = group.name;
        targetGroupSelect.appendChild(option);
      });
      if (currentValue !== 'none') {
        const idx = parseInt(currentValue);
        if (!isNaN(idx) && idx >= 0 && idx < groups.length) {
          targetGroupSelect.value = currentValue;
        }
      }
    }
    
    function addGroup() {
      const groupName = prompt('Введите название группы работ:', 'Новая группа');
      if (!groupName || groupName.trim() === '') return;
      estimateItems.push({
        type: 'group',
        name: groupName.trim(),
        items: []
      });
      updateGroupSelect();
      renderEstimateTable();
      const groups = estimateItems.filter(item => item.type === 'group');
      targetGroupSelect.value = groups.length - 1;
    }
    
    function addUserCategoryHandler() {
      const name = newCategoryName?.value.trim();
      if (!name) { alert('Введите название раздела'); return; }
      const newCat = addUserCategory(name);
      if (newCat) {
        newCategoryName.value = '';
        loadCategories();
        alert(`Раздел "${name}" добавлен`);
      }
    }
    
    function deleteUserCategoryHandler() {
      const selectedOption = categorySelect.options[categorySelect.selectedIndex];
      if (!selectedOption || !selectedOption.value) {
        alert('Сначала выберите раздел для удаления');
        return;
      }
      const categoryId = parseInt(selectedOption.value);
      const categoryName = selectedOption.textContent.replace(' (моя)', '');
      
      if (categoryId < 900) {
        alert('Нельзя удалить базовый раздел. Вы можете удалять только свои разделы.');
        return;
      }
      
      if (confirm(`Удалить раздел "${categoryName}" и все ваши работы в нём? Это действие не отменить.`)) {
        deleteUserCategory(categoryId);
        loadCategories();
        if (currentCategoryId == categoryId) {
          categorySelect.value = '';
          workSelect.disabled = true;
          workSelect.innerHTML = '<option value="">-- Сначала выберите раздел --</option>';
          currentSelectedWork = null;
          if (priceInput) priceInput.disabled = true;
          if (unitSelect) unitSelect.disabled = true;
          if (quantityInput) quantityInput.disabled = true;
          if (addBtn) addBtn.disabled = true;
        }
        alert(`Раздел "${categoryName}" удалён`);
      }
    }
    
    function addUserDefinedWork() {
      const name = newWorkName?.value.trim();
      const unit = newWorkUnit?.value;
      const price = parseFloat(newWorkPrice?.value);
      const categoryId = newWorkCategory?.value;
      
      if (!name) { alert('Введите название работы'); return; }
      if (!categoryId) { alert('Выберите раздел для работы'); return; }
      if (isNaN(price) || price <= 0) { alert('Введите корректную цену'); return; }
      
      addUserWork(name, unit, price, parseInt(categoryId));
      if (newWorkName) newWorkName.value = '';
      if (newWorkPrice) newWorkPrice.value = '';
      
      if (currentCategoryId && currentCategoryId == categoryId) {
        loadWorksByCategory(currentCategoryId);
      }
      alert('Работа добавлена в вашу базу');
    }
    
    function loadCategories() {
      if (!categorySelect) return;
      const allCats = getAllCategories();
      
      categorySelect.innerHTML = '<option value="">-- Выберите раздел --</option>';
      allCats.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        const label = cat.name + (cat.isUserDefined ? ' (моя)' : '');
        option.textContent = label;
        categorySelect.appendChild(option);
      });
      
      if (newWorkCategory) {
        newWorkCategory.innerHTML = '<option value="">-- Выберите раздел --</option>';
        allCats.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          const label = cat.name + (cat.isUserDefined ? ' (моя)' : '');
          option.textContent = label;
          newWorkCategory.appendChild(option);
        });
      }
    }
    
    function loadWorksByCategory(categoryId) {
      currentCategoryId = categoryId;
      if (!workSelect) return;
      workSelect.disabled = false;
      workSelect.innerHTML = '<option value="">-- Выберите работу --</option>';
      const works = getAllWorksByCategory(categoryId);
      
      works.forEach(work => {
        const option = document.createElement('option');
        option.value = work.id;
        option.textContent = `${work.name} (${work.price.toLocaleString()} ₽/${work.unit})` + (work.isUserDefined ? ' (моя)' : '');
        option.dataset.price = work.price;
        option.dataset.unit = work.unit;
        option.dataset.name = work.name;
        workSelect.appendChild(option);
      });
      
      currentSelectedWork = null;
    }
    
    if (workSelect) {
      workSelect.addEventListener('change', () => {
        const selectedOption = workSelect.options[workSelect.selectedIndex];
        if (selectedOption && selectedOption.value) {
          currentSelectedWork = {
            name: selectedOption.dataset.name,
            price: parseFloat(selectedOption.dataset.price),
            unit: selectedOption.dataset.unit
          };
          if (priceInput) priceInput.value = currentSelectedWork.price;
          populateUnitSelect(currentSelectedWork.unit);
          updatePreviewTotal();
          if (priceInput) priceInput.disabled = false;
          if (unitSelect) unitSelect.disabled = false;
          if (quantityInput) quantityInput.disabled = false;
          if (addBtn) addBtn.disabled = false;
        } else {
          currentSelectedWork = null;
          if (priceInput) priceInput.value = '';
          if (priceInput) priceInput.disabled = true;
          if (unitSelect) unitSelect.disabled = true;
          if (quantityInput) quantityInput.disabled = true;
          if (addBtn) addBtn.disabled = true;
          if (previewTotalSpan) previewTotalSpan.textContent = '0 ₽';
        }
      });
    }
    
    if (priceInput) priceInput.addEventListener('input', updatePreviewTotal);
    if (quantityInput) quantityInput.addEventListener('input', updatePreviewTotal);
    
    function addWorkToEstimate() {
      if (!currentSelectedWork) { 
        alert('Выберите работу');
        return;
      }
      const quantity = parseFloat(quantityInput.value);
      if (isNaN(quantity) || quantity <= 0) { 
        alert('Введите корректное количество');
        return;
      }
      const price = parseFloat(priceInput.value);
      if (isNaN(price) || price <= 0) { 
        alert('Введите корректную цену');
        return;
      }
      
      const newWork = {
        type: 'work',
        id: Date.now() + Math.random(),
        name: currentSelectedWork.name,
        quantity: quantity,
        unit: unitSelect.value,
        price: price,
        total: quantity * price
      };
      
      const selectedGroupOption = targetGroupSelect?.value;
      let targetIndex = estimateItems.length;
      if (selectedGroupOption !== 'none') {
        const groups = estimateItems.filter(item => item.type === 'group');
        const selectedGroup = groups[parseInt(selectedGroupOption)];
        if (selectedGroup) targetIndex = estimateItems.indexOf(selectedGroup) + 1;
      }
      
      estimateItems.splice(targetIndex, 0, newWork);
      updateGroupSelect();
      renderEstimateTable();
      
      if (priceInput) priceInput.value = '';
      if (priceInput) priceInput.disabled = true;
      if (unitSelect) unitSelect.disabled = true;
      if (quantityInput) quantityInput.value = 1;
      if (previewTotalSpan) previewTotalSpan.textContent = '0 ₽';
      
      const selectedOption = workSelect.options[workSelect.selectedIndex];
      if (selectedOption && selectedOption.value) {
        currentSelectedWork = {
          name: selectedOption.dataset.name,
          price: parseFloat(selectedOption.dataset.price),
          unit: selectedOption.dataset.unit
        };
        if (priceInput) priceInput.value = currentSelectedWork.price;
        populateUnitSelect(currentSelectedWork.unit);
        updatePreviewTotal();
        if (priceInput) priceInput.disabled = false;
        if (unitSelect) unitSelect.disabled = false;
        if (quantityInput) quantityInput.disabled = false;
        if (addBtn) addBtn.disabled = false;
      }
    }
    
    function renderEstimateTable() {
      if (!tbody) return;
      if (estimateItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-[var(--text-secondary)] py-8">Смета пуста. Добавьте работы или группы.</td></tr>';
        if (totalSpan) totalSpan.innerHTML = '<span>Итого: 0 ₽</span>';
        updateGroupSelect();
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
        } else if (item.type === 'work') {
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
      
      if (totalSpan) totalSpan.innerHTML = `<span>Итого: ${grandTotal.toLocaleString()} ₽</span>`;
      updateGroupSelect();
      
      document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          estimateItems.splice(index, 1);
          renderEstimateTable();
        });
      });
      
      document.querySelectorAll('.remove-group-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          if (confirm('Удалить группу со всеми работами внутри?')) {
            estimateItems.splice(index, 1);
            renderEstimateTable();
          }
        });
      });
      
      document.querySelectorAll('.edit-price').forEach(input => {
        input.addEventListener('change', () => {
          const index = parseInt(input.dataset.index);
          const newPrice = parseFloat(input.value);
          if (!isNaN(newPrice) && newPrice > 0 && estimateItems[index] && estimateItems[index].type === 'work') {
            estimateItems[index].price = newPrice;
            estimateItems[index].total = estimateItems[index].quantity * newPrice;
            renderEstimateTable();
          } else {
            input.value = estimateItems[index]?.price || 0;
          }
        });
      });
    }
    
    function saveEstimate() {
      if (estimateItems.length === 0) { alert('Нечего сохранять. Добавьте работы.'); return; }
      const estimateData = {
        id: 'estimate_' + Date.now(),
        date: new Date().toISOString(),
        items: estimateItems,
        total: estimateItems.reduce((sum, item) => sum + (item.total || 0), 0)
      };
      localStorage.setItem('current_estimate', JSON.stringify(estimateData));
      let allEstimates = JSON.parse(localStorage.getItem('all_estimates') || '[]');
      allEstimates.unshift(estimateData);
      if (allEstimates.length > 50) allEstimates = allEstimates.slice(0, 50);
      localStorage.setItem('all_estimates', JSON.stringify(allEstimates));
      alert('Смета сохранена!');
    }
    
    function clearEstimate() {
      if (estimateItems.length === 0) return;
      if (confirm('Очистить все позиции и группы сметы?')) {
        estimateItems = [];
        renderEstimateTable();
      }
    }
    
    function loadCurrentEstimate() {
      const saved = localStorage.getItem('current_estimate');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.items && data.items.length) {
            estimateItems = data.items;
            renderEstimateTable();
          }
        } catch(e) {}
      }
    }
   
   // --- ГЕНЕРАЦИЯ PDF (ОКОНЧАТЕЛЬНАЯ ВЕРСИЯ) ---
  function generateEstimatePDF() {
    if (estimateItems.length === 0) {
      alert('Нет данных для печати. Добавьте работы.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });

    doc.setFont("DejaVuSans", "normal");

    const pageWidth = 210;
    const leftMargin = 15;
    const rightMargin = 15;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    let y = 25;

    // Заголовок документа
    doc.setFontSize(16);
    doc.text('СМЕТА РАБОТ', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Дата
    doc.setFontSize(10);
    const today = new Date();
    const dateStr = today.toLocaleDateString('ru-RU');
    doc.text(`Дата: ${dateStr}`, leftMargin, y);
    y += 12;

    // Параметры таблицы
    const columns = ['№', 'Наименование работ', 'Кол-во', 'Ед.', 'Цена (₽)', 'Сумма (₽)'];
    const colWidths = [10, 68, 18, 12, 25, 30];
    let startX = leftMargin;
    let currentY = y;
    const rowHeight = 6;

    // Функция для получения высоты строки
    function getRowHeight(text, maxWidth, fontSize) {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      return lines.length * rowHeight;
    }

    // Функция рисования обычной строки
    function drawRow(yPos, cells, isHeader = false) {
      let currentX = startX;
      const fontSize = isHeader ? 9 : 8;
      doc.setFontSize(fontSize);
      
      // Вычисляем максимальную высоту строки
      let maxHeight = rowHeight;
      for (let i = 0; i < cells.length; i++) {
        const text = cells[i];
        const maxWidth = colWidths[i] - 4;
        const textHeight = getRowHeight(text, maxWidth, fontSize);
        if (textHeight > maxHeight) maxHeight = textHeight;
      }
      
      // Рисуем ячейки
      for (let i = 0; i < cells.length; i++) {
        const text = cells[i];
        const maxWidth = colWidths[i] - 4;
        const lines = doc.splitTextToSize(text, maxWidth);
        
        // Рамка ячейки
        doc.rect(currentX, yPos, colWidths[i], maxHeight);
        
        // Вертикальное центрирование: текст по центру ячейки
        const textHeightTotal = lines.length * rowHeight;
        let textY = yPos + (maxHeight - textHeightTotal) / 2 + rowHeight;
        for (let j = 0; j < lines.length; j++) {
          doc.text(lines[j], currentX + 2, textY);
          textY += rowHeight;
        }
        
        currentX += colWidths[i];
      }
      
      return maxHeight;
    }

    // Функция рисования строки группы (объединённая ячейка)
    function drawGroupRow(yPos, groupName) {
      const fontSize = 10;
      doc.setFontSize(fontSize);
      
      const totalWidth = colWidths.reduce((a, b) => a + b, 0);
      let currentX = startX;
      
      // Вычисляем высоту строки для группы
      const maxWidth = totalWidth - 4;
      const lines = doc.splitTextToSize(groupName, maxWidth);
      const groupHeight = Math.max(rowHeight + 2, lines.length * rowHeight + 2);
      
      // Рисуем рамку
      doc.rect(currentX, yPos, totalWidth, groupHeight);
      
      // Вертикальное центрирование текста (по центру ячейки)
      const textHeightTotal = lines.length * rowHeight;
      let textY = yPos + (groupHeight - textHeightTotal) / 2 + rowHeight;
      
      // Горизонтальное центрирование для каждой строки
      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        const textWidth = doc.getTextWidth(line);
        const textX = currentX + (totalWidth - textWidth) / 2;
        doc.text(line, textX, textY);
        textY += rowHeight;
      }
      
      return groupHeight;
    }

    // Заголовки таблицы
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, currentY, contentWidth, rowHeight, 'F');
    const headerHeight = drawRow(currentY, columns, true);
    currentY += headerHeight;

    let grandTotal = 0;
    let groupCounter = 0;
    let workCounter = 0;

    for (let i = 0; i < estimateItems.length; i++) {
      const item = estimateItems[i];
      
      if (item.type === 'group') {
        groupCounter++;
        workCounter = 0;
        
        if (currentY + 20 > 280) {
          doc.addPage();
          currentY = 20;
          doc.setFillColor(240, 240, 240);
          doc.rect(startX, currentY, contentWidth, rowHeight, 'F');
          currentY += drawRow(currentY, columns, true);
        }
        
        const groupHeight = drawGroupRow(currentY, item.name);
        currentY += groupHeight;
        continue;
      }
      
      if (item.type === 'work') {
        workCounter++;
        grandTotal += item.total;
        const workNumber = groupCounter > 0 ? `${groupCounter}.${workCounter}` : `${workCounter}`;
        
        const cells = [
          workNumber,
          item.name,
          item.quantity.toString(),
          item.unit,
          item.price.toLocaleString(),
          item.total.toLocaleString()
        ];
        
        if (currentY + 30 > 280) {
          doc.addPage();
          currentY = 20;
          doc.setFillColor(240, 240, 240);
          doc.rect(startX, currentY, contentWidth, rowHeight, 'F');
          currentY += drawRow(currentY, columns, true);
        }
        
        const rowHeightActual = drawRow(currentY, cells);
        currentY += rowHeightActual;
      }
    }

    currentY += 6;
    doc.setFontSize(11);
    doc.text(`ИТОГО: ${grandTotal.toLocaleString()} ₽`, pageWidth - rightMargin - 50, currentY);

    doc.save(`Смета_${Date.now()}.pdf`);
  }
    
    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        const categoryId = categorySelect.value;
        if (categoryId) { 
          loadWorksByCategory(categoryId); 
          if (workSelect) workSelect.disabled = false; 
        } else {
          if (workSelect) { workSelect.disabled = true; workSelect.innerHTML = '<option value="">-- Сначала выберите раздел --</option>'; }
          currentSelectedWork = null;
          if (priceInput) priceInput.disabled = true;
          if (unitSelect) unitSelect.disabled = true;
          if (quantityInput) quantityInput.disabled = true;
          if (addBtn) addBtn.disabled = true;
        }
      });
    }
    
    if (deleteCategoryBtn) {
      deleteCategoryBtn.addEventListener('click', deleteUserCategoryHandler);
    }
    
    if (addBtn) addBtn.addEventListener('click', addWorkToEstimate);
    if (addGroupBtn) addGroupBtn.addEventListener('click', addGroup);
    if (saveBtn) saveBtn.addEventListener('click', saveEstimate);
    if (clearBtn) clearBtn.addEventListener('click', clearEstimate);
    if (pdfBtn) pdfBtn.addEventListener('click', generateEstimatePDF);
    if (addWorkBtn) addWorkBtn.addEventListener('click', addUserDefinedWork);
    if (addCategoryBtn) addCategoryBtn.addEventListener('click', addUserCategoryHandler);
    
    updateGroupSelect();
    loadCategories();
    loadCurrentEstimate();
    if (priceInput) priceInput.disabled = true;
    if (unitSelect) unitSelect.disabled = true;
    if (quantityInput) quantityInput.disabled = true;
    if (addBtn) addBtn.disabled = true;
    populateUnitSelect('м²');
  }
})();