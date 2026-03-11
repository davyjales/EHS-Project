(() => {
  const monthSelect = document.getElementById('filterMonth');
  const yearSelect = document.getElementById('filterYear');
  const kpiTotalRevenue = document.getElementById('kpiTotalRevenue');
  const kpiTotalRevenueExtra = document.getElementById('kpiTotalRevenueExtra');
  const kpiClientsWithSales = document.getElementById('kpiClientsWithSales');
  const kpiTotalClients = document.getElementById('kpiTotalClients');
  const kpiTotalMaterials = document.getElementById('kpiTotalMaterials');
  const chartPeriodLabel = document.getElementById('chartPeriodLabel');
  const tableBody = document.getElementById('clientsTableBody');
  const yearChartLabel = document.getElementById('yearChartLabel');
  const btnExport = document.getElementById('btnExportExcel');

  if (!monthSelect || !yearSelect || !tableBody) return;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const monthNames = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function fillFilters() {
    monthSelect.innerHTML = '';
    yearSelect.innerHTML = '';

    monthNames.forEach((name, index) => {
      const m = index + 1;
      const opt = document.createElement('option');
      opt.value = String(m);
      opt.textContent = `${String(m).padStart(2, '0')} - ${name}`;
      if (m === currentMonth) opt.selected = true;
      monthSelect.appendChild(opt);
    });

    const startYear = currentYear - 3;
    const endYear = currentYear + 1;
    for (let y = startYear; y <= endYear; y++) {
      const opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      if (y === currentYear) opt.selected = true;
      yearSelect.appendChild(opt);
    }
  }

  let chart;
  let yearChart;

  async function loadDashboard() {
    const year = Number(yearSelect.value || currentYear);
    const month = Number(monthSelect.value || currentMonth);

    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;color:var(--muted)">Carregando dados…</td>
      </tr>
    `;

    try {
      const data = await window.api.dashboardSummary({ year, month });
      const labels = data?.chart?.labels || [];
      const values = data?.chart?.values || [];
      const kpis = data?.kpis || {};
      const yearly = data?.yearlyChart || {};

      // KPIs
      if (kpiTotalRevenue) {
        kpiTotalRevenue.textContent = formatCurrency(kpis.totalRevenue || 0);
      }
      if (kpiClientsWithSales) {
        kpiClientsWithSales.textContent = String(kpis.clientsWithSales || 0);
      }
      if (kpiTotalClients) {
        kpiTotalClients.textContent = String(kpis.totalClients || 0);
      }
      if (kpiTotalMaterials) {
        kpiTotalMaterials.textContent = String(kpis.totalMaterials || 0);
      }
      if (kpiTotalRevenueExtra) {
        const perc =
          kpis.totalClients && kpis.totalClients > 0
            ? ((kpis.clientsWithSales || 0) / kpis.totalClients) * 100
            : 0;
        kpiTotalRevenueExtra.textContent =
          kpis.totalClients > 0
            ? `${(perc || 0).toFixed(0)}% dos clientes ativos com compras`
            : 'Nenhum cliente cadastrado ainda';
      }

      const monthName = monthNames[month - 1] || '';
      if (chartPeriodLabel) {
        chartPeriodLabel.textContent = `${monthName} / ${year}`;
      }

      // Gráfico mensal por cliente (horizontal)
      const ctx = document.getElementById('clientsChart');
      if (ctx && window.Chart) {
        if (chart) chart.destroy();
        chart = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Valor vendido (R$)',
                data: values,
                backgroundColor: 'rgba(34,197,94,0.7)',
                borderRadius: 6,
                maxBarThickness: 46,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: {
                ticks: {
                  color: 'rgba(148,163,184,0.9)',
                  callback: (val) => formatCurrency(val),
                },
                grid: { color: 'rgba(148,163,184,0.18)' },
              },
              y: {
                ticks: { color: 'rgba(148,163,184,0.9)' },
                grid: { display: false },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}`,
                },
              },
            },
          },
        });
      }

      // Gráfico anual: meses nas colunas (eixo X, Jan–Dez), valores nas linhas (eixo Y)
      const yearCtx = document.getElementById('yearChart');
      if (yearCtx && window.Chart) {
        if (yearChart) yearChart.destroy();
        const yearLabels = yearly.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const yearValues = yearly.values || [];
        if (yearChartLabel) {
          yearChartLabel.textContent = `Ano ${year}`;
        }
        yearChart = new window.Chart(yearCtx, {
          type: 'bar',
          data: {
            labels: yearLabels,
            datasets: [
              {
                label: 'Total vendido (R$)',
                data: yearValues,
                backgroundColor: 'rgba(52,211,153,0.7)',
                borderRadius: 6,
                maxBarThickness: 36,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: 'rgba(148,163,184,0.9)' },
                grid: { display: false },
              },
              y: {
                ticks: {
                  color: 'rgba(148,163,184,0.9)',
                  callback: (val) => formatCurrency(val),
                },
                grid: { color: 'rgba(148,163,184,0.18)' },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}`,
                },
              },
            },
          },
        });
      }

      // Tabela
      const rows = data?.table || [];
      if (!rows.length) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="3" style="text-align:center;color:var(--muted)">Nenhuma venda registrada para este período.</td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = '';
        rows.forEach((row) => {
          const tr = document.createElement('tr');
          const tdRank = document.createElement('td');
          tdRank.textContent = String(row.rank || '');
          const tdName = document.createElement('td');
          tdName.textContent = row.clientName || '';
          const tdTotal = document.createElement('td');
          tdTotal.textContent = formatCurrency(row.totalValue || 0);
          tr.appendChild(tdRank);
          tr.appendChild(tdName);
          tr.appendChild(tdTotal);
          tableBody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard', err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center;color:#fecaca">
            Erro ao carregar dados do dashboard. Verifique a API.
          </td>
        </tr>
      `;
    }
  }

  function initExport() {
    if (!btnExport) return;
    btnExport.addEventListener('click', () => {
      const year = Number(yearSelect.value || currentYear);
      const month = Number(monthSelect.value || currentMonth);
      const q = new URLSearchParams({ year: String(year), month: String(month) }).toString();
      window.location.href = `/api/dashboard/export?${q}`;
    });
  }

  fillFilters();
  monthSelect.addEventListener('change', loadDashboard);
  yearSelect.addEventListener('change', loadDashboard);
  initExport();
  loadDashboard();
})();

