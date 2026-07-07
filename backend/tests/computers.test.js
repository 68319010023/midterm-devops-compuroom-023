// backend/tests/computers.test.js
// Mock ตัว db pool ก่อน require app เพื่อไม่ให้ test พยายามต่อ PostgreSQL จริง
jest.mock('../src/db', () => ({
  query: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /health', () => {
  test('ตอบ status ok พร้อมข้อมูล service', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('Computer API');
  });
});

describe('GET /api/computers', () => {
  test('คืนค่ารายการเครื่องคอมพิวเตอร์ทั้งหมด', async () => {
    const mockRows = [
      { id: 1, asset_code: 'PC-001', brand_model: 'Dell OptiPlex 7010', cpu: 'Intel i5-12500', ram_gb: 16, room: 'ห้อง 301', status: 'ใช้งาน' },
    ];
    pool.query.mockResolvedValueOnce({ rows: mockRows });

    const res = await request(app).get('/api/computers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].asset_code).toBe('PC-001');
  });
});

describe('GET /api/computers/:id', () => {
  test('คืน 404 เมื่อไม่พบเครื่องตาม id ที่ระบุ', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/computers/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('ไม่พบเครื่องนี้');
  });

  test('คืนข้อมูลเครื่องเมื่อพบ id ที่ระบุ', async () => {
    const mockRow = { id: 1, asset_code: 'PC-001', brand_model: 'Dell OptiPlex 7010', cpu: 'Intel i5-12500', ram_gb: 16, room: 'ห้อง 301', status: 'ใช้งาน' };
    pool.query.mockResolvedValueOnce({ rows: [mockRow] });

    const res = await request(app).get('/api/computers/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.asset_code).toBe('PC-001');
  });
});

describe('POST /api/computers', () => {
  test('สร้างเครื่องใหม่สำเร็จเมื่อข้อมูลครบถ้วน', async () => {
    const newComputer = {
      asset_code: 'PC-007',
      brand_model: 'Lenovo ThinkCentre M75s',
      cpu: 'AMD Ryzen 5 4600G',
      ram_gb: 8,
      room: 'ห้อง 302',
      status: 'ใช้งาน',
    };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 7, ...newComputer }] });

    const res = await request(app).post('/api/computers').send(newComputer);
    expect(res.statusCode).toBe(201);
    expect(res.body.asset_code).toBe('PC-007');
  });

  test('คืน 400 เมื่อไม่ได้ระบุ asset_code', async () => {
    const res = await request(app).post('/api/computers').send({
      brand_model: 'Acer Veriton X2665G',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('กรุณาระบุ asset_code');
  });
});

describe('PUT /api/computers/:id', () => {
  test('คืน 404 เมื่อแก้ไขเครื่องที่ไม่มีอยู่จริง', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put('/api/computers/9999').send({
      asset_code: 'PC-999',
      brand_model: 'HP ProDesk 400 G7',
      cpu: 'Intel i5-10500',
      ram_gb: 16,
      room: 'ห้อง 303',
      status: 'ส่งซ่อม',
    });
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('ไม่พบเครื่องนี้');
  });
});

describe('DELETE /api/computers/:id', () => {
  test('ลบข้อมูลสำเร็จเมื่อพบเครื่องที่ระบุ', async () => {
    const mockRow = { id: 1, asset_code: 'PC-001' };
    pool.query.mockResolvedValueOnce({ rows: [mockRow] });

    const res = await request(app).delete('/api/computers/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('ลบข้อมูลสำเร็จ');
  });

  test('คืน 404 เมื่อลบเครื่องที่ไม่มีอยู่จริง', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete('/api/computers/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('ไม่พบเครื่องนี้');
  });
});