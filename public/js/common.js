(() => {
  async function request(path, { method = 'GET', body } = {}) {
    const res = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

    if (!res.ok) {
      const message = typeof data === 'object' && data && data.error ? data.error : `HTTP ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function initTheme() {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        document.body.setAttribute('data-theme', stored);
      }
    } catch {}

    const current = document.body.getAttribute('data-theme') || 'dark';
    document.body.setAttribute('data-theme', current);

    const btn = document.getElementById('themeToggle');
    if (btn) {
      const syncLabel = () => {
        const mode = document.body.getAttribute('data-theme') || 'dark';
        // Sol para trocar para tema claro, lua para tema escuro
        btn.textContent = mode === 'light' ? '🌙' : '☀';
      };
      syncLabel();
      btn.addEventListener('click', () => {
        const prev = document.body.getAttribute('data-theme') || 'dark';
        const next = prev === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', next);
        try {
          localStorage.setItem('theme', next);
        } catch {}
        syncLabel();
      });
    }
  }

  function setMsg(el, type, text) {
    el.className = type === 'error' ? 'error' : 'success';
    el.textContent = text;
    el.style.display = 'block';
  }

  window.api = {
    health: () => request('/api/health'),
    signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload }),
    login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
    dashboardSummary: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      const path = q ? `/api/dashboard/summary?${q}` : '/api/dashboard/summary';
      return request(path);
    },
    clientsList: () => request('/api/clients'),
    clientsCreate: (payload) => request('/api/clients', { method: 'POST', body: payload }),
    materialsList: () => request('/api/materials'),
    materialsCreate: (payload) => request('/api/materials', { method: 'POST', body: payload }),
    materialsUpdate: (id, payload) => request(`/api/materials/${id}`, { method: 'PUT', body: payload }),
    materialsDelete: (id) => request(`/api/materials/${id}`, { method: 'DELETE' }),
    suppliersList: () => request('/api/suppliers'),
    suppliersCreate: (payload) => request('/api/suppliers', { method: 'POST', body: payload }),
    suppliersUpdate: (id, payload) => request(`/api/suppliers/${id}`, { method: 'PUT', body: payload }),
    suppliersDelete: (id) => request(`/api/suppliers/${id}`, { method: 'DELETE' }),
    collectionsList: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      const path = q ? `/api/collections?${q}` : '/api/collections';
      return request(path);
    },
    collectionsCreate: (payload) => request('/api/collections', { method: 'POST', body: payload }),
    collectionsExportUrl: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return q ? `/api/collections/export?${q}` : '/api/collections/export';
    },
  };

  window.ui = { setMsg, initTheme };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
