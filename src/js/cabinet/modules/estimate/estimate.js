// modules/estimate/estimate.js
(function() {
  let BASE_KNOWLEDGE = null;
  let estimateItems = [];
  let currentCategoryId = null;
  let currentSelectedWork = null;
  let initialized = false;

  function areDependenciesReady() {
    return Boolean(
      window.BASE_KNOWLEDGE &&
      window.EstimateForm &&
      window.EstimateUI &&
      window.EstimateStorage &&
      window.EstimatePDF
    );
  }

  function updateGroupOptions() {
    const groups = estimateItems
      .filter(item => item.type === 'group')
      .map(item => item.name);
    if (window.EstimateForm && window.EstimateForm.setGroupOptions) {
      window.EstimateForm.setGroupOptions(groups);
    }
  }

  function render() {
    window.EstimateUI.renderEstimateTable(estimateItems);
    updateGroupOptions();
  }

  function addGroup(groupName) {
    estimateItems.push({
      type: 'group',
      name: groupName,
      items: []
    });

    render();

    const groupsCount = estimateItems.filter(item => item.type === 'group').length;
    if (window.EstimateForm.setSelectedGroupIndex) {
      window.EstimateForm.setSelectedGroupIndex(groupsCount - 1);
    }
  }

  function addWork(newWork, targetGroupValue) {
    let targetIndex = estimateItems.length;
    if (targetGroupValue !== 'none') {
      const groups = estimateItems.filter(item => item.type === 'group');
      const selectedGroup = groups[parseInt(targetGroupValue, 10)];
      if (selectedGroup) {
        targetIndex = estimateItems.indexOf(selectedGroup) + 1;
      }
    }
    estimateItems.splice(targetIndex, 0, newWork);
    render();
  }

  function updateItem(action, index, value) {
    if (action === 'remove') {
      estimateItems.splice(index, 1);
      render();
      return;
    }

    if (action === 'removeGroup') {
      const groupItem = estimateItems[index];
      if (!groupItem || groupItem.type !== 'group') return;

      // Удаляем саму группу и все работы до следующей группы.
      let deleteCount = 1;
      for (let i = index + 1; i < estimateItems.length; i++) {
        if (estimateItems[i].type === 'group') break;
        deleteCount++;
      }

      estimateItems.splice(index, deleteCount);
      render();
      return;
    }

    if (action === 'price') {
      const item = estimateItems[index];
      if (!item || item.type !== 'work') return;
      item.price = value;
      item.total = item.quantity * value;
      render();
    }
  }

  function clearAll() {
    if (estimateItems.length === 0) return;
    if (confirm('Очистить все позиции и группы сметы?')) {
      estimateItems = [];
      currentCategoryId = null;
      currentSelectedWork = null;
      render();
    }
  }

  function saveEstimate() {
    if (estimateItems.length === 0) {
      alert('Нечего сохранять. Добавьте работы.');
      return;
    }
    window.EstimateStorage.saveCurrentEstimate(estimateItems);
    alert('Смета сохранена!');
  }

  function generatePDF() {
    window.EstimatePDF.generateEstimatePDF(estimateItems);
  }

  function loadEstimate() {
    estimateItems = window.EstimateStorage.loadCurrentEstimate() || [];
    render();
  }

  function init() {
    if (initialized) return;
    if (!areDependenciesReady()) return;

    BASE_KNOWLEDGE = window.BASE_KNOWLEDGE;
    if (!BASE_KNOWLEDGE) {
      console.error('База знаний не загружена');
      return;
    }

    window.EstimateForm.setBaseKnowledge(BASE_KNOWLEDGE);
    window.EstimateForm.setCallbacks({
      onAddWork: addWork,
      onClear: clearAll,
      onSave: saveEstimate,
      onPDF: generatePDF,
      onAddGroup: addGroup
    });

    window.EstimateUI.setCallbacks({
      onPriceChange: updateItem
    });

    window.EstimateForm.init();
    loadEstimate();
    initialized = true;
  }

  if (!areDependenciesReady()) {
    const checkInterval = setInterval(() => {
      if (areDependenciesReady()) {
        clearInterval(checkInterval);
        init();
      }
    }, 100);
    setTimeout(() => clearInterval(checkInterval), 5000);
  } else {
    init();
  }

  window.EstimateModule = {
    init
  };
})();