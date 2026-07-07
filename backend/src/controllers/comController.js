const pool = require('../db');


const getAllComputers = async (req, res) => {
  try {
    const { status = '', room = '' } = req.query;
    const params = [];
    let where = 'WHERE 1=1';
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    if (room) {
      params.push(room);
      where += ` AND room = $${params.length}`;
    }
    const { rows } = await pool.query(
      `SELECT * FROM computers ${where} ORDER BY created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/computers/:id
const getComputerById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM computers WHERE id = $1', [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'ไม่พบเครื่องนี้' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/computers
const createComputer = async (req, res) => {
  try {
    const { asset_code, brand_model, cpu, ram_gb, room, status = 'ใช้งาน' } = req.body;
    if (!asset_code) return res.status(400).json({ error: 'กรุณาระบุ asset_code' });
    const { rows } = await pool.query(
      `INSERT INTO computers (asset_code, brand_model, cpu, ram_gb, room, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [asset_code.trim(), brand_model, cpu, ram_gb, room, status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/computers/:id
const updateComputer = async (req, res) => {
  try {
    const { asset_code, brand_model, cpu, ram_gb, room, status = 'ใช้งาน' } = req.body;
    const { rows } = await pool.query(
      `UPDATE computers
       SET asset_code=$1, brand_model=$2, cpu=$3, ram_gb=$4, room=$5, status=$6
       WHERE id=$7 RETURNING *`,
      [asset_code, brand_model, cpu, ram_gb, room, status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'ไม่พบเครื่องนี้' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/computers/:id
const deleteComputer = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM computers WHERE id=$1 RETURNING *', [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'ไม่พบเครื่องนี้' });
    res.json({ message: 'ลบข้อมูลสำเร็จ', deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllComputers,
  getComputerById,
  createComputer,
  updateComputer,
  deleteComputer
};