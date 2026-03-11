(() => {
  const form = document.getElementById('form');
  const msg = document.getElementById('msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.style.display = 'none';

    const fd = new FormData(form);
    const payload = {
      email: String(fd.get('email') || '').trim(),
      password: String(fd.get('password') || ''),
    };

    try {
      const data = await window.api.login(payload);
      window.ui.setMsg(msg, 'success', `Bem-vindo(a), ${data.user?.name || 'usuário'}!`);
      setTimeout(() => (window.location.href = '/'), 650);
    } catch (err) {
      window.ui.setMsg(msg, 'error', err.message || 'Erro ao logar');
    }
  });
})();

