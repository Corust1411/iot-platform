<template>
  <div class="app-wrapper">
    <TopBar :username="username" />

    <div class="layout">
      <SideNav />

      <div class="content">
        <div class="page-header">
          <button class="back-btn" @click="$router.push('/managedevice')">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="page-title">{{ device.name || 'Loading...' }}</h1>
        </div>

        <div class="detail-card">
          
          <div v-if="isLoading" class="loading-state">Loading device data...</div>
          
          <div v-else class="detail-sections">
            
            <div class="section-block">
              <h2 class="section-title">Device status</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Device Name</span>
                  <span class="info-value">{{ device.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Category</span>
                  <span class="info-value badge">{{ device.category }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">Description</span>
                  <span class="info-value description-text">{{ device.description || 'No description provided.' }}</span>
                </div>
              </div>
            </div>

            <div class="section-block">
              <h2 class="section-title">MQTT Configuration</h2>
              <div class="info-item full-width">
                <span class="info-label">Topic Path</span>
                <div class="topic-box">
                  <span class="topic-text">{{ mqttTopic }}</span>
                  <button class="icon-btn copy-btn" @click="copyTopic" title="Copy Topic">
                    <span class="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="section-block">
              <h2 class="section-title">Protocol Setting ({{ (device.protocol || '').toUpperCase() }})</h2>
              
              <div class="info-grid config-grid">
                
                <template v-if="device.protocol === 'wifi'">
                  <div class="info-item">
                    <span class="info-label">MAC Address</span>
                    <div class="info-value-group">
                      <span class="info-value code-font">{{ device.config?.macAddress || '-' }}</span>
                      <button v-if="device.config?.macAddress" class="icon-btn copy-btn-small" @click="copyText(device.config.macAddress)" title="Copy MAC Address">
                        <span class="material-symbols-outlined">content_copy</span>
                      </button>
                    </div>
                  </div>
                </template>

                <template v-else-if="device.protocol === 'zigbee'">
                  <div class="info-item">
                    <span class="info-label">Pairing Status</span>
                    <span class="info-value">Paired</span>
                  </div>
                </template>

                <template v-else-if="device.protocol === 'lorawan'">
                  <div class="info-item">
                    <span class="info-label">DevEUI</span>
                    <div class="info-value-group">
                      <span class="info-value code-font">{{ device.config?.devEui || '-' }}</span>
                      <button v-if="device.config?.devEui" class="icon-btn copy-btn-small" @click="copyText(device.config.devEui)" title="Copy DevEUI">
                        <span class="material-symbols-outlined">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="info-item">
                    <span class="info-label">JoinEUI / AppEUI</span>
                    <div class="info-value-group">
                      <span class="info-value code-font">{{ device.config?.joinEui || '-' }}</span>
                      <button v-if="device.config?.joinEui" class="icon-btn copy-btn-small" @click="copyText(device.config.joinEui)" title="Copy JoinEUI">
                        <span class="material-symbols-outlined">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="info-item full-width">
                    <span class="info-label">AppKey</span>
                    <div class="info-value-group">
                      <span class="info-value code-font">{{ device.config?.appKey || '-' }}</span>
                      <button v-if="device.config?.appKey" class="icon-btn copy-btn-small" @click="copyText(device.config.appKey)" title="Copy AppKey">
                        <span class="material-symbols-outlined">content_copy</span>
                      </button>
                    </div>
                  </div>
                </template>

              </div>
            </div>

            <div class="footer-action">
              <button class="edit-btn">
                Edit Device
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import SideNav from '@/components/SideNav.vue'
import { http } from '@/api/http'

export default {
  components: { TopBar, SideNav },
  data() {
    return {
      username: 'Unknown User',
      isLoading: true,
      device: {
        id: null,
        name: '',
        category: '',
        description: '',
        protocol: '',
        config: {}
      }
    }
  },
  computed: {
    mqttTopic() {
      if (!this.device.name) return '';
      const protocol = (this.device.protocol || 'unknown').toLowerCase();
      const category = (this.device.category || 'unknown').toLowerCase();
      const deviceName = this.device.name.toLowerCase().replace(/\s+/g, '_');
      
      return `multi_platform/gw/${protocol}/${category}/${deviceName}`;
    }
  },
  async mounted() {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      this.username = storedUser;
    }
    
    const deviceId = this.$route.params.id;
    if (deviceId) {
      await this.fetchDeviceDetail(deviceId);
    } else {
      this.isLoading = false;
    }
  },
  methods: {
    async fetchDeviceDetail(id) {
      this.isLoading = true;
      try {
        const res = await http.get(`/devices/${id}`);
        
        this.device = {
          id: res.data.id,
          name: res.data.name || 'Unnamed Device',
          category: res.data.category || '-',
          description: res.data.description || 'No description provided.',
          protocol: res.data.protocol || '',
          config: res.data.config || {} 
        };
        
        this.isLoading = false;
      } catch (error) {
        console.error("Error fetching device details:", error);
        alert("Failed to load device data or Device not found.");
        this.isLoading = false;
        this.$router.push('/managedevice'); 
      }
    },
    async copyText(text) {
      if (!text || text === '-') return;
      try {
        await navigator.clipboard.writeText(text);
        alert('Copied: ' + text);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    },
    async copyTopic() {
      this.copyText(this.mqttTopic);
    }
  }
}
</script>

<style scoped>
.app-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; }
.layout { display: flex; min-height: calc(100vh - 64px); }
.content { flex: 1; padding: 32px 40px; background: #f8fafc; }

/* Header */
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; margin: 0; color: #486284; }
.back-btn { border: none; background: none; cursor: pointer; display: flex; align-items: center; color: #FF4B4A; padding: 0; transition: transform 0.2s; }
.back-btn:hover { transform: translateX(-3px); }

/* Main Card */
.detail-card {
  background: #ffffff;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  width: 80%;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-weight: 600;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Sections */
.section-block {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 24px;
}
.section-block:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.config-grid {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.info-value-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn-small {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af; /* สีเทาอ่อน */
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
}

.copy-btn-small:hover {
  background-color: #c7ced6;
  color: #FF4B4A; 
}

.copy-btn-small .material-symbols-outlined {
  font-size: 18px;
}

.description-text {
  color: #4b5563;
  line-height: 1.5;
}

.code-font {
  font-family: 'Courier New', Courier, monospace;
  background-color: #e5e7eb;
  padding: 4px 8px;
  border-radius: 6px;
}

.badge {
  background-color: #e0e7ff;
  color: #4338ca;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
  text-transform: capitalize;
}

/* MQTT Topic Box */
.topic-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #e5e7eb;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #486284;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: 0.2s;
}
.copy-btn:hover {
  background-color: #c7ced6;
  color: #FF4B4A;
}

/* Edit Button */
.footer-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.edit-btn {
  background: #486284;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s, background-color 0.2s;
}

.edit-btn:hover {
  background: #324766;
  transform: translateY(-2px);
}
</style>