// cabinet/profile.js
(function() {
  const MASTER_PROFILE_KEY = 'master_profile';
  const settingsForm = document.getElementById('master-settings-form');

  function loadMasterProfile() {
    const saved = localStorage.getItem(MASTER_PROFILE_KEY);
    if (saved) {
      const profile = JSON.parse(saved);
      const city = document.getElementById('master-city');
      if (city) city.value = profile.city || '';
      const tax = document.getElementById('master-tax-status');
      if (tax) tax.value = profile.tax_status || 'self_employed';
      const fullname = document.getElementById('master-fullname');
      if (fullname) fullname.value = profile.fullname || '';
      const passSeries = document.getElementById('master-passport-series');
      if (passSeries) passSeries.value = profile.passport_series || '';
      const passNumber = document.getElementById('master-passport-number');
      if (passNumber) passNumber.value = profile.passport_number || '';
      const passIssued = document.getElementById('master-passport-issued-by');
      if (passIssued) passIssued.value = profile.passport_issued_by || '';
      const phone = document.getElementById('master-phone');
      if (phone) phone.value = profile.phone || '';
    }
  }

  function saveMasterProfile(event) {
    event.preventDefault();
    const profile = {
      city: document.getElementById('master-city')?.value || '',
      tax_status: document.getElementById('master-tax-status')?.value || 'self_employed',
      fullname: document.getElementById('master-fullname')?.value || '',
      passport_series: document.getElementById('master-passport-series')?.value || '',
      passport_number: document.getElementById('master-passport-number')?.value || '',
      passport_issued_by: document.getElementById('master-passport-issued-by')?.value || '',
      phone: document.getElementById('master-phone')?.value || ''
    };
    localStorage.setItem(MASTER_PROFILE_KEY, JSON.stringify(profile));
    const msgDiv = document.getElementById('profile-message');
    if (msgDiv) {
      msgDiv.textContent = 'Профиль сохранён';
      msgDiv.classList.remove('hidden');
      setTimeout(() => msgDiv.classList.add('hidden'), 3000);
    }
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', saveMasterProfile);
    loadMasterProfile();
  }
})();