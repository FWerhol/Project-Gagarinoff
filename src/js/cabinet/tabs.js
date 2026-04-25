// cabinet/tabs.js
(function() {
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = {
    estimate: document.getElementById('estimate-tab'),
    contract: document.getElementById('contract-tab'),
    acts: document.getElementById('acts-tab'),
    materials: document.getElementById('materials-tab'),
    scheme: document.getElementById('scheme-tab'),
    settings: document.getElementById('settings-tab')
  };

  function activateTab(tabId) {
    Object.values(tabContents).forEach(content => {
      if (content) content.classList.add('hidden');
    });
    if (tabContents[tabId]) {
      tabContents[tabId].classList.remove('hidden');
    }
    tabs.forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      if (isActive) {
        btn.classList.add('active');
        btn.setAttribute('data-active', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('data-active', 'false');
      }
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (tabId && tabContents[tabId]) {
        activateTab(tabId);
      }
    });
  });

  // Активируем первый таб по умолчанию
  activateTab('estimate');
})();