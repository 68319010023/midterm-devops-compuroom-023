<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_URL = `${API_BASE}/api/computers`

const STUDENT_NAME = 'นายบารมี ปะวะลัง 68319010023'  

const STATUS_OPTIONS = ['ใช้งาน', 'ส่งซ่อม', 'จำหน่าย']

const computers = ref([])
const loading = ref(false)
const errorMsg = ref('')

const filterStatus = ref('')
const filterRoom = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const emptyForm = () => ({
  asset_code: '',
  brand_model: '',
  cpu: '',
  ram_gb: '',
  room: '',
  status: 'ใช้งาน',
})
const form = ref(emptyForm())
const formError = ref('')

const filteredCount = computed(() => computers.value.length)

async function fetchComputers() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = new URLSearchParams()
    if (filterStatus.value) params.append('status', filterStatus.value)
    if (filterRoom.value) params.append('room', filterRoom.value)
    const res = await fetch(`${API_URL}?${params.toString()}`)
    if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (HTTP ${res.status})`)
    computers.value = await res.json()
  } catch (err) {
    errorMsg.value = err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ API'
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  showModal.value = true
}

function openEditModal(item) {
  isEditing.value = true
  editingId.value = item.id
  form.value = {
    asset_code: item.asset_code,
    brand_model: item.brand_model,
    cpu: item.cpu,
    ram_gb: item.ram_gb,
    room: item.room,
    status: item.status,
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitForm() {
  formError.value = ''
  if (!form.value.asset_code.trim() || !form.value.brand_model.trim()) {
    formError.value = 'กรุณากรอกรหัสครุภัณฑ์และยี่ห้อ/รุ่นให้ครบ'
    return
  }

  const payload = {
    ...form.value,
    ram_gb: Number(form.value.ram_gb) || 0,
  }

  try {
    const url = isEditing.value ? `${API_URL}/${editingId.value}` : API_URL
    const method = isEditing.value ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `บันทึกไม่สำเร็จ (HTTP ${res.status})`)
    }
    showModal.value = false
    await fetchComputers()
  } catch (err) {
    formError.value = err.message || 'เกิดข้อผิดพลาดในการบันทึก'
  }
}

async function deleteComputer(item) {
  const confirmed = window.confirm(`ลบเครื่อง "${item.asset_code}" ใช่หรือไม่?`)
  if (!confirmed) return
  try {
    const res = await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`ลบไม่สำเร็จ (HTTP ${res.status})`)
    await fetchComputers()
  } catch (err) {
    errorMsg.value = err.message || 'เกิดข้อผิดพลาดในการลบข้อมูล'
  }
}

function statusClass(status) {
  if (status === 'ใช้งาน') return 'badge badge-active'
  if (status === 'ส่งซ่อม') return 'badge badge-repair'
  return 'badge badge-retired'
}

onMounted(fetchComputers)
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="brand-icon">▣</span>
        <div>
          <h1>compuroom<span class="cursor">_</span></h1>
          <p class="subtitle">ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง</p>
        </div>
      </div>
      <p class="student-tag">{{ STUDENT_NAME }}</p>
    </header>

    <main class="content">
      <section class="toolbar">
        <div class="filters">
          <select v-model="filterStatus" @change="fetchComputers">
            <option value="">สถานะทั้งหมด</option>
            <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
          </select>
          <input
            v-model="filterRoom"
            @keyup.enter="fetchComputers"
            type="text"
            placeholder="ค้นหาห้อง เช่น ห้อง 301"
          />
          <button class="btn-ghost" @click="fetchComputers">ค้นหา</button>
        </div>
        <button class="btn-primary" @click="openAddModal">+ เพิ่มเครื่องใหม่</button>
      </section>

      <p class="count-line">พบทั้งหมด {{ filteredCount }} เครื่อง</p>

      <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

      <div class="table-wrap">
        <table v-if="!loading && computers.length">
          <thead>
            <tr>
              <th>รหัสครุภัณฑ์</th>
              <th>ยี่ห้อ/รุ่น</th>
              <th>CPU</th>
              <th>RAM</th>
              <th>ห้อง</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in computers" :key="item.id">
              <td class="mono">{{ item.asset_code }}</td>
              <td>{{ item.brand_model }}</td>
              <td class="mono">{{ item.cpu }}</td>
              <td class="mono">{{ item.ram_gb }} GB</td>
              <td>{{ item.room }}</td>
              <td><span :class="statusClass(item.status)">{{ item.status }}</span></td>
              <td class="actions">
                <button class="icon-btn" @click="openEditModal(item)" title="แก้ไข">✎</button>
                <button class="icon-btn danger" @click="deleteComputer(item)" title="ลบ">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else-if="loading" class="empty-state">กำลังโหลดข้อมูล...</p>
        <div v-else class="empty-state">
          <p>ยังไม่มีข้อมูลเครื่องคอมพิวเตอร์</p>
          <button class="btn-primary" @click="openAddModal">เพิ่มเครื่องแรกของคุณ</button>
        </div>
      </div>
    </main>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h2>{{ isEditing ? 'แก้ไขข้อมูลเครื่อง' : 'เพิ่มเครื่องใหม่' }}</h2>

        <form @submit.prevent="submitForm" class="form-grid">
          <label>
            รหัสครุภัณฑ์/รหัสเครื่อง
            <input v-model="form.asset_code" type="text" placeholder="เช่น PC-001" />
          </label>
          <label>
            ยี่ห้อและรุ่น
            <input v-model="form.brand_model" type="text" placeholder="เช่น Dell OptiPlex 7010" />
          </label>
          <label>
            CPU
            <input v-model="form.cpu" type="text" placeholder="เช่น Intel i5-12500" />
          </label>
          <label>
            RAM (GB)
            <input v-model="form.ram_gb" type="number" min="0" placeholder="เช่น 16" />
          </label>
          <label>
            ห้องที่ติดตั้ง
            <input v-model="form.room" type="text" placeholder="เช่น ห้อง 301" />
          </label>
          <label>
            สถานะ
            <select v-model="form.status">
              <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>

          <p v-if="formError" class="error-banner">{{ formError }}</p>

          <div class="modal-actions">
            <button type="button" class="btn-ghost" @click="closeModal">ยกเลิก</button>
            <button type="submit" class="btn-primary">{{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มเครื่อง' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --bg: #0f1419;
  --surface: #161d27;
  --surface-alt: #1d2733;
  --border: #2a3644;
  --text: #e2e8f0;
  --muted: #7c8b9c;
  --accent: #4fd1a5;
  --accent-dim: rgba(79, 209, 165, 0.15);
  --warn: #f0b354;
  --warn-dim: rgba(240, 179, 84, 0.15);
  --danger: #ef6a6a;
  --danger-dim: rgba(239, 106, 106, 0.15);
}

.app {
  --bg: #0f1419;
  --surface: #161d27;
  --surface-alt: #1d2733;
  --border: #2a3644;
  --text: #e2e8f0;
  --muted: #7c8b9c;
  --accent: #4fd1a5;
  --accent-dim: rgba(79, 209, 165, 0.15);
  --warn: #f0b354;
  --warn-dim: rgba(240, 179, 84, 0.15);
  --danger: #ef6a6a;
  --danger-dim: rgba(239, 106, 106, 0.15);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  font-size: 28px;
  color: var(--accent);
}

.brand h1 {
  font-family: 'Courier New', monospace;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin: 0;
}

.cursor {
  color: var(--accent);
  animation: blink 1.1s steps(1) infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.student-tag {
  font-size: 12px;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
}

.content {
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 40px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

select, input[type='text'], input[type='number'] {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 14px;
}

select:focus, input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.btn-primary {
  background: var(--accent);
  color: #06231a;
  border: none;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover { filter: brightness(1.08); }

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 9px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-ghost:hover { border-color: var(--accent); }

.count-line {
  color: var(--muted);
  font-size: 13px;
  margin: 12px 0 16px;
}

.error-banner {
  background: var(--danger-dim);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 14px;
}

.table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--surface-alt);
}

th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
}

td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

tr:last-child td { border-bottom: none; }

.mono {
  font-family: 'Courier New', monospace;
  color: #a8b8c8;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-active { background: var(--accent-dim); color: var(--accent); }
.badge-repair { background: var(--warn-dim); color: var(--warn); }
.badge-retired { background: var(--danger-dim); color: var(--danger); }

.actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.icon-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.icon-btn:hover { border-color: var(--accent); }
.icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--muted);
}

.empty-state .btn-primary { margin-top: 14px; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 10;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 28px;
  width: 100%;
  max-width: 440px;
}

.modal h2 {
  margin: 0 0 18px;
  font-size: 18px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

@media (max-width: 640px) {
  .topbar, .content { padding-left: 20px; padding-right: 20px; }
  .table-wrap { overflow-x: auto; }
  table { min-width: 640px; }
}
</style>