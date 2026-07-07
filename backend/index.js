require('dotenv').config();
const pool = require('./src/db');
const app  = require('./src/app');
const PORT = process.env.PORT || 3001;

async function initDb() {
  // สร้าง table ถ้ายังไม่มี
  await pool.query(`
    CREATE TABLE IF NOT EXISTS computers (
      id          SERIAL PRIMARY KEY,
      asset_code  VARCHAR(50)  UNIQUE NOT NULL,
      brand_model VARCHAR(100) NOT NULL,
      cpu         VARCHAR(100) NOT NULL,
      ram_gb      INTEGER      NOT NULL,
      room        VARCHAR(50)  NOT NULL,
      status      VARCHAR(20)  NOT NULL DEFAULT 'ใช้งาน',
      created_at  TIMESTAMPTZ  DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
  console.log('✅ Table computers ready');

  // Seed ถ้า table ว่าง
  const { rows } = await pool.query('SELECT COUNT(*) FROM computers');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO computers (asset_code, brand_model, cpu, ram_gb, room, status) VALUES
      ('PC-001', 'Dell OptiPlex 7010',   'Intel i5-12500',  16, 'ห้อง 301', 'ใช้งาน'),
      ('PC-002', 'HP EliteDesk 800 G6',  'Intel i7-10700',  32, 'ห้อง 301', 'ใช้งาน'),
      ('PC-003', 'Lenovo ThinkCentre M75s','AMD Ryzen 5 4600G',8, 'ห้อง 302', 'ส่งซ่อม'),
      ('PC-004', 'Acer Veriton X2665G',  'Intel i3-10100',  8,  'ห้อง 302', 'ใช้งาน'),
      ('PC-005', 'Dell OptiPlex 3080',   'Intel i5-10500',  16, 'ห้อง 303', 'จำหน่าย'),
      ('PC-006', 'HP ProDesk 400 G7',    'Intel i5-10500',  16, 'ห้อง 303', 'ใช้งาน')
    `);
    console.log('🌱 Seed data inserted (6 computers)');
  }
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Compuroom API running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB init failed:', err.message);
    process.exit(1);
  });