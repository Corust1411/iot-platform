<template>
  <div class="app-wrapper">
    <TopNavBar :username="username" />
    <div class="layout">
      <SideNavBar />

      <div class="content">
        <div class="page-header">
          <button class="back-btn" @click="$router.push('/managedashboard')">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>

          <h1 class="page-title">{{ dashboardName }}</h1>
        </div>

        <div class="toolbar">
          <div class="tabs">
            <span
              :class="{ active: currentTab === 'dashboard' }"
              @click="currentTab = 'dashboard'"
            >
              Dashboard
            </span>

            <span
              :class="{ active: currentTab === 'setting' }"
              @click="currentTab = 'setting'"
            >
              Setting
            </span>
          </div>
          <div class="toolbar-actions">
            <button class="add-widget-btn" @click="$router.push(`/dashboard/${$route.params.id}/create-widget`)">
              <span class="material-symbols-outlined">add</span>
              Add widget
            </button>

            <button class="share-btn">
              <span class="material-symbols-outlined">share</span>
              Share
            </button>
          </div>
        </div>

        <div v-if="currentTab === 'dashboard'" class="widget-grid">
          <div class="widget-card">
            
          </div>
        </div>
        <!-- SETTING TAB -->
        <div v-if="currentTab === 'setting'" class="setting-area">
          
          <div class="setting-card mb-24">
            
            <div class="card-header-row">
              <h3 class="card-title">Dashboard Information</h3>
              <button v-if="!isEditingInfo" class="icon-text-btn" @click="startEditInfo">
                <span class="material-symbols-outlined">edit</span> Edit
              </button>
            </div>

            <div v-if="!isEditingInfo" class="info-view-mode">
              <div class="info-row">
                <span class="info-label">Dashboard Name</span>
                <span class="info-value fw-bold">{{ dashboardName }}</span>
              </div>
              <div class="info-row mt-12">
                <span class="info-label">Description</span>
                <span class="info-value text-gray">{{ dashboardDesc || 'No description provided.' }}</span>
              </div>
            </div>

            <div v-else class="info-edit-mode">
              <div class="form-group">
                <label>Dashboard Name</label>
                <input type="text" v-model="editForm.name" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea v-model="editForm.description"></textarea>
              </div>
              <div class="form-actions mt-16">
                <button class="cancel-btn" @click="cancelEditInfo">Cancel</button>
                <button class="save-btn" @click="saveDashboardInfo">Save Changes</button>
              </div>
            </div>

          </div>

          <div class="setting-card">
            
            <div class="card-header-row">
              <h3 class="card-title">Linked Devices</h3>
              <button class="add-widget-btn" @click="openAddDeviceModal">
                <span class="material-symbols-outlined">add</span> Link Device
              </button>
            </div>

            <div class="table-container">
              <div class="table-header">
                <span>Alias / Device Name</span>
                <span>Protocol</span>
                <span class="text-right">Action</span>
              </div>
              
              <div v-for="dd in dashboardDevices" :key="dd.dashboard_device_id" class="table-row">
                <span class="fw-bold">{{ dd.alias || dd.device_name }}</span>
                <span><span class="badge-tag">{{ dd.protocol.toUpperCase() }}</span></span>
                <span class="text-right">
                  <button class="icon-btn danger-text" @click="removeLinkedDevice(dd.dashboard_device_id)">
                    <span class="material-symbols-outlined">link_off</span>
                  </button>
                </span>
              </div>
              
              <div v-if="dashboardDevices.length === 0" class="empty-state">
                No devices linked to this dashboard yet.
              </div>
            </div>
          </div>
        </div>

        <div v-if="showAddDeviceModal" class="modal-overlay" @click.self="showAddDeviceModal = false">
          <div class="modal-content wide-modal">
            <div class="modal-header">
              <h2>Select Device to Link</h2>
              <button class="close-btn" @click="showAddDeviceModal = false">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="form-group mb-16">
                <label>Set Alias (Optional)</label>
                <input type="text" v-model="newDeviceAlias" placeholder="e.g. Living Room Temp" />
              </div>

              <div class="table-container select-table">
                <div class="table-header">
                  <span>Device Name</span>
                  <span>Protocol</span>
                  <span class="text-right">Select</span>
                </div>
                <div v-for="dev in availableDevices" :key="dev.id" class="table-row">
                  <span class="fw-bold">{{ dev.name }}</span>
                  <span><span class="badge-tag">{{ dev.protocol.toUpperCase() }}</span></span>
                  <span class="text-right">
                    <input type="radio" :value="dev.id" v-model="selectedDeviceId" class="radio-select" />
                  </span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="cancel-btn" @click="showAddDeviceModal = false">Cancel</button>
              <button class="save-btn" @click="saveLinkedDevice" :disabled="!selectedDeviceId">
                Link Device
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue'
import SideNavBar from '@/components/SideNavBar.vue'
import { http } from '@/api/http'

