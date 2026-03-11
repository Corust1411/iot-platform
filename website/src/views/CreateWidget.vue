<template>
  <div class="app-wrapper">
    <TopNavBar :username="username" />

    <div class="layout">
      <SideNavBar />

      <div class="content">
        <div class="page-header">
          <button class="back-btn" @click="goBack">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="page-title">Create New Widget</h1>
        </div>

        <div class="widget-card-form">
          <h2 class="section-title">Widget Configuration</h2>
          
          <div class="form-section">
            
            <div class="form-group">
              <label>Select Linked Device <span class="required">*</span></label>
              <select v-model="form.device_id" @change="onDeviceSelected" :class="{ 'error-border': showError && !form.device_id }">
                <option value="" disabled>-- Choose a device --</option>
                <option v-for="dev in linkedDevices" :key="dev.device_id" :value="dev.device_id">
                  {{ dev.alias || dev.device_name }} ({{ dev.category || 'unknown' }})
                </option>
              </select>
              <span v-if="showError && !form.device_id" class="error-text">Please select a device</span>
            </div>

            <div class="form-group" v-if="form.device_id">
              <label>Widget Type <span class="required">*</span></label>
              <select v-model="form.type" :class="{ 'error-border': showError && !form.type }">
                <option value="" disabled>-- Select type --</option>
                <option v-for="wt in availableWidgetTypes" :key="wt.value" :value="wt.value">
                  {{ wt.label }}
                </option>
              </select>
            </div>

            <div class="form-row" v-if="form.type">
              <div class="form-group half-width">
                <label>Widget Title <span class="required">*</span></label>
                <input type="text" v-model="form.title" placeholder="e.g. Living Room Temp" :class="{ 'error-border': showError && !form.title }" />
              </div>

              <div class="form-group half-width">
                <label>Parameter (Data Key) <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.data_key" 
                  list="telemetry-keys" 
                  placeholder="e.g. temperature" 
                  :class="{ 'error-border': showError && !form.data_key }" 
                />
                <datalist id="telemetry-keys">
                  <option v-for="key in recentKeys" :key="key" :value="key"></option>
                </datalist>
                <span class="hint-text">Type manually or select from recent data.</span>
              </div>
            </div>

            <template v-if="form.type">
              <h3 class="subsection-title mt-16">Display Settings</h3>
              
              <div class="form-row">
                <div class="form-group half-width" v-if="['text', 'gauge', 'chart', 'slider'].includes(form.type)">
                  <label>Unit (Optional)</label>
                  <input type="text" v-model="form.config.unit" placeholder="e.g. °C, %, Lux" />
                </div>

                <div class="form-group half-width" v-if="['gauge', 'slider'].includes(form.type)">
                  <div class="form-row">
                    <div class="form-group half-width">
                      <label>Min Value</label>
                      <input type="number" v-model.number="form.config.min" placeholder="0" />
                    </div>
                    <div class="form-group half-width">
                      <label>Max Value</label>
                      <input type="number" v-model.number="form.config.max" placeholder="100" />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div class="form-actions mt-24">
              <button class="cancel-btn" @click="goBack">Cancel</button>
              <button class="save-btn" @click="submitWidget">Create Widget</button>
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
      dashboardId: null,
      linkedDevices: [],
      recentKeys: [], // เก็บ Parameter ที่ดึงมาจาก DB
      showError: false,
      form: {
        device_id: '',
        type: '',
        title: '',
        data_key: '',
        config: {
          unit: '',
          min: 0,
          max: 100
        }
      }
    }
  },
  computed: {
    // กรองประเภท Widget ตาม Category ของอุปกรณ์
    availableWidgetTypes() {
      const selectedDevice = this.linkedDevices.find(d => d.device_id === this.form.device_id);
      if (!selectedDevice) return [];

      const cat = (selectedDevice.category || '').toLowerCase();
      
      // ถ้าเป็น Sensor (วัดค่าอย่างเดียว)
      if (cat === 'sensor') {
        return [
          { value: 'text', label: 'Text Display' },
          { value: 'gauge', label: 'Gauge Meter' },
          { value: 'chart', label: 'Line Chart' },
          { value: 'indicator', label: 'Status Indicator' }
        ];
      } 
      // ถ้าเป็น Actuator หรืออื่นๆ (สั่งงานได้)
      else {
        return [
          { value: 'text', label: 'Text Display' },
          { value: 'toggle', label: 'Toggle Switch' },
          { value: 'button', label: 'Push Button' },
          { value: 'slider', label: 'Slider' },
          { value: 'indicator', label: 'Status Indicator' }
        ];
      }
    }
  },
  async mounted() {
    const storedUser = localStorage.getItem('username');
    if (storedUser) this.username = storedUser;

    this.dashboardId = this.$route.params.id;
    if (this.dashboardId) {
      await this.fetchLinkedDevices();
    }
  },
  methods: {
    goBack() {
      this.$router.push(`/dashboard/${this.dashboardId}`);
    },
    async fetchLinkedDevices() {
      try {
        const res = await http.get(`/dashboards/${this.dashboardId}/devices`);
        this.linkedDevices = res.data;
      } catch (error) {
        console.error("Error fetching linked devices:", error);
      }
    },
    async onDeviceSelected() {
      this.form.type = '';
      this.form.data_key = '';
      this.recentKeys = [];

      try {
        const res = await http.get(`/devices/${this.form.device_id}/keys`);
        this.recentKeys = res.data;
      } catch (error) {
        console.warn("Could not fetch recent keys, user can type manually.");
      }
    },
    async submitWidget() {
      if (!this.form.device_id || !this.form.type || !this.form.title || !this.form.data_key) {
        this.showError = true;
        return;
      }
      this.showError = false;

      let finalConfig = { unit: this.form.config.unit };
      if (['gauge', 'slider'].includes(this.form.type)) {
        finalConfig.min = this.form.config.min;
        finalConfig.max = this.form.config.max;
      }

      const payload = {
        ...this.form,
        config: finalConfig
      };

      try {
        await http.post(`/dashboards/${this.dashboardId}/widgets`, payload);
        alert('Widget created successfully!');
        this.goBack();
      } catch (error) {
        console.error("Error creating widget:", error);
        alert('Failed to create widget.');
      }
    }
  }
}
</script>

