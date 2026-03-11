(() => {
  const formResiduo = document.getElementById('formResiduo');
  const residuoMsg = document.getElementById('residuoMsg');
  const residuosListBody = document.getElementById('residuosListBody');
  const btnCancelResiduo = document.getElementById('btnCancelResiduo');

  const formFornecedor = document.getElementById('formFornecedor');
  const fornecedorMsg = document.getElementById('fornecedorMsg');
  const fornecedoresListBody = document.getElementById('fornecedoresListBody');
  const fornecedorMaterialIds = document.getElementById('fornecedorMaterialIds');
  const btnCancelFornecedor = document.getElementById('btnCancelFornecedor');
  const exportSupplierFilter = document.getElementById('exportSupplierFilter');
  const btnExportColetas = document.getElementById('btnExportColetas');

  const formRecolhimento = document.getElementById('formRecolhimento');
  const recolhimentoMsg = document.getElementById('recolhimentoMsg');
  const recolhimentoSupplierId = document.getElementById('recolhimentoSupplierId');
  const recolhimentoDate = document.getElementById('recolhimentoDate');
  const recolhimentoQuantidades = document.getElementById('recolhimentoQuantidades');
  const recolhimentoInputs = document.getElementById('recolhimentoInputs');
  const recolhimentosListBody = document.getElementById('recolhimentosListBody');

  let materialsCache = [];
  let suppliersCache = [];

  function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    if (value == null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  // --- Tabs
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        const isActive = panel.id === `tab-${tab}`;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
      if (tab === 'fornecedores') {
        fillExportSupplierFilter();
        reloadFornecedores();
      }
      if (tab === 'recolhimentos') reloadRecolhimentos();
    });
  });

  // --- Resíduos
  async function loadMaterials() {
    const data = await window.api.materialsList();
    materialsCache = data?.items || [];
    return materialsCache;
  }

  async function reloadResiduos() {
    if (!residuosListBody) return;
    residuosListBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted)">Carregando…</td></tr>';
    try {
      const items = await loadMaterials();
      if (!items.length) {
        residuosListBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted)">Nenhum resíduo cadastrado.</td></tr>';
        return;
      }
      residuosListBody.innerHTML = '';
      items.forEach((item) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(item.name || '')}</td>
          <td>${escapeHtml(item.unit || '-')}</td>
          <td>${formatCurrency(item.base_price)}</td>
          <td class="actions-cell">
            <button type="button" class="btn btn-ghost btn-sm edit-residuo" data-id="${item.id}">Editar</button>
            <button type="button" class="btn btn-ghost btn-sm btn-danger delete-residuo" data-id="${item.id}">Excluir</button>
          </td>
        `;
        residuosListBody.appendChild(tr);
      });
      residuosListBody.querySelectorAll('.edit-residuo').forEach((b) => {
        b.addEventListener('click', () => editResiduo(Number(b.getAttribute('data-id'))));
      });
      residuosListBody.querySelectorAll('.delete-residuo').forEach((b) => {
        b.addEventListener('click', () => deleteResiduo(Number(b.getAttribute('data-id'))));
      });
    } catch (err) {
      console.error(err);
      residuosListBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#fecaca">Erro ao carregar resíduos.</td></tr>';
    }
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function editResiduo(id) {
    const item = materialsCache.find((m) => m.id === id);
    if (!item) return;
    formResiduo.querySelector('[name="id"]').value = id;
    formResiduo.querySelector('[name="name"]').value = item.name || '';
    formResiduo.querySelector('[name="unit"]').value = item.unit || 'kg';
    formResiduo.querySelector('[name="base_price"]').value = item.base_price != null ? item.base_price : '';
    if (btnCancelResiduo) btnCancelResiduo.style.display = 'inline-flex';
  }

  async function deleteResiduo(id) {
    if (!confirm('Excluir este resíduo? Esta ação não pode ser desfeita.')) return;
    try {
      await window.api.materialsDelete(id);
      reloadResiduos();
      if (fornecedorMaterialIds) fillFornecedorMaterialsSelect();
    } catch (err) {
      alert(err.message || 'Erro ao excluir.');
    }
  }

  if (formResiduo) {
    formResiduo.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (residuoMsg) residuoMsg.style.display = 'none';
      const id = formResiduo.querySelector('[name="id"]').value;
      const payload = {
        name: String(formResiduo.querySelector('[name="name"]').value || '').trim(),
        unit: String(formResiduo.querySelector('[name="unit"]').value || '').trim() || 'kg',
        base_price: formResiduo.querySelector('[name="base_price"]').value,
      };
      if (!payload.name) {
        window.ui.setMsg(residuoMsg, 'error', 'Informe o nome do resíduo.');
        return;
      }
      try {
        if (id) {
          await window.api.materialsUpdate(Number(id), payload);
          window.ui.setMsg(residuoMsg, 'success', 'Resíduo atualizado.');
        } else {
          await window.api.materialsCreate(payload);
          window.ui.setMsg(residuoMsg, 'success', 'Resíduo cadastrado.');
        }
        formResiduo.reset();
        formResiduo.querySelector('[name="id"]').value = '';
        formResiduo.querySelector('[name="unit"]').value = 'kg';
        if (btnCancelResiduo) btnCancelResiduo.style.display = 'none';
        reloadResiduos();
      } catch (err) {
        window.ui.setMsg(residuoMsg, 'error', err.message || 'Erro ao salvar.');
      }
    });
  }
  if (btnCancelResiduo) {
    btnCancelResiduo.addEventListener('click', () => {
      formResiduo.reset();
      formResiduo.querySelector('[name="id"]').value = '';
      formResiduo.querySelector('[name="unit"]').value = 'kg';
      btnCancelResiduo.style.display = 'none';
      if (residuoMsg) residuoMsg.style.display = 'none';
    });
  }

  // --- Fornecedores
  async function fillFornecedorMaterialsSelect() {
    if (!fornecedorMaterialIds) return;
    const items = materialsCache.length ? materialsCache : await loadMaterials();
    fornecedorMaterialIds.innerHTML = items.map((m) => `<option value="${m.id}">${escapeHtml(m.name)} (${m.unit || 'kg'})</option>`).join('');
  }

  async function reloadFornecedores() {
    if (!fornecedoresListBody) return;
    fornecedoresListBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted)">Carregando…</td></tr>';
    try {
      const data = await window.api.suppliersList();
      const items = data?.items || [];
      suppliersCache = items;
      if (!items.length) {
        fornecedoresListBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted)">Nenhum fornecedor cadastrado.</td></tr>';
        fillExportSupplierFilter();
        return;
      }
      const materials = materialsCache.length ? materialsCache : await loadMaterials();
      const nameById = Object.fromEntries(materials.map((m) => [m.id, m.name]));
      fornecedoresListBody.innerHTML = '';
      items.forEach((item) => {
        const names = (item.material_ids || []).map((mid) => nameById[mid] || '').filter(Boolean).join(', ') || '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(item.name || '')}</td>
          <td>${escapeHtml(item.document || '-')}</td>
          <td>${escapeHtml(names)}</td>
          <td class="actions-cell">
            <button type="button" class="btn btn-ghost btn-sm edit-fornecedor" data-id="${item.id}">Editar</button>
            <button type="button" class="btn btn-ghost btn-sm btn-danger delete-fornecedor" data-id="${item.id}">Excluir</button>
          </td>
        `;
        fornecedoresListBody.appendChild(tr);
      });
      fornecedoresListBody.querySelectorAll('.edit-fornecedor').forEach((b) => {
        b.addEventListener('click', () => editFornecedor(Number(b.getAttribute('data-id'))));
      });
      fornecedoresListBody.querySelectorAll('.delete-fornecedor').forEach((b) => {
        b.addEventListener('click', () => deleteFornecedor(Number(b.getAttribute('data-id'))));
      });
      fillExportSupplierFilter();
    } catch (err) {
      console.error(err);
      fornecedoresListBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#fecaca">Erro ao carregar fornecedores.</td></tr>';
    }
  }

  function fillExportSupplierFilter() {
    if (!exportSupplierFilter) return;
    const current = exportSupplierFilter.value;
    exportSupplierFilter.innerHTML = '<option value="">Todos os fornecedores</option>' +
      suppliersCache.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    if (current) exportSupplierFilter.value = current;
  }

  function editFornecedor(id) {
    const item = suppliersCache.find((s) => s.id === id);
    if (!item) return;
    formFornecedor.querySelector('[name="id"]').value = id;
    formFornecedor.querySelector('[name="name"]').value = item.name || '';
    formFornecedor.querySelector('[name="document"]').value = item.document || '';
    Array.from(fornecedorMaterialIds.options).forEach((opt) => {
      opt.selected = (item.material_ids || []).includes(Number(opt.value));
    });
    if (btnCancelFornecedor) btnCancelFornecedor.style.display = 'inline-flex';
  }

  async function deleteFornecedor(id) {
    if (!confirm('Excluir este fornecedor? Esta ação não pode ser desfeita.')) return;
    try {
      await window.api.suppliersDelete(id);
      reloadFornecedores();
      fillRecolhimentoSuppliers();
    } catch (err) {
      alert(err.message || 'Erro ao excluir.');
    }
  }

  if (formFornecedor) {
    formFornecedor.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (fornecedorMsg) fornecedorMsg.style.display = 'none';
      const id = formFornecedor.querySelector('[name="id"]').value;
      const materialIds = Array.from(fornecedorMaterialIds.selectedOptions).map((o) => Number(o.value)).filter(Boolean);
      const payload = {
        name: String(formFornecedor.querySelector('[name="name"]').value || '').trim(),
        document: String(formFornecedor.querySelector('[name="document"]').value || '').trim() || undefined,
        material_ids: materialIds,
      };
      if (!payload.name) {
        window.ui.setMsg(fornecedorMsg, 'error', 'Informe o nome do fornecedor.');
        return;
      }
      try {
        if (id) {
          await window.api.suppliersUpdate(Number(id), payload);
          window.ui.setMsg(fornecedorMsg, 'success', 'Fornecedor atualizado.');
        } else {
          await window.api.suppliersCreate(payload);
          window.ui.setMsg(fornecedorMsg, 'success', 'Fornecedor cadastrado.');
        }
        formFornecedor.reset();
        formFornecedor.querySelector('[name="id"]').value = '';
        if (btnCancelFornecedor) btnCancelFornecedor.style.display = 'none';
        Array.from(fornecedorMaterialIds.options).forEach((o) => { o.selected = false; });
        reloadFornecedores();
      } catch (err) {
        window.ui.setMsg(fornecedorMsg, 'error', err.message || 'Erro ao salvar.');
      }
    });
  }
  if (btnCancelFornecedor) {
    btnCancelFornecedor.addEventListener('click', () => {
      formFornecedor.reset();
      formFornecedor.querySelector('[name="id"]').value = '';
      if (fornecedorMsg) fornecedorMsg.style.display = 'none';
      btnCancelFornecedor.style.display = 'none';
      Array.from(fornecedorMaterialIds.options).forEach((o) => { o.selected = false; });
    });
  }

  if (btnExportColetas) {
    btnExportColetas.addEventListener('click', () => {
      const supplierId = exportSupplierFilter.value || '';
      const url = window.api.collectionsExportUrl(supplierId ? { supplier_id: supplierId } : {});
      window.location.href = url;
    });
  }

  // --- Recolhimentos
  async function fillRecolhimentoSuppliers() {
    const data = await window.api.suppliersList();
    const items = data?.items || [];
    suppliersCache = items;
    if (!recolhimentoSupplierId) return;
    const current = recolhimentoSupplierId.value;
    recolhimentoSupplierId.innerHTML = '<option value="">Selecione o fornecedor</option>' +
      items.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    if (current) recolhimentoSupplierId.value = current;
    onRecolhimentoSupplierChange();
  }

  function onRecolhimentoSupplierChange() {
    const sid = recolhimentoSupplierId?.value;
    if (!sid) {
      recolhimentoQuantidades.style.display = 'none';
      recolhimentoInputs.innerHTML = '';
      return;
    }
    const supplier = suppliersCache.find((s) => String(s.id) === sid);
    if (!supplier || !supplier.material_ids || !supplier.material_ids.length) {
      recolhimentoQuantidades.style.display = 'block';
      recolhimentoInputs.innerHTML = '<p class="hint">Este fornecedor não possui tipos de resíduo definidos. Edite-o na aba Fornecedores.</p>';
      return;
    }
    const materials = materialsCache.filter((m) => supplier.material_ids.includes(m.id));
    recolhimentoQuantidades.style.display = 'block';
    recolhimentoInputs.innerHTML = materials.map((m) => `
      <div class="quantidade-row">
        <label>${escapeHtml(m.name)} (${m.unit || 'kg'})</label>
        <input type="number" step="0.001" min="0" name="qty_${m.id}" placeholder="0" data-material-id="${m.id}" />
      </div>
    `).join('');
  }

  if (recolhimentoSupplierId) {
    recolhimentoSupplierId.addEventListener('change', onRecolhimentoSupplierChange);
  }

  async function reloadRecolhimentos() {
    if (!recolhimentosListBody) return;
    recolhimentosListBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted)">Carregando…</td></tr>';
    try {
      const data = await window.api.collectionsList({});
      const items = data?.items || [];
      if (!items.length) {
        recolhimentosListBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted)">Nenhum recolhimento registrado.</td></tr>';
        return;
      }
      recolhimentosListBody.innerHTML = '';
      items.forEach((row) => {
        const parts = (row.items || []).map((i) => `${i.material_name}: ${i.quantity} ${i.unit || 'kg'}`).join('; ');
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatDate(row.collection_date)}</td>
          <td>${escapeHtml(row.supplier_name || '')}</td>
          <td>${escapeHtml(parts || '-')}</td>
        `;
        recolhimentosListBody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      recolhimentosListBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#fecaca">Erro ao carregar recolhimentos.</td></tr>';
    }
  }

  if (formRecolhimento) {
    formRecolhimento.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (recolhimentoMsg) recolhimentoMsg.style.display = 'none';
      const supplierId = recolhimentoSupplierId?.value;
      const collectionDate = recolhimentoDate?.value;
      if (!supplierId || !collectionDate) {
        window.ui.setMsg(recolhimentoMsg, 'error', 'Selecione o fornecedor e a data.');
        return;
      }
      const inputs = recolhimentoInputs.querySelectorAll('input[data-material-id]');
      const items = [];
      inputs.forEach((inp) => {
        const qty = Number(inp.value);
        if (qty > 0) items.push({ material_id: Number(inp.getAttribute('data-material-id')), quantity: qty });
      });
      if (!items.length) {
        window.ui.setMsg(recolhimentoMsg, 'error', 'Informe ao menos uma quantidade.');
        return;
      }
      try {
        await window.api.collectionsCreate({
          supplier_id: Number(supplierId),
          collection_date: collectionDate,
          items,
        });
        window.ui.setMsg(recolhimentoMsg, 'success', 'Recolhimento registrado.');
        formRecolhimento.reset();
        recolhimentoSupplierId.value = '';
        recolhimentoQuantidades.style.display = 'none';
        recolhimentoInputs.innerHTML = '';
        onRecolhimentoSupplierChange();
        reloadRecolhimentos();
      } catch (err) {
        window.ui.setMsg(recolhimentoMsg, 'error', err.message || 'Erro ao registrar.');
      }
    });
  }

  // --- Init
  (async () => {
    await loadMaterials();
    await fillFornecedorMaterialsSelect();
    await fillRecolhimentoSuppliers();
    reloadResiduos();
    reloadFornecedores();
    reloadRecolhimentos();
    if (!recolhimentoDate.value) {
      const today = new Date().toISOString().slice(0, 10);
      recolhimentoDate.value = today;
    }
  })();
})();
