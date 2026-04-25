document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('login-modal');
  const openBtn = document.getElementById('open-login-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const form = document.getElementById('modal-login-form');
  const errorMsg = document.getElementById('modal-error-msg');

  if (!modal) return;

  function openModal() {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    if (errorMsg) errorMsg.classList.add('hidden');
    const loginInput = document.getElementById('modal-login');
    const passInput = document.getElementById('modal-password');
    if (loginInput) loginInput.value = '';
    if (passInput) passInput.value = '';
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const login = document.getElementById('modal-login').value;
      const password = document.getElementById('modal-password').value;
      if (login === 'demo' && password === 'demo123') {
        localStorage.setItem('isLoggedIn', 'true');
        console.log('Успешный вход, редирект в /cabinet.html');
        window.location.href = '/cabinet.html';
      } else {
        if (errorMsg) errorMsg.classList.remove('hidden');
      }
    });
  }
});