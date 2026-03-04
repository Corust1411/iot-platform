<template>
  <div class="app-wrapper">
    <TopBar :username="username" />

    <div class="layout">
      <SideNav />

      <div class="content">
        <div class="page-header">
          <h1 class="page-title">Manage Devices</h1>
        </div>

        <div class="device-card">
          <div class="tabs">
            <span 
              :class="{ active: currentTab === 'all' }" 
              @click="setTab('all')"
            >
              All devices
            </span>
            <span 
              :class="{ active: currentTab === 'favorite' }" 
              @click="setTab('favorite')"
            >
              Favorite list
            </span>
          </div>

          <div class="table-container">
            <div class="table-header">
              <span>Name</span>
              <span>Category</span>
              <span>Protocol</span>
              <span class="text-right">
                <span class="material-symbols-outlined icon-filter">filter_list</span>
              </span>
            </div>

            <div 
              v-for="device in displayedDevices"
              :key="device.id"
              class="table-row"
            >
              <span class="fw-bold">{{ device.name }}</span>
              
              <span>
                <span class="badge">{{ device.category || 'Uncategorized' }}</span>
              </span>
              
              <span class="protocol-text">
                <span class="material-symbols-outlined" v-if="device.protocol === 'wifi'">wifi</span>
                <span class="material-symbols-outlined" v-else-if="device.protocol === 'zigbee'">sensors</span>
                <span class="material-symbols-outlined" v-else>cell_tower</span>
                {{ device.protocol ? device.protocol.toUpperCase() : 'N/A' }}
              </span>

              <span class="text-right">
                <button class="icon-btn heart-btn" @click="toggleFavorite(device)">
                  <span 
                    class="material-symbols-outlined" 
                    :class="{ 'filled-heart': device.is_favorite }"
                  >
                    favorite
                  </span>
                </button>
              </span>
            </div>

            <div v-if="displayedDevices.length === 0" class="empty-state">
              No devices found.
            </div>
          </div>

          <div class="paginator" v-if="totalPages > 1">
            <button :disabled="currentPage === 1" @click="currentPage--">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages" @click="currentPage++">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div class="footer">
            <button class="add-btn">
              <span class="material-symbols-outlined">add</span>
              Register device
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
// ตรวจสอบชื่อ Component ให้ตรงกับไฟล์จริงของคุณด้วยนะครับ
import TopBar from '@/components/TopBar.vue' // หรือ TopBar.vue
import SideNav from '@/components/SideNav.vue'  // หรือ SideNav.vue
import { http } from '@/api/http'

export default {
  components: { TopBar, SideNav },
  data() {
    return {
      username: 'Unknown User',
      devices: [],
      // ตัวแปรสำหรับจัดการ Tab และ Pagination
      currentTab: 'all',
      currentPage: 1,
      itemsPerPage: 10 // แสดงกี่ตัวต่อ 1 หน้า
    }
  },
  computed: {
    // 1. กรองอุปกรณ์ตาม Tab ที่เลือก
    filteredDevices() {
      if (this.currentTab === 'favorite') {
        // สมมติว่าในตาราง device มีคอลัมน์ is_favorite
        return this.devices.filter(d => d.is_favorite);
      }
      return this.devices;
    },
    // 2. คำนวณจำนวนหน้าทั้งหมด
    totalPages() {
      return Math.ceil(this.filteredDevices.length / this.itemsPerPage) || 1;
    },
    // 3. ตัดข้อมูลมาแสดงเฉพาะหน้าที่เลือก (Pagination)
    displayedDevices() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredDevices.slice(start, end);
    }
  },
  methods: {
    // เปลี่ยน Tab
    setTab(tab) {
      this.currentTab = tab;
      this.currentPage = 1; // เมื่อเปลี่ยน Tab ให้กลับไปหน้า 1 เสมอ
    },
    // กดหัวใจ
    async toggleFavorite(device) {
      // สลับค่าในหน้า UI ให้ผู้ใช้เห็นทันที
      device.is_favorite = !device.is_favorite;

      // (Optional) ยิง API ไปอัปเดตสถานะหัวใจใน Database
      /*
      try {
        await http.patch(`/devices/${device.id}`, { is_favorite: device.is_favorite });
      } catch (err) {
        console.error("Failed to update favorite status", err);
        device.is_favorite = !device.is_favorite; // ถ้า API error ให้สลับค่ากลับ
      }
      */
    },
    // ดึงข้อมูลอุปกรณ์
    async fetchDevices() {
      try {
        const res = await http.get('/devices');
        this.devices = res.data;
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    }
  },
  async mounted() {
    // 1. ดึงชื่อผู้ใช้จาก localStorage มาแสดง
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      this.username = storedUser;
    }

    // 2. ดึงข้อมูลอุปกรณ์จาก API
    await this.fetchDevices();
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: calc(100vh - 64px); /* หักความสูง TopBar ออก */
}

.content {
  flex: 1;
  padding: 32px 40px;
  max-height: 93vh;
  background: #f8fafc; /* สีเทาอ่อนเรียบหรู */
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 24px;
  margin-top: 0;
}

/* --- Device Card & Tabs --- */
.device-card {
  background: #ffffff;
  padding: 24px;
  height: 70vh;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.tabs span {
  cursor: pointer;
  color: #6b7280;
  font-weight: 600;
  font-size: 15px;
  padding: 1vh 6vh;
  transition: color 0.2s;
  position: relative;
}

.tabs span:hover {
  color: #374151;
}

.tabs .active {
  color: #000000; /* สีแสด */
}

.tabs .active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #000000;
}

/* --- Table Styles --- */
.table-container {
  display: flex;
  flex-direction: column;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 80px; /* แบ่งสัดส่วนคอลัมน์ใหม่ ให้ปุ่มอยู่ขวาสุด */
  align-items: center;
  padding: 16px 12px;
  background-color: #DEE5ED;
}

.table-header {
  font-weight: 700;
  color: #4b5563;
  font-size: 13px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.table-row {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9fafb;
}

.table-row:last-child {
  border-bottom: none;
}

.text-right {
  text-align: right;
  display: flex;
  justify-content: flex-end;
}

.fw-bold {
  font-weight: 600;
  color: #1f2937;
}

/* --- Badges & Icons --- */
.badge {
  background-color: #e0e7ff;
  color: #4338ca;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.protocol-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 50%;
  padding: 6px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.icon-filter {
  color: #6b7280;
  font-size: 20px;
}

.filled-heart {
  font-variation-settings: 'FILL' 1;
  color: #ef4444; /* สีแดง */
}

.heart-btn:hover .material-symbols-outlined:not(.filled-heart) {
  color: #ef4444;
  opacity: 0.5;
}

.empty-state {
  text-align: center;
  padding: 40px;
  min-height: 39vh;
  color: #6b7280;
}

/* --- Paginator --- */
.paginator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.paginator button {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #374151;
}

.paginator button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

.paginator span {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}

/* --- Footer & Buttons --- */
.footer {
  text-align: right;
  margin-top: 24px;
}

.add-btn {
  background: #FF4B4A; /* สีแสด */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2);
  transition: transform 0.2s, background-color 0.2s;
}

.add-btn:hover {
  background: #fb3131;
  transform: translateY(-2px);
}
</style>