<style scoped>
.form-section { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: flex; gap: 20px; }
.half-width { flex: 1; }

.form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
label { font-weight: 600; font-size: 14px; color: #374151; }
.required { color: #ef4444; }

input, select { 
  padding: 10px 14px; 
  border-radius: 8px; 
  border: 1px solid #d1d5db; 
  font-size: 14px; 
  font-family: inherit; 
  transition: border-color 0.2s;
  outline: none;
}
input:focus, select:focus { border-color: #111827; }

.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; margin-top: -4px; }

/* Password Input with eye icon */
.input-with-actions { position: relative; display: flex; align-items: center; width: 100%; }
.input-with-actions input { width: 100%; padding-right: 40px; box-sizing: border-box; }
.input-actions { position: absolute; right: 12px; display: flex; align-items: center; }
.action-icon { font-size: 20px; color: #9ca3af; cursor: pointer; transition: color 0.2s ease; }
.action-icon:hover { color: #111827; }

/* Buttons */
.form-actions { display: flex; justify-content: flex-end; gap: 12px; }
.form-actions.space-between { justify-content: space-between; }

.cancel-btn { 
  border: 1px solid #d1d5db; 
  background: white; 
  color: #4b5563; 
  padding: 10px 24px; 
  border-radius: 20px; 
  cursor: pointer; 
  font-family: inherit; 
  font-weight: 600;
  transition: 0.2s; 
}
.cancel-btn:hover { background: #f3f4f6; }

.create-btn { 
  background: #10b981; 
  color: white; 
  border: none; 
  padding: 10px 24px; 
  border-radius: 20px; 
  cursor: pointer; 
  font-family: inherit; 
  font-weight: 600;
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); 
  transition: 0.2s;
}
.create-btn:hover { background: #059669; }
/* (นำ CSS โครงสร้างพื้นฐานของ layout, form, button จากไฟล์อื่นๆ มาแปะตรงนี้ได้เลยครับ เหมือนหน้า RegisterAccount เลย) */

.app-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; }
.layout { display: flex; min-height: calc(100vh - 64px); }
.content { flex: 1; padding: 32px 40px; background: #f8fafc; }

.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; margin: 0; color: #486284; }
.back-btn { border: none; background: none; cursor: pointer; display: flex; align-items: center; color: #FF4B4A; padding: 0; transition: transform 0.2s; }
.back-btn:hover { transform: translateX(-3px); }

.widget-card-form { background: #ffffff; padding: 32px 40px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 800px; }
.section-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.subsection-title { font-size: 15px; font-weight: 600; color: #4b5563; margin-bottom: 16px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 8px; }

.form-section { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: flex; gap: 20px; }
.half-width { flex: 1; }
.form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }

label { font-weight: 600; font-size: 14px; color: #374151; }
.required { color: #ef4444; }
.hint-text { font-size: 11px; color: #9ca3af; margin-top: -4px; }

input, select { padding: 10px 14px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; font-family: inherit; transition: border-color 0.2s; outline: none; background: #fff; }
input:focus, select:focus { border-color: #111827; }
.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; margin-top: -4px; }

.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; }
.cancel-btn { border: 1px solid #d1d5db; background: white; color: #4b5563; padding: 10px 24px; border-radius: 20px; cursor: pointer; font-family: inherit; font-weight: 600; transition: 0.2s; }
.cancel-btn:hover { background: #f3f4f6; }
.save-btn { background: #10b981; color: white; border: none; padding: 10px 24px; border-radius: 20px; cursor: pointer; font-family: inherit; font-weight: 600; transition: 0.2s; }
.save-btn:hover { background: #059669; }
</style>