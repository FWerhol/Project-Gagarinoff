// core/constants.js
const UNITS = ['м²', 'м.п.', 'шт', 'м³', 'компл', 'мешок', 'уп'];
const CURRENCY = '₽';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UNITS, CURRENCY };
}