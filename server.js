require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');
const { dbConfig } = require('./config/database');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDb() {
  // Users (admins EHS)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clientes que compram materiais recicláveis
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(190) NOT NULL,
      document VARCHAR(32),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Materiais recicláveis
  await pool.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(190) NOT NULL,
      unit VARCHAR(32) NOT NULL DEFAULT 'kg',
      base_price DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Relação de quais materiais cada cliente recebe e preços específicos
  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_materials (
      client_id INT NOT NULL,
      material_id INT NOT NULL,
      custom_price DECIMAL(10,2),
      PRIMARY KEY (client_id, material_id),
      CONSTRAINT fk_client_materials_client
        FOREIGN KEY (client_id) REFERENCES clients(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_client_materials_material
        FOREIGN KEY (material_id) REFERENCES materials(id)
        ON DELETE CASCADE
    )
  `);

  // Lançamentos de vendas mensais
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT NOT NULL,
      material_id INT NOT NULL,
      quantity DECIMAL(10,3) NOT NULL,
      total_value DECIMAL(12,2) NOT NULL,
      sale_date DATE NOT NULL,
      CONSTRAINT fk_sales_client
        FOREIGN KEY (client_id) REFERENCES clients(id)
        ON DELETE RESTRICT,
      CONSTRAINT fk_sales_material
        FOREIGN KEY (material_id) REFERENCES materials(id)
        ON DELETE RESTRICT
    )
  `);

  // Fornecedores (coletam resíduos)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(190) NOT NULL,
      document VARCHAR(32),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Quais tipos de resíduo cada fornecedor recolhe (N:N)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS supplier_materials (
      supplier_id INT NOT NULL,
      material_id INT NOT NULL,
      PRIMARY KEY (supplier_id, material_id),
      CONSTRAINT fk_supplier_materials_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_supplier_materials_material
        FOREIGN KEY (material_id) REFERENCES materials(id)
        ON DELETE CASCADE
    )
  `);

  // Recolhimentos (uma data, um fornecedor)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS collections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      supplier_id INT NOT NULL,
      collection_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_collections_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        ON DELETE RESTRICT
    )
  `);

  // Itens do recolhimento: quantidade por tipo de resíduo
  await pool.query(`
    CREATE TABLE IF NOT EXISTS collection_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      collection_id INT NOT NULL,
      material_id INT NOT NULL,
      quantity DECIMAL(12,3) NOT NULL,
      CONSTRAINT fk_collection_items_collection
        FOREIGN KEY (collection_id) REFERENCES collections(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_collection_items_material
        FOREIGN KEY (material_id) REFERENCES materials(id)
        ON DELETE RESTRICT
    )
  `);
}

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email e password são obrigatórios' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [String(name), String(email).toLowerCase(), password_hash]
    );

    return res.json({ ok: true });
  } catch (e) {
    if (String(e?.code) === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    return res.status(500).json({ error: 'Erro ao cadastrar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' });
    }

    const [rows] = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1', [
      String(email).toLowerCase(),
    ]);
    const user = rows && rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    // Simples para dev: sem JWT/session ainda.
    return res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao logar' });
  }
});

// Dashboard público - resumo mensal por cliente
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;

    const [clientsCountRow] = await pool.query('SELECT COUNT(*) AS total FROM clients');
    const [materialsCountRow] = await pool.query('SELECT COUNT(*) AS total FROM materials');

    const [salesRows] = await pool.query(
      `
      SELECT
        c.id AS client_id,
        c.name AS client_name,
        SUM(s.total_value) AS total_value
      FROM sales s
      INNER JOIN clients c ON c.id = s.client_id
      WHERE YEAR(s.sale_date) = ? AND MONTH(s.sale_date) = ?
      GROUP BY c.id, c.name
      ORDER BY total_value DESC, client_name ASC
    `,
      [year, month]
    );

    const totalRevenue = salesRows.reduce((acc, row) => acc + Number(row.total_value || 0), 0);

    // Totais por mês no ano selecionado
    const [yearRows] = await pool.query(
      `
      SELECT
        MONTH(s.sale_date) AS month,
        SUM(s.total_value) AS total_value
      FROM sales s
      WHERE YEAR(s.sale_date) = ?
      GROUP BY MONTH(s.sale_date)
      ORDER BY MONTH(s.sale_date)
    `,
      [year]
    );

    const monthlyTotals = Array.from({ length: 12 }, () => 0);
    for (const r of yearRows) {
      const m = Number(r.month || 0);
      if (m >= 1 && m <= 12) {
        monthlyTotals[m - 1] = Number(r.total_value || 0);
      }
    }

    const monthLabels = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
    ];

    res.json({
      ok: true,
      period: { year, month },
      kpis: {
        totalRevenue,
        totalClients: clientsCountRow?.[0]?.total ?? 0,
        totalMaterials: materialsCountRow?.[0]?.total ?? 0,
        clientsWithSales: salesRows.length,
      },
      chart: {
        labels: salesRows.map((r) => r.client_name),
        values: salesRows.map((r) => Number(r.total_value || 0)),
      },
      yearlyChart: {
        labels: monthLabels,
        values: monthlyTotals,
      },
      table: salesRows.map((r, index) => ({
        rank: index + 1,
        clientId: r.client_id,
        clientName: r.client_name,
        totalValue: Number(r.total_value || 0),
      })),
    });
  } catch (e) {
    console.error('Erro ao carregar dashboard', e);
    res.status(500).json({ ok: false, error: 'Erro ao carregar dados do dashboard' });
  }
});

