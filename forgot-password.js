document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const message = document.getElementById('message');

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.error;
      return;
    }

    message.textContent = data.message;

    if (data.resetLink) {
      const box = document.getElementById('resetLinkBox');
      const linkInput = document.getElementById('resetLinkText');
      box.classList.remove('hidden');
      linkInput.value = data.resetLink;

      document.getElementById('copyLinkBtn').onclick = () => {
        linkInput.select();
        navigator.clipboard.writeText(data.resetLink);
        message.textContent = 'Link copied to clipboard.';
      };

      document.getElementById('goToLinkBtn').onclick = () => {
        window.location.href = data.resetLink;
      };
    }
  } catch (err) {
    message.textContent = 'Something went wrong. Try again.';
  }
});