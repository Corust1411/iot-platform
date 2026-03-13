<template>
  <div class="app-wrapper">
    <TopNavBar :username="username" />

    <div class="layout">
      <SideNavBar />

      <div class="content">
        <div class="page-header space-between">
          <h1 class="page-title">Dashboards</h1>
          <button class="create-bw-btn" @click="openCreateModal">
            <span class="material-symbols-outlined">add</span>
            Create dashboard
          </button>
        </div>

        <div class="dashboard-card">
          <div class="table-container">
            <div class="table-header">
              <span>Name</span>
              <span>Description</span>
              <span>Devices Used</span>
              <span class="text-right">Action</span>
            </div>

            <div 
              v-for="dash in dashboards" 
              :key="dash.id" 
              class="table-row clickable-row"
              @click="goToDashboard(dash.id)"
            >
              <span class="fw-bold">{{ dash.name }}</span>
              <span class="text-gray line-clamp">{{ dash.description || '-' }}</span>
              
              <span class="device-tags">
                <span 
                  v-for="(dev, index) in (dash.devices || []).slice(0, 4)" 
                  :key="index" 
                  class="badge-tag"
                >
                  {{ dev.alias || dev.device_name }}
                </span>
                
                <span v-if="(dash.devices || []).length > 4" class="badge-tag more-tag">
                  +{{ dash.devices.length - 4 }}
                </span>
                
                <span v-if="!(dash.devices && dash.devices.length)" class="text-gray text-small">
                  -
                </span>
              </span>
              
              <span class="text-right action-wrapper">
                <button class="icon-btn" @click.stop="toggleMenu(dash.id)">
                  <span class="material-symbols-outlined">more_vert</span>
                </button>
                
                <div v-if="activeMenu === dash.id" class="overflow-menu">
                  <button @click.stop="openEditModal(dash)">
                    <span class="material-symbols-outlined">edit</span> Edit
                  </button>
                  <button class="danger-text" @click.stop="deleteDashboard(dash.id, dash.name)">
                    <span class="material-symbols-outlined">delete</span> Delete
                  </button>
                </div>
              </span>
            </div>
            
            <div v-if="dashboards.length === 0 && !isLoading" class="empty-state">
              No dashboards found.
            </div>
            <div v-if="isLoading" class="empty-state">
              Loading dashboards...
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Dashboard' : 'Create Dashboard' }}</h2>
          <button class="close-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Name <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="form.name" 
              placeholder="e.g., Smart Farm Overview"
              :class="{ 'error-border': showError && !form.name }"
            />
            <span v-if="showError && !form.name" class="error-text">Name is required</span>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="form.description" 
              placeholder="Short description about this dashboard..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-create-btn" @click="saveDashboard">
            {{ isEditing ? 'Save Changes' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showToast" class="toast-notification">
        <span class="material-symbols-outlined">check_circle</span>
        {{ toastMessage }}
      </div>
    </transition>
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
      showModal: false,
      isEditing: false,
      showError: false,
      showToast: false,
      toastMessage: '',
      activeMenu: null,
      isLoading: false,
      form: {
        id: null,
        name: '',
        description: ''
      },
      dashboards: []
    }
  },
  async mounted() {
    const storedUser = localStorage.getItem('username')
    if (storedUser) {
      this.username = storedUser
    }
    document.addEventListener('click', this.closeMenu)
    
    await this.fetchDashboards();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu)
  },
  methods: {
    goToDashboard(id) {
      this.$router.push(`/dashboard/${id}`);
    },
    toggleMenu(id) {
      this.activeMenu = this.activeMenu === id ? null : id;
    },
    closeMenu() {
      this.activeMenu = null;
    },
    openCreateModal() {
      this.isEditing = false;
      this.form = { id: null, name: '', description: '' };
      this.showError = false;
      this.showModal = true;
    },
    openEditModal(dash) {
      this.isEditing = true;
      this.form = { id: dash.id, name: dash.name, description: dash.description };
      this.showError = false;
      this.showModal = true;
      this.activeMenu = null;
    },
    closeModal() {
      this.showModal = false;
    },
    async fetchDashboards() {
      this.isLoading = true;
      try {
        const response = await http.get('/dashboards');
        this.dashboards = response.data;
      } catch (error) {
        console.error('Failed to load dashboards:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async saveDashboard() {
      if (!this.form.name.trim()) {
        this.showError = true;
        return;
      }

      try {
        const payload = {
          name: this.form.name,
          description: this.form.description
        };

        if (this.isEditing) {
          await http.put(`/dashboards/${this.form.id}`, payload);
          this.triggerToast('Dashboard updated successfully!');
        } else {
          await http.post('/dashboards', payload);
          this.triggerToast('Dashboard created successfully!');
        }

        this.closeModal();
        await this.fetchDashboards();
      } catch (error) {
        console.error('Failed to save dashboard:', error);
        alert('An error occurred while saving the dashboard.');
      }
    },
    async deleteDashboard(id, name) {
      this.activeMenu = null;
      const isConfirm = confirm(`Are you sure you want to delete "${name}"?`);
      if (isConfirm) {
        try {
          await http.delete(`/dashboards/${id}`);
          this.triggerToast('Dashboard deleted.');
          await this.fetchDashboards();
        } catch (error) {
          console.error('Failed to delete dashboard:', error);
          alert('Failed to delete dashboard.');
        }
      }
    },
    triggerToast(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => { this.showToast = false; }, 3000); 
    }
  }
}
</script>

