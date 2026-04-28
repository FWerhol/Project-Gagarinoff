// core/utils.js
// Экранирование HTML
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Форматирование даты
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

// Дебаунс (чтобы не вызывать функцию слишком часто)
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Экспортируем (для использования в других модулях)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeHtml, formatDate, debounce };
}