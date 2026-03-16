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
            <button v-if="['owner', 'edit'].includes(userRole)" class="add-widget-btn" @click="$router.push(`/dashboard/${$route.params.id}/create-widget`)">
              <span class="material-symbols-outlined">add</span>
              Add widget
            </button>

            <button class="share-btn" @click="openShareModal">
              <span class="material-symbols-outlined">share</span>
              Share
            </button>
          </div>
          <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
          <div class="share-modal">
            <div class="modal-header">
              <h2>Share Dashboard</h2>
              <button class="close-btn" @click="showShareModal = false"><span class="material-symbols-outlined">close</span></button>
            </div>

            <div class="share-input-area">
              <input type="email" v-model="newShareEmail" placeholder="Add people by email..." />
              <select class="role-select" v-model="newSharePermission">
                <option value="view">Viewer</option>
                <option v-if="['owner', 'edit'].includes(userRole)" value="edit">Editor</option>
              </select>
              <button class="add-btn" @click="shareWithUser">Invite</button>
            </div>

            <hr class="divider" />

            <h3>People with access</h3>
            <div class="shared-users-list">
              <div class="user-row">
                <div class="user-info">
                  <div class="avatar"><span class="material-symbols-outlined">person</span></div>
                  <div>
                    <p class="u-name">You (Owner)</p>
                  </div>
                </div>
                <span class="role-text">Owner</span>
              </div>

              <div class="user-row" v-for="user in sharedUsers" :key="user.share_id">
                <div class="user-info">
                  <div class="avatar bg-gray"><span class="material-symbols-outlined">person</span></div>
                  <div>
                    <p class="u-name">{{ user.username }}</p>
                    <p class="u-email">{{ user.email }}</p>
                  </div>
                </div>
                
                <select class="role-select" :value="user.permission" @change="updatePermission(user.share_id, $event.target.value)">
                  <option value="view">Viewer</option>
                  <option v-if="['owner', 'edit'].includes(userRole)" value="edit">Editor</option>
                  <option v-if="['owner', 'edit'].includes(userRole)" value="remove" class="text-red">Remove access</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button class="done-btn" @click="showShareModal = false">Done</button>
            </div>
          </div>
        </div>
        </div>

        <!-- widget TAB -->
        <div v-if="currentTab === 'dashboard'" class="widget-grid">
          
          <div v-if="widgets.length === 0" class="empty-state full-width-grid">
            <span class="material-symbols-outlined" style="font-size: 48px; color: #9ca3af;">widgets</span>
            <p>No widgets yet. Go to Setting tab to create one.</p>
          </div>

          <div v-for="widget in widgets" :key="widget.id" class="widget-card">
            
            <div class="card-header">
              <span>{{ widget.title }}</span>
              <div class="action-wrapper">
                <button v-if="['owner', 'edit'].includes(userRole)" class="icon-btn" @click.stop="toggleMenu(widget.id)">
                  <span class="material-symbols-outlined">more_horiz</span>
                </button>
                
                <div v-if="activeMenu === widget.id" class="action-menu">
                  <button @click.stop="editWidget(widget)">
                    <span class="material-symbols-outlined">edit</span> Edit
                  </button>
                  <button class="danger-text" @click.stop="deleteWidget(widget.id, widget.title)">
                    <span class="material-symbols-outlined">delete</span> Delete
                  </button>
                </div>
              </div>
            </div>

            <div class="card-body center">
              <WidgetText 
                v-if="widget.type === 'text'" 
                :widget="widget" 
              />
              <WidgetGauge
                v-else-if="widget.type === 'gauge'"
                :widget="widget"
              />
              <WidgetGraph 
                v-else-if="widget.type === 'graph'" 
                :widget="widget" 
              />
              <WidgetToggle 
                v-else-if="widget.type === 'toggle'" 
                :widget="widget" 
                @toggle="handleToggle" 
              />
              <WidgetSlider 
                v-else-if="widget.type === 'slider'" 
                :widget="widget" 
                @slide="handleSliderControl" 
              />

              <div v-else class="text-gray text-small">
                Preview for {{ widget.type }} coming soon...
              </div>

            </div>
          </div> 
        </div>

        <!-- SETTING TAB -->
        <div v-if="currentTab === 'setting'" class="setting-area">
          
          <div class="setting-card mb-24">
            
            <div class="card-header-row">
              <h3 class="card-title">Dashboard Information</h3>
              <button v-if="['owner', 'edit'].includes(userRole) && !isEditingInfo" class="icon-text-btn" @click="startEditInfo">
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
              <button v-if="['owner', 'edit'].includes(userRole)" class="add-widget-btn" @click="openAddDeviceModal">
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
                  <button v-if="['owner', 'edit'].includes(userRole)" class="icon-btn danger-text" @click="removeLinkedDevice(dd.dashboard_device_id)">
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
        <div v-if="showEditWidgetModal" class="modal-overlay" @click.self="showEditWidgetModal = false">
          <div class="modal-content wide-modal">
            
            <div class="modal-header">
              <h2>Edit Widget</h2>
              <button class="close-btn" @click="showEditWidgetModal = false">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="form-group mb-16">
                <label>Widget Title</label>
                <input type="text" v-model="editWidgetForm.title" placeholder="e.g. Living Room Temperature" />
              </div>

              <div class="form-group mb-16">
                <label>Parameter (Data Key)</label>
                <input 
                  type="text" 
                  v-model="editWidgetForm.data_key" 
                  list="data-keys-list" 
                  placeholder="e.g. rssi, temperature, state" 
                />
                <datalist id="data-keys-list">
                  <option v-for="key in availableDataKeys" :key="key" :value="key"></option>
                </datalist>
              </div>

              <div v-if="editWidgetForm.type === 'text'" class="form-group">
                <label>Unit (Optional)</label>
                <input type="text" v-model="editWidgetForm.config.unit" placeholder="e.g. °C, %, Lux" />
              </div>
              <div v-else-if="editWidgetForm.type === 'gauge'">
                <div class="form-group mb-16">
                  <label>Unit</label>
                  <input type="text" v-model="editWidgetForm.config.unit" placeholder="e.g. dBm, m" />
                </div>
                <div class="form-group mb-16">
                  <label>Min Value</label>
                  <input type="number" v-model="editWidgetForm.config.min" placeholder="e.g. -100" />
                </div>
                <div class="form-group">
                  <label>Max Value</label>
                  <input type="number" v-model="editWidgetForm.config.max" placeholder="e.g. 0" />
                </div>
              </div>
              <div v-else-if="editWidgetForm.type === 'graph'">
                <div class="form-group mb-16">
                  <label>Instance Name (Legend)</label>
                  <input type="text" v-model="editWidgetForm.config.instanceName" placeholder="e.g. Temp Sensor 1" />
                </div>
                
                <div class="form-group mb-16" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <label>Time Range</label>
                    <select v-model="editWidgetForm.config.timeRange" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #d1d5db;">
                      <option value="1h">Last 1 Hour</option>
                      <option value="6h">Last 6 Hours</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                    </select>
                  </div>
                  <div>
                    <label>Line Color</label>
                    <input type="color" v-model="editWidgetForm.config.lineColor" style="width: 100%; height: 38px; padding: 2px; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer;" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Unit (Optional)</label>
                  <input type="text" v-model="editWidgetForm.config.unit" placeholder="e.g. °C, %, Lux" />
                </div>
              </div>
              <div v-else-if="editWidgetForm.type === 'slider'">
                <div class="form-group mb-16">
                  <label>Unit (Optional)</label>
                  <input type="text" v-model="editWidgetForm.config.unit" placeholder="e.g. %, Lux" />
                </div>
                <div class="form-group mb-16">
                  <label>Min Value</label>
                  <input type="number" v-model="editWidgetForm.config.min" placeholder="e.g. 0" />
                </div>
                <div class="form-group">
                  <label>Max Value</label>
                  <input type="number" v-model="editWidgetForm.config.max" placeholder="e.g. 100" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="cancel-btn" @click="showEditWidgetModal = false">Cancel</button>
              <button class="save-btn" @click="saveEditedWidget" :disabled="!editWidgetForm.title">
                Save Changes
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div> <!--layout-->
  </div> <!--app-wrapper-->
  <transition name="fade">
      <div v-if="showToast" class="toast-notification">
        <span class="material-symbols-outlined">check_circle</span>
        {{ toastMessage }}
      </div>
    </transition>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue'