export default {
  components: { TopNavBar, SideNavBar },

  data() {
    return {
      username: 'Unknown User',
      dashboardName: 'Loading...',
      dashboardDesc: '',
      currentTab: 'dashboard',
      isEditingInfo: false,
      editForm: { name: '', description: '' },
      dashboardDevices: [],
      availableDevices: [],
      showAddDeviceModal: false,
      selectedDeviceId: null,
      newDeviceAlias: ''
    }
  },

  async mounted() {
    const storedUser = localStorage.getItem('username')
    if (storedUser) this.username = storedUser

    const dashboardId = this.$route.params.id;
    if (dashboardId) {
      await this.fetchDashboardDetail(dashboardId);
    }
  },

  methods: {
  async fetchDashboardDetail(id) {
    try {
      const res = await http.get(`/dashboards/${id}`);
      this.dashboardName = res.data.name;
      this.dashboardDesc = res.data.description; // เก็บไว้โชว์
      this.editForm = { name: res.data.name, description: res.data.description };
      this.fetchDashboardDevices(id);
    } catch (error) {
      console.error(error);
    }
  },
  async saveDashboardInfo() {
    try {
      const id = this.$route.params.id;
      await http.put(`/dashboards/${id}`, this.editForm);
      this.dashboardName = this.editForm.name;
      this.dashboardDesc = this.editForm.description;
      this.isEditingInfo = false;
    } catch (error) {
      console.error(error);
    }
  },
  async fetchDashboardDevices(id) {
    try {
      const res = await http.get(`/dashboards/${id}/devices`);
      this.dashboardDevices = res.data;
    } catch (error) {
      console.error(error);
    }
  },
  async openAddDeviceModal() {
    this.selectedDeviceId = null;
    this.newDeviceAlias = '';
    try {
      const res = await http.get('/devices');
      const linkedIds = this.dashboardDevices.map(d => d.device_id);
      this.availableDevices = res.data.filter(d => !linkedIds.includes(d.id));
      
      this.showAddDeviceModal = true;
    } catch (error) {
      console.error(error);
    }
  },
  async saveLinkedDevice() {
    if (!this.selectedDeviceId) return;
    try {
      const id = this.$route.params.id;
      await http.post(`/dashboards/${id}/devices`, {
        device_id: this.selectedDeviceId,
        alias: this.newDeviceAlias
      });
      this.showAddDeviceModal = false;
      this.fetchDashboardDevices(id);
    } catch (error) {
      console.error(error);
      alert('Failed to link device');
    }
  },
  async removeLinkedDevice(dashboardDeviceId) {
    if(confirm('Are you sure you want to unlink this device?')) {
      try {
        await http.delete(`/dashboards/devices/${dashboardDeviceId}`);
        this.fetchDashboardDevices(this.$route.params.id);
      } catch (error) {
        console.error(error);
      }
    }
  },
  startEditInfo() {
    this.editForm = { name: this.dashboardName, description: this.dashboardDesc };
    this.isEditingInfo = true;
  },
  cancelEditInfo() {
    this.isEditingInfo = false;
  },
}
}
</script>

<style scoped>
.layout{
  display:flex;
  min-height:calc(100vh - 64px);
}

.content{
  flex:1;
  padding:32px 40px;
  background:#f8fafc;
}

/* HEADER */

.page-header{
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:20px;
}

.page-title{
  font-size:26px;
  font-weight:800;
  color:#486284;
}

.back-btn{
  border:none;
  background:none;
  cursor:pointer;
  color:#ff4b4a;
}

/* TOOLBAR */

.toolbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:24px;
  border-bottom: 1px solid #e5e7eb;
}

.tabs{
  display:flex;
  padding: 0px 10px;
  width: 100px;
}

