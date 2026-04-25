// login.js
(function() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const login = document.getElementById('login').value;
    const passwordElement = document.getElementById('password');
    if (!passwordElement) return;
    const password = passwordElement.value;
    if (login === 'demo' && password === 'demo123') {
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = '/cabinet';
    } else {
      const errorDiv = document.getElementById('error-msg');
      if (errorDiv) errorDiv.classList.remove('hidden');
    }
  });
})();