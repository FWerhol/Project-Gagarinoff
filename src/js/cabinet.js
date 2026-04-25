// cabinet.js
(function() {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = '/';
  }
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/';
    });
  }
})();

script(src="/js/cabinet/auth.js")
script(src="/js/cabinet/tabs.js")
script(src="/js/cabinet/profile.js")
script(src="/js/cabinet/contract.js")
script(src="/js/cabinet/estimate.js")
script(src="/js/cabinet/acts.js")
script(src="/js/cabinet/materials.js")
script(src="/js/cabinet/scheme.js")