// modules/estimate/estimateStorage.js
(function() {
  const STORAGE_KEY_CURRENT = 'current_estimate';
  const STORAGE_KEY_ALL = 'all_estimates';

  function saveCurrentEstimate(estimateItems) {
    if (!estimateItems || estimateItems.length === 0) return null;

    const estimateData = {
      id: 'estimate_' + Date.now(),
      date: new Date().toISOString(),
      items: estimateItems,
      total: estimateItems.reduce((sum, item) => sum + (item.total || 0), 0)
    };

    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(estimateData));

    let allEstimates = JSON.parse(localStorage.getItem(STORAGE_KEY_ALL) || '[]');
    allEstimates.unshift(estimateData);
    if (allEstimates.length > 50) allEstimates = allEstimates.slice(0, 50);
    localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(allEstimates));

    return estimateData;
  }

  function loadCurrentEstimate() {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (!saved) return [];

    try {
      const data = JSON.parse(saved);
      if (data.items && data.items.length) return data.items;
    } catch (e) {
      return [];
    }
    return [];
  }

  function clearCurrentEstimate() {
    localStorage.removeItem(STORAGE_KEY_CURRENT);
  }

  function getAllEstimates() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_ALL) || '[]');
    } catch (e) {
      return [];
    }
  }

  window.EstimateStorage = {
    saveCurrentEstimate,
    loadCurrentEstimate,
    clearCurrentEstimate,
    getAllEstimates
  };
})();