.tabs span{
  padding:10px 30px;
  font-weight:600;
  color:#9ca3af;
  cursor:pointer;
}

.tabs .active{
  color:#000;
  border-bottom:2px solid #000;
}

.toolbar-actions{
  display:flex;
  gap:12px;
}

.add-widget-btn{
  display:flex;
  align-items:center;
  gap:6px;
  border:1px solid #d1d5db;
  background:white;
  padding:6px 12px;
  border-radius:6px;
  cursor:pointer;
  font-family:inherit;
}

.icon-btn{
  border:none;
  background:none;
  cursor:pointer;
}

.icon-text-btn {
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}
.icon-text-btn:hover { background: #f3f4f6; color: #111827; }
.icon-text-btn .material-symbols-outlined { font-size: 16px; }

/* GRID */

.widget-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:24px;
}

/* CARD */

.widget-card{
  background:white;
  border-radius:12px;
  padding:16px;
  border:1px solid #e5e7eb;
  box-shadow:0 2px 6px rgba(0,0,0,0.05);
}

.card-header{
  display:flex;
  justify-content:space-between;
  margin-bottom:10px;
  font-weight:600;
}

.card-actions{
  display:flex;
  gap:6px;
  color:#9ca3af;
  cursor:pointer;
}

.card-body{
  height:120px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.info-view-mode { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
.info-row { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.info-value { font-size: 15px; color: #1f2937; }
.mt-12 { margin-top: 12px; }

.center{
  display:flex;
  align-items:center;
  justify-content:center;
}

.setting-area{
  background:white;
  padding:20px;
  border-radius:12px;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background-color: #eff6ff; 
  color: #3b82f6; 
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s;
}

.share-btn:hover {
  background-color: #dbeafe;
}

.tabs span {
  transition: all 0.2s;
}

/* Setting Cards */
.setting-area { display: flex; flex-direction: column; gap: 24px; }
.setting-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
.section-title { font-size: 16px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.mb-24 { margin-bottom: 24px; }
.mb-16 { margin-bottom: 16px; }
.mt-16 { margin-top: 16px; }

/* Table overrides for settings */
.table-container { background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }

/* บังคับให้เป็น Grid สำหรับตาราง */
.table-header, .table-row { 
  display: grid; /* เพิ่มบรรทัดนี้ */
  grid-template-columns: 3fr 2fr 60px; 
  align-items: center; /* จัดให้อยู่ตรงกลางแนวตั้ง */
  padding: 12px 16px; 
}
.table-header { font-weight: 700; color: #4b5563; font-size: 13px; border-bottom: 1px solid #e2e8f0; background: #f1f5f9; }
.table-row { border-bottom: 1px solid #e2e8f0; transition: 0.2s; font-size: 14px; }
.table-row:hover { background-color: #f1f5f9; }
.table-row:last-child { border-bottom: none; }

.fw-bold { font-weight: 600; color: #1f2937; }
.text-right { text-align: right; display: flex; justify-content: flex-end; }
.empty-state { padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }

.badge-tag { background-color: #e2e8f0; color: #334155; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }

/* Modal specific */
.wide-modal { max-width: 600px; }
.select-table { max-height: 250px; overflow-y: auto; }
.radio-select { width: 18px; height: 18px; cursor: pointer; accent-color: #111827; }
.save-btn:disabled { background-color: #9ca3af; cursor: not-allowed; }

/* Forms & Inputs */
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input, .form-group textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: 0.2s; }
.form-group input:focus, .form-group textarea:focus { border-color: #111827; }
.form-group textarea { min-height: 80px; resize: vertical; }

/* Buttons */
.form-actions { display: flex; justify-content: flex-end; gap: 12px; }
.save-btn { background: #111827; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: 0.2s; font-family: inherit; }
.save-btn:hover:not(:disabled) { background: #374151; }
.cancel-btn { background: white; border: 1px solid #d1d5db; color: #4b5563; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: 0.2s; font-family: inherit; }
.cancel-btn:hover { background: #f3f4f6; }
.danger-text { color: #ef4444 !important; }

/* Modal Box */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-content { background: white; width: 100%; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; animation: modalIn 0.3s ease; }
@keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
.close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; border-radius: 50%; transition: 0.2s; }
.close-btn:hover { background: #f3f4f6; color: #111827; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; display: flex; justify-content: flex-end; gap: 12px; }
</style>