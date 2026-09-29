const loginForm = document.getElementById('adminLoginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.error;
      return;
    }

    if (data.user.role !== 'admin') {
      message.textContent = 'This account does not have admin access.';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'admin.html';
  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
  }
});