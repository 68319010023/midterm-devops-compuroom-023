นาย บารมี ปะวะลัง รหัสนักศึกษา 68319010023  ปวส 2/3
--------------------------------------------------
โจทย์ที่ 1 ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง
รหัสโปรเจกต์: compuroom
--------------------------------------------------
รหัสครุภัณฑ์/รหัสเครื่อง asset_code
ยี่ห้อและรุ่น brand_model
สเปก CPU / RAM cpu,ram_gb
ห้องที่ติดตั้ง room
สถานะ status — ใช้งาน / ส่งซ่อม / จำหน่าย


API Endpoints
Method	Endpoint	คำอธิบาย
GET	`/health`	เช็คสถานะเซิร์ฟเวอร์
GET	`/api/computers`	ดึงรายการเครื่องคอมพิวเตอร์ทั้งหมด (filter ด้วย `?status=` และ `?room=` ได้)
GET	`/api/computers/:id`	ดึงข้อมูลเครื่องคอมพิวเตอร์ตาม id
POST	`/api/computers`	เพิ่มข้อมูลเครื่องคอมพิวเตอร์ใหม่
PUT	`/api/computers/:id`	แก้ไขข้อมูลเครื่องคอมพิวเตอร์ตาม id
DELETE	`/api/computers/:id`	ลบข้อมูลเครื่องคอมพิวเตอร์ตาม id


![CI](https://github.com/68319010023/midterm-devops-compuroom-68319010023/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/68319010023/midterm-devops-compuroom-68319010023/actions/workflows/cd.yml/badge.svg)