// Exportação do mesmo resumo para Excel
app.get('/api/dashboard/export', async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;

    const [rows] = await pool.query(
      `
      SELECT
        c.name AS client_name,
        SUM(s.total_value) AS total_value
      FROM sales s
      INNER JOIN clients c ON c.id = s.client_id
      WHERE YEAR(s.sale_date) = ? AND MONTH(s.sale_date) = ?
      GROUP BY c.id, c.name
      ORDER BY total_value DESC, client_name ASC
    `,
      [year, month]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Vendas por cliente');

    sheet.columns = [
      { header: 'Cliente', key: 'client_name', width: 40 },
      { header: 'Ano', key: 'year', width: 8 },
      { header: 'Mês', key: 'month', width: 8 },
      { header: 'Valor total (R$)', key: 'total_value', width: 18 },
    ];

    rows.forEach((r) => {
      sheet.addRow({
        client_name: r.client_name,
        year,
        month,
        total_value: Number(r.total_value || 0),
      });
    });

    const monthStr = String(month).padStart(2, '0');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio-vendas-${year}-${monthStr}.xlsx"`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error('Erro ao exportar dashboard', e);
    res.status(500).json({ ok: false, error: 'Erro ao exportar relatório' });
  }
});

// APIs de cadastro básico de clientes e materiais (admin)
app.get('/api/clients', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, document, created_at FROM clients ORDER BY created_at DESC, name ASC LIMIT 200'
    );
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error('Erro ao listar clients', e);
    res.status(500).json({ ok: false, error: 'Erro ao listar clientes' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, document } = req.body || {};
    if (!name) return res.status(400).json({ ok: false, error: 'Nome é obrigatório' });
    const [result] = await pool.query(
      'INSERT INTO clients (name, document) VALUES (?, ?)',
      [String(name).trim(), document ? String(document).trim() : null]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error('Erro ao criar client', e);
    res.status(500).json({ ok: false, error: 'Erro ao cadastrar cliente' });
  }
});

app.get('/api/materials', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, unit, base_price, created_at FROM materials ORDER BY created_at DESC, name ASC LIMIT 200'
    );
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error('Erro ao listar materials', e);
    res.status(500).json({ ok: false, error: 'Erro ao listar materiais' });
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    const { name, unit, base_price } = req.body || {};
    if (!name) return res.status(400).json({ ok: false, error: 'Nome é obrigatório' });
    const parsedPrice = base_price != null && base_price !== '' ? Number(base_price) : 0;
    const safePrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
    const [result] = await pool.query(
      'INSERT INTO materials (name, unit, base_price) VALUES (?, ?, ?)',
      [String(name).trim(), String(unit || 'kg').trim(), safePrice]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error('Erro ao criar material', e);
    res.status(500).json({ ok: false, error: 'Erro ao cadastrar material' });
  }
});

app.put('/api/materials/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'ID inválido' });
    const { name, unit, base_price } = req.body || {};
    if (!name) return res.status(400).json({ ok: false, error: 'Nome é obrigatório' });
    const parsedPrice = base_price != null && base_price !== '' ? Number(base_price) : 0;
    const safePrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
    const [result] = await pool.query(
      'UPDATE materials SET name = ?, unit = ?, base_price = ? WHERE id = ?',
      [String(name).trim(), String(unit || 'kg').trim(), safePrice, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'Material não encontrado' });
    res.json({ ok: true });
  } catch (e) {
    console.error('Erro ao atualizar material', e);
    res.status(500).json({ ok: false, error: 'Erro ao atualizar material' });
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'ID inválido' });
    const [result] = await pool.query('DELETE FROM materials WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'Material não encontrado' });
    res.json({ ok: true });
  } catch (e) {
    console.error('Erro ao excluir material', e);
    res.status(500).json({ ok: false, error: 'Erro ao excluir material' });
  }
});

