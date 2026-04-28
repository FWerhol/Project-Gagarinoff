// core/storage.js
// Сохранение данных
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Загрузка данных
function loadFromLocalStorage(key, defaultValue = null) {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch(e) {
      return defaultValue;
    }
  }
  return defaultValue;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { saveToLocalStorage, loadFromLocalStorage };
}