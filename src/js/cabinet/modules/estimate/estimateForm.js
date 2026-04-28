// modules/estimate/estimateForm.js
(function() {
  let categorySelect;
  let workSelect;
  let unitSelect;
  let priceInput;
  let quantityInput;
  let previewTotalSpan;
  let addBtn;
  let addGroupBtn;
  let saveBtn;
  let clearBtn;
  let pdfBtn;
  let targetGroupSelect;
  let newWorkName;
  let newWorkUnit;
  let newWorkPrice;
  let newWorkCategory;
  let addWorkBtn;
  let newCategoryName;
  let addCategoryBtn;
  let deleteCategoryBtn;

  let BASE_KNOWLEDGE = null;
  let currentCategoryId = null;
  let currentSelectedWork = null;

  let onAddWorkCallback = null;
  let onClearCallback = null;
  let onSaveCallback = null;
  let onPDFCallback = null;
  let onAddGroupCallback = null;

  function loadUserWorks() {
    const saved = localStorage.getItem('user_works');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
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
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  function saveUserCategories(categories) {
    localStorage.setItem('user_categories', JSON.stringify(categories));
  }

  function getAllCategories() {
    const baseCats = BASE_KNOWLEDGE ? BASE_KNOWLEDGE.categories : [];
    const userCats = loadUserCategories();
    return baseCats.concat(userCats);
  }

  function getAllWorksByCategory(categoryId) {
    const baseWorks = BASE_KNOWLEDGE ? BASE_KNOWLEDGE.works.filter(w => w.categoryId == categoryId) : [];
    const userWorks = loadUserWorks().filter(w => w.categoryId == categoryId);
    return baseWorks.concat(userWorks);
  }

  function isCategoryExists(name, excludeId) {
    const normalized = name.toLowerCase();
    return getAllCategories().some(cat => cat.name.toLowerCase() === normalized && cat.id !== excludeId);
  }

  function addUserCategory(name) {
    if (isCategoryExists(name)) {
      alert(`Раздел "${name}" уже существует!`);
      return null;
    }

    const userCats = loadUserCategories();
    const newCat = { id: 900 + Date.now(), name, isUserDefined: true };
    userCats.push(newCat);
    saveUserCategories(userCats);
    return newCat;
  }

  function deleteUserCategory(categoryId) {
    const userCats = loadUserCategories();
    saveUserCategories(userCats.filter(cat => cat.id !== categoryId));

    const userWorks = loadUserWorks();
    saveUserWorks(userWorks.filter(work => work.categoryId !== categoryId));
  }

  function addUserWork(name, unit, price, categoryId) {
    const userWorks = loadUserWorks();
    const newWork = {
      id: 'user_' + Date.now(),
      name,
      unit,
      price: parseFloat(price),
      categoryId,
      isUserDefined: true
    };
    userWorks.push(newWork);
    saveUserWorks(userWorks);
  }

  function setCallbacks(callbacks) {
    if (callbacks.onAddWork) onAddWorkCallback = callbacks.onAddWork;
    if (callbacks.onClear) onClearCallback = callbacks.onClear;
    if (callbacks.onSave) onSaveCallback = callbacks.onSave;
    if (callbacks.onPDF) onPDFCallback = callbacks.onPDF;
    if (callbacks.onAddGroup) onAddGroupCallback = callbacks.onAddGroup;
  }

  function setBaseKnowledge(knowledge) {
    BASE_KNOWLEDGE = knowledge;
    if (categorySelect && BASE_KNOWLEDGE) loadCategories();
  }

  function populateUnitSelect(selectedUnit) {
    if (!unitSelect) return;
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

  function updatePreviewTotal(price, quantity) {
    const priceValue = typeof price === 'number' ? price : parseFloat(priceInput?.value) || 0;
    const quantityValue = typeof quantity === 'number' ? quantity : parseFloat(quantityInput?.value) || 0;
    const total = quantityValue * priceValue;
    if (previewTotalSpan) previewTotalSpan.textContent = `${total.toLocaleString()} ₽`;
  }

  function setGroupOptions(groups) {
    if (!targetGroupSelect) return;
    const previousValue = targetGroupSelect.value;
    targetGroupSelect.innerHTML = '<option value="none">-- Без группы (в конец) --</option>';
    groups.forEach((groupName, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = groupName;
      targetGroupSelect.appendChild(option);
    });

    if (previousValue !== 'none') {
      const idx = parseInt(previousValue, 10);
      if (!isNaN(idx) && idx >= 0 && idx < groups.length) {
        targetGroupSelect.value = previousValue;
      }
    }
  }

  function setSelectedGroupIndex(index) {
    if (!targetGroupSelect) return;
    targetGroupSelect.value = String(index);
  }

  function loadCategories() {
    if (!categorySelect) return;
    const allCategories = getAllCategories();

    categorySelect.innerHTML = '<option value="">-- Выберите раздел --</option>';
    allCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name + (cat.isUserDefined ? ' (моя)' : '');
      categorySelect.appendChild(option);
    });

    if (newWorkCategory) {
      newWorkCategory.innerHTML = '<option value="">-- Выберите раздел --</option>';
      allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name + (cat.isUserDefined ? ' (моя)' : '');
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
      option.textContent = `${work.name} (${work.price.toLocaleString()} ₽/${work.unit})${work.isUserDefined ? ' (моя)' : ''}`;
      option.dataset.price = work.price;
      option.dataset.unit = work.unit;
      option.dataset.name = work.name;
      workSelect.appendChild(option);
    });

    currentSelectedWork = null;
  }

  function onCategoryChange() {
    const categoryId = categorySelect.value;
    if (categoryId) {
      loadWorksByCategory(categoryId);
      if (workSelect) workSelect.disabled = false;
      return;
    }

    if (workSelect) {
      workSelect.disabled = true;
      workSelect.innerHTML = '<option value="">-- Сначала выберите раздел --</option>';
    }
    currentSelectedWork = null;
    if (priceInput) priceInput.disabled = true;
    if (unitSelect) unitSelect.disabled = true;
    if (quantityInput) quantityInput.disabled = true;
    if (addBtn) addBtn.disabled = true;
    if (previewTotalSpan) previewTotalSpan.textContent = '0 ₽';
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
      populateUnitSelect(currentSelectedWork.unit);
      if (unitSelect) unitSelect.disabled = false;
      if (quantityInput) quantityInput.disabled = false;
      if (addBtn) addBtn.disabled = false;
      updatePreviewTotal();
      return;
    }

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

    const newWork = {
      type: 'work',
      id: Date.now() + Math.random(),
      name: currentSelectedWork.name,
      quantity,
      unit: unitSelect ? unitSelect.value : currentSelectedWork.unit,
      price,
      total: quantity * price
    };

    const targetGroupValue = targetGroupSelect ? targetGroupSelect.value : 'none';
    if (onAddWorkCallback) onAddWorkCallback(newWork, targetGroupValue);

    if (priceInput) {
      priceInput.value = '';
      priceInput.disabled = true;
    }
    if (unitSelect) unitSelect.disabled = true;
    if (quantityInput) quantityInput.value = 1;
    if (previewTotalSpan) previewTotalSpan.textContent = '0 ₽';

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
      populateUnitSelect(currentSelectedWork.unit);
      if (unitSelect) unitSelect.disabled = false;
      if (quantityInput) quantityInput.disabled = false;
      if (addBtn) addBtn.disabled = false;
      updatePreviewTotal();
    }
  }

  function addGroup() {
    const groupName = prompt('Введите название группы работ:', 'Новая группа');
    if (!groupName || groupName.trim() === '') return;
    if (onAddGroupCallback) onAddGroupCallback(groupName.trim());
  }

  function addUserCategoryHandler() {
    const name = newCategoryName?.value.trim();
    if (!name) {
      alert('Введите название раздела');
      return;
    }

    const newCategory = addUserCategory(name);
    if (newCategory) {
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

    const categoryId = parseInt(selectedOption.value, 10);
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
        onCategoryChange();
      }
      alert(`Раздел "${categoryName}" удалён`);
    }
  }

  function addUserDefinedWork() {
    const name = newWorkName?.value.trim();
    const unit = newWorkUnit?.value;
    const price = parseFloat(newWorkPrice?.value);
    const categoryId = newWorkCategory?.value;

    if (!name) {
      alert('Введите название работы');
      return;
    }
    if (!categoryId) {
      alert('Выберите раздел для работы');
      return;
    }
    if (isNaN(price) || price <= 0) {
      alert('Введите корректную цену');
      return;
    }

    addUserWork(name, unit, price, parseInt(categoryId, 10));
    if (newWorkName) newWorkName.value = '';
    if (newWorkPrice) newWorkPrice.value = '';

    if (currentCategoryId && currentCategoryId == categoryId) {
      loadWorksByCategory(currentCategoryId);
    }
    alert('Работа добавлена в вашу базу');
  }

  function clearEstimate() {
    if (onClearCallback) onClearCallback();
  }

  function saveEstimate() {
    if (onSaveCallback) onSaveCallback();
  }

  function generatePDF() {
    if (onPDFCallback) onPDFCallback();
  }

  function init() {
    categorySelect = document.getElementById('estimate-category-select');
    workSelect = document.getElementById('estimate-work-select');
    unitSelect = document.getElementById('estimate-unit-select');
    priceInput = document.getElementById('estimate-price-input');
    quantityInput = document.getElementById('estimate-quantity');
    previewTotalSpan = document.getElementById('estimate-preview-total');
    addBtn = document.getElementById('estimate-add-btn');
    addGroupBtn = document.getElementById('estimate-add-group-btn');
    saveBtn = document.getElementById('estimate-save-btn');
    clearBtn = document.getElementById('estimate-clear-btn');
    pdfBtn = document.getElementById('estimate-pdf-btn');
    targetGroupSelect = document.getElementById('estimate-target-group-select');
    newWorkName = document.getElementById('estimate-new-work-name');
    newWorkUnit = document.getElementById('estimate-new-work-unit');
    newWorkPrice = document.getElementById('estimate-new-work-price');
    newWorkCategory = document.getElementById('estimate-new-work-category');
    addWorkBtn = document.getElementById('estimate-add-work-btn');
    newCategoryName = document.getElementById('estimate-new-category-name');
    addCategoryBtn = document.getElementById('estimate-add-category-btn');
    deleteCategoryBtn = document.getElementById('estimate-delete-category-btn');

    if (!categorySelect) {
      console.warn('EstimateForm: элементы формы не найдены');
      return;
    }

    if (BASE_KNOWLEDGE) loadCategories();

    categorySelect.addEventListener('change', onCategoryChange);
    if (workSelect) workSelect.addEventListener('change', onWorkSelect);
    if (priceInput) priceInput.addEventListener('input', () => updatePreviewTotal());
    if (quantityInput) quantityInput.addEventListener('input', () => updatePreviewTotal());
    if (addBtn) addBtn.addEventListener('click', addWorkToEstimate);
    if (addGroupBtn) addGroupBtn.addEventListener('click', addGroup);
    if (saveBtn) saveBtn.addEventListener('click', saveEstimate);
    if (clearBtn) clearBtn.addEventListener('click', clearEstimate);
    if (pdfBtn) pdfBtn.addEventListener('click', generatePDF);
    if (addWorkBtn) addWorkBtn.addEventListener('click', addUserDefinedWork);
    if (addCategoryBtn) addCategoryBtn.addEventListener('click', addUserCategoryHandler);
    if (deleteCategoryBtn) deleteCategoryBtn.addEventListener('click', deleteUserCategoryHandler);

    if (priceInput) priceInput.disabled = true;
    if (unitSelect) unitSelect.disabled = true;
    if (quantityInput) quantityInput.disabled = true;
    if (addBtn) addBtn.disabled = true;
    populateUnitSelect('м²');
  }

  window.EstimateForm = {
    init,
    setBaseKnowledge,
    setCallbacks,
    loadCategories,
    loadWorksByCategory,
    updatePreviewTotal,
    setGroupOptions,
    setSelectedGroupIndex
  };
})();