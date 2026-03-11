(() => {
  const form = document.getElementById('form');
  const msg = document.getElementById('msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.style.display = 'none';

    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      password: String(fd.get('password') || ''),
    };

    try {
      await window.api.signup(payload);
      window.ui.setMsg(msg, 'success', 'Conta criada! Redirecionando para o login…');
      setTimeout(() => (window.location.href = '/login'), 650);
    } catch (err) {
      window.ui.setMsg(msg, 'error', err.message || 'Erro ao cadastrar');
    }
  });
})();