<style scoped>
.app-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; }
.layout { display: flex; min-height: calc(100vh - 64px); }
.content { flex: 1; padding: 32px 40px; background: #f8fafc; }

/* Header & Black/White Button */
.page-header { display: flex; align-items: center; margin-bottom: 24px; }
.space-between { justify-content: space-between; }
.page-title { font-size: 24px; font-weight: 800; margin: 0; color: #111827; }

.create-bw-btn {
  background: #ffffff;
  color: #343434;
  border: 1.5px solid #343434;
  padding: 2px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.create-bw-btn:hover { background: #343434; color: #ffffff; }

/* Card & Table */
.dashboard-card { background: #ffffff; padding: 24px; min-height: 70vh; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.table-container { display: flex; flex-direction: column; background-color: #DEE5ED; border-radius: 10px; padding: 0 1vh; flex: 1; overflow-y: auto; }

.table-header, .table-row { display: grid; grid-template-columns: 2fr 3fr 3fr 60px; align-items: center; padding: 16px 12px; }
.table-header { font-weight: 700; color: #4b5563; font-size: 13px; border-bottom: 1px solid #7B7B7B; }
.table-row { border-bottom: 1px solid #7B7B7B; transition: 0.2s; font-size: 13px; }
.table-row:hover { background-color: #d6d8db; }
.table-row:last-child { border-bottom: none; }
.clickable-row { cursor: pointer; }

.fw-bold { font-weight: 600; color: #1f2937; font-size: 14px; }
.text-gray { color: #6b7280; }
.text-small { font-size: 12px; }
.text-right { text-align: right; display: flex; justify-content: flex-end; }
.line-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Device Tags */
.device-tags { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.badge-tag { background-color: #e2e8f0; color: #334155; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.more-tag { background-color: #cbd5e1; color: #1e293b; }

/* Action Menu (Kebab) */
.action-wrapper { position: relative; }
.icon-btn { background: none; border: none; cursor: pointer; color: #6b7280; border-radius: 50%; padding: 6px; display: flex; align-items: center; transition: 0.2s; }
.icon-btn:hover { background-color: #cbd5e1; color: #1f2937; }

.overflow-menu {
  position: absolute; top: 100%; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; min-width: 140px; z-index: 10; overflow: hidden;
}
.overflow-menu button { background: none; border: none; padding: 10px 16px; text-align: left; cursor: pointer; font-size: 13px; font-weight: 500; color: #374151; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-family: inherit; }
.overflow-menu button:hover { background-color: #f1f5f9; }
.danger-text { color: #ef4444 !important; }
.danger-text:hover { background-color: #fef2f2 !important; }
.overflow-menu .material-symbols-outlined { font-size: 18px; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-content { background: white; width: 100%; max-width: 450px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; animation: modalIn 0.3s ease; }
@keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
.close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; align-items: center; padding: 4px; border-radius: 50%; transition: 0.2s; }
.close-btn:hover { background: #f3f4f6; color: #111827; }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.required { color: #ef4444; }
.form-group input, .form-group textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: 0.2s; }
.form-group input:focus, .form-group textarea:focus { border-color: #111827; }
.form-group textarea { min-height: 80px; resize: none; }
.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; margin-top: -4px; }

.modal-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; display: flex; justify-content: flex-end; }
.modal-create-btn { background: #111827; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: 0.2s; }
.modal-create-btn:hover { background: #374151; }

.empty-state { text-align: center; padding: 40px; color: #6b7280; }

/* Toast */
.toast-notification { position: fixed; bottom: 40px; right: 40px; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 9999; font-weight: 600; font-size: 14px; }
.toast-notification .material-symbols-outlined { font-size: 22px; color: #10b981; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }

@keyframes slideInUp {
  0% { transform: translateY(100px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>