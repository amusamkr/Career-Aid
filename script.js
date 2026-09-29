const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const message = document.getElementById('message');

// At least 8 characters, with at least one uppercase letter,
// one lowercase letter, one digit, and one special character
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function clearMessage() {
  message.textContent = '';
}

function setSubmitting(form, isSubmitting) {
  const btn = form.querySelector('button[type="submit"]');
  if (btn) btn.disabled = isSubmitting;
}

function showForm(formToShow) {
  [loginForm, registerForm, forgotForm].forEach(f => f.classList.add('hidden'));
  formToShow.classList.remove('hidden');
  clearMessage();
}

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  showForm(loginForm);
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  showForm(registerForm);
});

forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginTab.classList.remove('active');
  registerTab.classList.remove('active');
  showForm(forgotForm);
});

backToLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginTab.classList.add('active');
  showForm(loginForm);
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    message.textContent = 'Please fill in both fields.';
    return;
  }

  setSubmitting(loginForm, true);
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      message.textContent = data.error || 'Login failed. Please try again.';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
  } finally {
    setSubmitting(loginForm, false);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fullName = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const gender = document.getElementById('registerGender').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  if (password !== confirmPassword) {
    message.textContent = 'Passwords do not match.';
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, gender }),
    });
    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.error;
      return;
    }

    message.textContent = 'Registered! Please log in.';
    loginTab.click();
  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
  }
});

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage();
  const email = document.getElementById('forgotEmail').value.trim();

  if (!email) {
    message.textContent = 'Please enter your email.';
    return;
  }

  setSubmitting(forgotForm, true);
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));

    // Same message whether or not the email exists, to avoid
    // leaking which emails are registered.
    message.textContent = data.message || 'If that email exists, a reset link has been sent.';
  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
  } finally {
    setSubmitting(forgotForm, false);
  }
});