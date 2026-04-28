// cabinet/auth.js
(function() {
  // Проверка авторизации
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = '/';
    return;
  }

  // Кнопка выхода
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/';
    });
  }
})();