// --- Fornecedores (suppliers)
app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, document, created_at FROM suppliers ORDER BY name ASC LIMIT 500'
    );
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) return res.json({ ok: true, items: [] });
    const placeholders = ids.map(() => '?').join(',');
    const [links] = await pool.query(
      `SELECT supplier_id, material_id FROM supplier_materials WHERE supplier_id IN (${placeholders})`,
      ids
    );
    const bySupplier = {};
    links.forEach((l) => {
      if (!bySupplier[l.supplier_id]) bySupplier[l.supplier_id] = [];
      bySupplier[l.supplier_id].push(l.material_id);
    });
    const items = rows.map((r) => ({
      ...r,
      material_ids: bySupplier[r.id] || [],
    }));
    res.json({ ok: true, items });
  } catch (e) {
    console.error('Erro ao listar fornecedores', e);
    res.status(500).json({ ok: false, error: 'Erro ao listar fornecedores' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, document, material_ids } = req.body || {};
    if (!name) return res.status(400).json({ ok: false, error: 'Nome é obrigatório' });
    const [result] = await pool.query(
      'INSERT INTO suppliers (name, document) VALUES (?, ?)',
      [String(name).trim(), document ? String(document).trim() : null]
    );
    const supplierId = result.insertId;
    const mids = Array.isArray(material_ids) ? material_ids.filter((id) => Number.isFinite(Number(id))) : [];
    if (mids.length > 0) {
      await pool.query(
        `INSERT INTO supplier_materials (supplier_id, material_id) VALUES ${mids.map(() => '(?, ?)').join(', ')}`,
        mids.flatMap((mid) => [supplierId, Number(mid)])
      );
    }
    res.json({ ok: true, id: supplierId });
  } catch (e) {
    console.error('Erro ao criar fornecedor', e);
    res.status(500).json({ ok: false, error: 'Erro ao cadastrar fornecedor' });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'ID inválido' });
    const { name, document, material_ids } = req.body || {};
    if (!name) return res.status(400).json({ ok: false, error: 'Nome é obrigatório' });
    const [result] = await pool.query(
      'UPDATE suppliers SET name = ?, document = ? WHERE id = ?',
      [String(name).trim(), document ? String(document).trim() : null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'Fornecedor não encontrado' });
    await pool.query('DELETE FROM supplier_materials WHERE supplier_id = ?', [id]);
    const mids = Array.isArray(material_ids) ? material_ids.filter((m) => Number.isFinite(Number(m))) : [];
    if (mids.length > 0) {
      await pool.query(
        `INSERT INTO supplier_materials (supplier_id, material_id) VALUES ${mids.map(() => '(?, ?)').join(', ')}`,
        mids.flatMap((mid) => [id, Number(mid)])
      );
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('Erro ao atualizar fornecedor', e);
    res.status(500).json({ ok: false, error: 'Erro ao atualizar fornecedor' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'ID inválido' });
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'Fornecedor não encontrado' });
    res.json({ ok: true });
  } catch (e) {
    console.error('Erro ao excluir fornecedor', e);
    res.status(500).json({ ok: false, error: 'Erro ao excluir fornecedor' });
  }
});

// --- Recolhimentos (collections)
app.get('/api/collections', async (req, res) => {
  try {
    const { supplier_id, from, to } = req.query;
    let sql = `
      SELECT c.id, c.supplier_id, c.collection_date, c.created_at,
             s.name AS supplier_name
      FROM collections c
      INNER JOIN suppliers s ON s.id = c.supplier_id
      WHERE 1=1
    `;
    const params = [];
    if (supplier_id && Number.isFinite(Number(supplier_id))) {
      sql += ' AND c.supplier_id = ?';
      params.push(Number(supplier_id));
    }
    if (from) {
      sql += ' AND c.collection_date >= ?';
      params.push(String(from));
    }
    if (to) {
      sql += ' AND c.collection_date <= ?';
      params.push(String(to));
    }
    sql += ' ORDER BY c.collection_date DESC, c.id DESC LIMIT 500';
    const [rows] = await pool.query(sql, params);
    const collIds = rows.map((r) => r.id);
    if (collIds.length === 0) return res.json({ ok: true, items: rows });
    const placeholders = collIds.map(() => '?').join(',');
    const [itemsRows] = await pool.query(
      `SELECT ci.collection_id, ci.material_id, ci.quantity, m.name AS material_name, m.unit
       FROM collection_items ci
       INNER JOIN materials m ON m.id = ci.material_id
       WHERE ci.collection_id IN (${placeholders})`,
      collIds
    );
    const itemsByColl = {};
    itemsRows.forEach((row) => {
      if (!itemsByColl[row.collection_id]) itemsByColl[row.collection_id] = [];
      itemsByColl[row.collection_id].push({
        material_id: row.material_id,
        material_name: row.material_name,
        unit: row.unit,
        quantity: Number(row.quantity),
      });
    });
    const items = rows.map((r) => ({
      ...r,
      items: itemsByColl[r.id] || [],
    }));
    res.json({ ok: true, items });
  } catch (e) {
    console.error('Erro ao listar recolhimentos', e);
    res.status(500).json({ ok: false, error: 'Erro ao listar recolhimentos' });
  }
});