import SideNavBar from '@/components/SideNavBar.vue'
import { http } from '@/api/http'
import { io } from 'socket.io-client'

import WidgetToggle from '../components/widgets/WidgetToggle.vue'
import WidgetText from '../components/widgets/WidgetText.vue'
import WidgetGauge from '../components/widgets/WidgetGauge.vue'
import WidgetSlider from '../components/widgets/WidgetSlider.vue'
import WidgetGraph from '../components/widgets/WidgetGraph.vue'

export default {
  components: { TopNavBar, SideNavBar, WidgetToggle, WidgetText, WidgetGauge, WidgetSlider, WidgetGraph },

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
      newDeviceAlias: '',
      widgets: [],
      socket: null,
      activeMenu: null,
      showEditWidgetModal: false,
      editWidgetForm: { 
        id: null, 
        title: '', 
        type: '', 
        data_key: '',
        device_id: null,
        config: {}
      },
      availableDataKeys: [],
      showToast: false,
      toastMessage: '',
      showShareModal: false,
      newShareEmail: '',
      newSharePermission: 'view',
      sharedUsers: [],
      userRole: 'view',
    }
  },
  async mounted() {
    const storedUser = localStorage.getItem('username')
    if (storedUser) this.username = storedUser

    const dashboardId = this.$route.params.id;
    if (dashboardId) {
      await this.fetchDashboardDetail(dashboardId);
    }
    if (this.$route.query.action === 'created') {
      this.triggerToast('Widget created successfully!');
      this.$router.replace({ path: `/dashboard/${this.$route.params.id}` });
    }
    this.setupSocket();
    
    document.addEventListener('click', this.closeMenu);
  },
  
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu);
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  
  methods: {
    async fetchDashboardDetail(id) {
      try {
        const res = await http.get(`/dashboards/${id}`);
        this.dashboardName = res.data.name;
        this.dashboardDesc = res.data.description;
        this.editForm = { name: res.data.name, description: res.data.description };
        this.userRole = res.data.role || 'view';
        this.fetchWidgets(id);
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
    async fetchWidgets(id) {
      try {
        const res = await http.get(`/dashboards/${id}/widgets`);
        this.widgets = res.data.map(w => {
          let val = w.current_value !== null ? w.current_value : null;
          
          if (w.type === 'toggle' && val !== null) {
            val = val === 1 ? true : false;
          }

          let parsedConfig = w.config;
          if (typeof parsedConfig === 'string') {
            try { parsedConfig = JSON.parse(parsedConfig); } catch(e) {}
          }

          return { ...w, currentValue: val, config: parsedConfig || {} };
        });    
      } catch (error) {
        console.error("Error fetching widgets:", error);
      }
    },
    setupSocket() {
      this.socket = io('http://localhost:5000'); 

      this.socket.on('connect', () => {
        console.log('✅ Connected to Real-time Server');
      });

      this.socket.on('telemetry_update', (data) => {
        console.log('📥 Real-time update received:', data);

        this.widgets.forEach(w => {
          if (w.device_id === data.device_id && w.data_key === data.key) {
            
            if (w.type === 'toggle') {
              w.currentValue = (
                Number(data.value) === 1 || 
                data.value === 'ON' || 
                data.value === true
              );
            } else {
              if (w.data_key === 'state' || w.data_key === 'state_l1') {
                w.currentValue = (Number(data.value) === 1 || data.value === 'ON') ? 'ON' : 'OFF';
              } else {
                w.currentValue = data.value;
              }
            }
            
          }
        });
      });
    },
    toggleMenu(widgetId) {
      this.activeMenu = this.activeMenu === widgetId ? null : widgetId;
    },
    closeMenu() {
      this.activeMenu = null;
    },
    async deleteWidget(widgetId, title) {
      this.activeMenu = null;
      const isConfirm = confirm(`Are you sure you want to delete widget "${title}"?`);
      
      if (isConfirm) {
        try {
          await http.delete(`/dashboards/${this.$route.params.id}/widgets/${widgetId}`);
          this.widgets = this.widgets.filter(w => w.id !== widgetId);
          
        } catch (error) {
          console.error("Failed to delete widget:", error);
          alert('Failed to delete widget.');
        }
      }
    },
    async fetchDeviceDataKeys(deviceId) {
      try {
        const res = await http.get(`/devices/${deviceId}/telemetry/keys`); 
        this.availableDataKeys = res.data;
      } catch (error) {
        console.warn("Could not fetch specific telemetry keys, showing empty suggestion.");
        this.availableDataKeys = ['rssi', 'state', 'brightness', 'temperature', 'humidity', 'linkquality'];
      }
    },
    async editWidget(widget) {
      this.activeMenu = null;
      
      let defaultConfig = {};
      if (widget.type === 'text') defaultConfig = { unit: '' };
      else if (widget.type === 'gauge') defaultConfig = { unit: '', min: -100, max: 100 };
      else if (widget.type === 'slider') defaultConfig = { unit: '', min: 0, max: 100 };
      else if (widget.type === 'graph') defaultConfig = { unit: '', timeRange: '1h', instanceName: '', lineColor: '#3b82f6'};

      this.editWidgetForm = {
        id: widget.id,
        title: widget.title,
        type: widget.type,
        data_key: widget.data_key,
        device_id: widget.device_id,
        config: widget.config && Object.keys(widget.config).length > 0 
                ? { ...defaultConfig, ...widget.config } 
                : { ...defaultConfig }
      };

      await this.fetchDeviceDataKeys(widget.device_id);
      this.showEditWidgetModal = true;
    },
    async saveEditedWidget() {
      try {
        const dashboardId = this.$route.params.id;
        const widgetId = this.editWidgetForm.id;
        
        const payload = {
          title: this.editWidgetForm.title,
          data_key: this.editWidgetForm.data_key,
          config: this.editWidgetForm.config
        };

        await http.put(`/dashboards/${dashboardId}/widgets/${widgetId}`, payload);
        
        const index = this.widgets.findIndex(w => w.id === widgetId);
        if (index !== -1) {
          this.widgets[index].title = payload.title;
          this.widgets[index].data_key = payload.data_key;
          this.widgets[index].config = payload.config;
        }

        this.showEditWidgetModal = false;
        
      } catch (error) {
        console.error("Failed to update widget:", error);
        alert('Failed to update widget.');
      }
    },
    async handleToggle(widget, event) {
        const newValue = event.target.checked; 
        widget.currentValue = newValue; 
        console.log(`Toggling ${widget.title} to:`, newValue);

        try {
          await http.post(`/devices/${widget.device_id}/control`, {
            key: widget.data_key,
            value: newValue
          });
          
        } catch (error) {
          console.error("Failed to send command:", error);
          alert('Failed to control device');
          
          widget.currentValue = !newValue;
          event.target.checked = !newValue;
        }
    },
    async handleSliderControl(widget, newValue) {
      console.log(`Sliding ${widget.title} to:`, newValue);

      widget.currentValue = newValue;

      try {
        await http.post(`/devices/${widget.device_id}/control`, {
          key: widget.data_key,
          value: newValue
        });
      } catch (error) {
        console.error("Failed to send slider command:", error);
        alert('Failed to control device via slider');

        widget.currentValue = !newValue;
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
    triggerToast(message) {
      this.toastMessage = message;
      this.showToast = true;
      
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    async openShareModal() {
      this.showShareModal = true;
      await this.fetchSharedUsers();
    },
    async fetchSharedUsers() {
      try {
        const res = await http.get(`/dashboards/${this.$route.params.id}/shares`);
        this.sharedUsers = res.data;
      } catch (err) {
        console.error("Failed to load shared users", err);
      }
    },
    async shareWithUser() {
      if (!this.newShareEmail) return;
      try {
        await http.post(`/dashboards/${this.$route.params.id}/shares`, {
          email: this.newShareEmail,
          permission: this.newSharePermission
        });
        
        this.newShareEmail = ''; 
        this.triggerToast("Invitation sent!");
        await this.fetchSharedUsers(); 
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to share";
        alert(msg);
      }
    },
    async updatePermission(shareId, newPermission) {
      if (newPermission === 'remove') {
        if (!confirm("Remove access for this user?")) {
          this.fetchSharedUsers(); 
          return;
        }
        try {
          await http.delete(`/dashboards/${this.$route.params.id}/shares/${shareId}`);
          this.triggerToast("Access removed");
          await this.fetchSharedUsers();
        } catch (err) { alert("Failed to remove access"); console.log(err); }
      } else {
        try {
          await http.put(`/dashboards/${this.$route.params.id}/shares/${shareId}`, { permission: newPermission });
          this.triggerToast("Permission updated");
        } catch (err) { alert("Failed to update permission"); console.log(err); }
      }
    }
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

.widget-menu {
  top: 30px;
  right: 0;
}

.action-wrapper {
  position: relative;
  display: flex;
}

.action-menu { 
  position: absolute; 
  top: 100%; 
  right: 0; 
  background: white; 
  border: 1px solid #e2e8f0; 
  border-radius: 8px; 
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); 
  display: flex; 
  flex-direction: column; 
  min-width: 140px; 
  z-index: 10; 
  overflow: hidden; 
}
.action-menu button { background: none; border: none; padding: 10px 16px; text-align: left; cursor: pointer; font-size: 13px; font-weight: 500; color: #374151; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-family: inherit; }
.action-menu button:hover { background-color: #f1f5f9; }
.danger-text { color: #ef4444 !important; }
.danger-text:hover { background-color: #fef2f2 !important; }
/* Setting Cards */
.setting-area { display: flex; flex-direction: column; gap: 24px; }
.setting-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
.section-title { font-size: 16px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.mb-24 { margin-bottom: 24px; }
.mb-16 { margin-bottom: 16px; }
.mt-16 { margin-top: 16px; }

/* Table overrides for settings */
.table-container { background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }

.table-header, .table-row { 
  display: grid;
  grid-template-columns: 3fr 2fr 60px; 
  align-items: center;
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
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 0px; }
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
.close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; border-radius: 50%; transition: 0.2s; }
.close-btn:hover { background: #f3f4f6; color: #111827; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; display: flex; justify-content: flex-end; gap: 12px; }

/* The Switch - The box around the slider */
.switch { position: relative; display: inline-block; width: 60px; height: 34px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: #10b981; }
input:focus + .slider { box-shadow: 0 0 1px #10b981; }
input:checked + .slider:before { transform: translateX(26px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }

/* 🟢 Share Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.share-modal { background: white; width: 500px; border-radius: 12px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h2 { margin: 0; font-size: 20px; color: #111827; }
.close-btn { background: none; border: none; cursor: pointer; color: #6b7280; }
.share-input-area { display: flex; gap: 10px; margin-bottom: 20px; }
.share-input-area input { flex: 1; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit;}
.share-input-area select { padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb; }
.divider { border: 0; }
h3 { font-size: 14px; color: #4b5563; margin-bottom: 16px; }

.shared-users-list { max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.user-row { display: flex; justify-content: space-between; align-items: center; }
.user-info { display: flex; align-items: center; gap: 12px; }
.avatar { width: 40px; height: 40px; background: #3b82f6; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
.bg-gray { background: #9ca3af; }
.u-name { margin: 0; font-weight: 600; font-size: 14px; color: #111827; }
.u-email { margin: 0; font-size: 12px; color: #6b7280; font-family: inherit;}
.role-text { font-size: 14px; color: #6b7280; font-style: italic; }
.role-select { border: 0.5px solid #d1d5db; border-radius: 10%; background: transparent; font-family: inherit; font-size: 14px; color: #374151; cursor: pointer; padding: 10px; border-radius: 4px; }
.role-select:hover { background-color: #f3f4f6; border-color: #d1d5db;}
.role-select option { border: 0.5px solid #d1d5db; border-radius: 10%; background: transparent; font-family: inherit; font-size: 14px; color: #374151; cursor: pointer; padding: 10px; border-radius: 4px; }
.text-red { color: #ef4444; }
.add-btn { background: #111827; border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: 0.2s; font-family: inherit; }
.add-btn:hover { background: #374151; }

.modal-footer { display: flex; justify-content: center; }
.done-btn { background: #4E8DDF; color: white; border: none; font-family: inherit; padding: 10px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; }
.done-btn:hover { background: #3a6bc1;transition: 0.2s;}

.toast-notification { position: fixed; bottom: 40px; right: 40px; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 9999; font-weight: 600; font-size: 14px; }
.toast-notification .material-symbols-outlined { font-size: 22px; color: #10b981; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }

@keyframes slideInUp {
  0% { transform: translateY(100px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>