const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const message = document.getElementById('message');

if (!token) {
  message.textContent = 'No reset token found in the link. Please request a new one.';
  document.getElementById('resetForm').style.display = 'none';
}

document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    message.textContent = 'Passwords do not match.';
    return;
  }

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.error;
      return;
    }

    message.textContent = data.message + ' Redirecting to login...';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
  }
});