app.post('/api/collections', async (req, res) => {
  try {
    const { supplier_id, collection_date, items } = req.body || {};
    if (!supplier_id || !collection_date) {
      return res.status(400).json({ ok: false, error: 'Fornecedor e data são obrigatórios' });
    }
    const sid = Number(supplier_id);
    if (!Number.isFinite(sid)) return res.status(400).json({ ok: false, error: 'Fornecedor inválido' });
    const validItems = Array.isArray(items)
      ? items.filter((i) => i.material_id != null && Number(i.quantity) > 0)
      : [];
    if (validItems.length === 0) {
      return res.status(400).json({ ok: false, error: 'Informe ao menos um resíduo com quantidade' });
    }
    const [result] = await pool.query(
      'INSERT INTO collections (supplier_id, collection_date) VALUES (?, ?)',
      [sid, String(collection_date)]
    );
    const collectionId = result.insertId;
    for (const it of validItems) {
      await pool.query(
        'INSERT INTO collection_items (collection_id, material_id, quantity) VALUES (?, ?, ?)',
        [collectionId, Number(it.material_id), Number(it.quantity)]
      );
    }
    res.json({ ok: true, id: collectionId });
  } catch (e) {
    console.error('Erro ao criar recolhimento', e);
    res.status(500).json({ ok: false, error: 'Erro ao cadastrar recolhimento' });
  }
});

// Export Excel de coletas (por fornecedor ou todos)
app.get('/api/collections/export', async (req, res) => {
  try {
    const { supplier_id, from, to } = req.query;
    let sql = `
      SELECT c.id, c.supplier_id, c.collection_date, s.name AS supplier_name,
             m.name AS material_name, m.unit, ci.quantity
      FROM collections c
      INNER JOIN suppliers s ON s.id = c.supplier_id
      INNER JOIN collection_items ci ON ci.collection_id = c.id
      INNER JOIN materials m ON m.id = ci.material_id
      WHERE 1=1
    `;
    const params = [];
    if (supplier_id && Number.isFinite(Number(supplier_id))) {
      sql += ' AND c.supplier_id = ?';
      params.push(Number(supplier_id));
    }
    if (from) {
      sql += ' AND c.collection_date >= ?';
      params.push(String(from));
    }
    if (to) {
      sql += ' AND c.collection_date <= ?';
      params.push(String(to));
    }
    sql += ' ORDER BY c.collection_date DESC, c.id, m.name';
    const [rows] = await pool.query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Coletas');

    sheet.columns = [
      { header: 'Data', key: 'collection_date', width: 12 },
      { header: 'Fornecedor', key: 'supplier_name', width: 35 },
      { header: 'Resíduo', key: 'material_name', width: 30 },
      { header: 'Unidade', key: 'unit', width: 10 },
      { header: 'Quantidade', key: 'quantity', width: 14 },
    ];

    rows.forEach((r) => {
      sheet.addRow({
        collection_date: r.collection_date,
        supplier_name: r.supplier_name,
        material_name: r.material_name,
        unit: r.unit || 'kg',
        quantity: Number(r.quantity),
      });
    });

    const filename = supplier_id
      ? `relatorio-coletas-fornecedor-${supplier_id}.xlsx`
      : 'relatorio-coletas-todos.xlsx';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error('Erro ao exportar coletas', e);
    res.status(500).json({ ok: false, error: 'Erro ao exportar relatório' });
  }
});

// Páginas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('Falha ao iniciar DB. Verifique XAMPP MySQL e .env', e);
    process.exit(1);
  });
