<template>
  <div class="app-wrapper">
    <TopNavBar :username="username" />

    <div class="layout">
      <SideBarNav />

      <div class="content">
        <div class="page-header">
          <button class="back-btn" @click="$router.push('/managedevice')">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="page-title">Register device</h1>
        </div>

        <div class="register-card">

          <div class="steps">
            <span 
              :class="{ active: step === 1 }" 
              @click="goToStep(1)"
            >
              General
            </span>
            <span 
              :class="{ active: step === 2 }" 
              @click="goToStep(2)"
            >
              Protocol
            </span>
            <span 
              :class="{ active: step === 3 }" 
              @click="goToStep(3)"
            >
              Detail
            </span>
          </div>

          <div v-if="step === 1" class="form-section">
            <div class="form-group">
              <label>Device name <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="form.name" 
                :class="{ 'error-border': showError && !form.name }"
              />
              <span v-if="showError && !form.name" class="error-text">Name is required</span>
            </div>

            <div class="form-group">
              <label>Category <span class="required">*</span></label>
              <select 
                v-model="form.category"
                :class="{ 'error-border': showError && !form.category }"
              >
                <option value="">Select category</option>
                <option value="sensor">Sensor</option>
                <option value="light">Light</option>
                <option value="camera">Camera</option>
              </select>
              <span v-if="showError && !form.category" class="error-text">Category is required</span>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="form.description"
                placeholder="add description here.."
              ></textarea>
            </div>

            <div class="form-actions space-between">
              <button class="cancel-btn" @click="$router.push('/managedevice')">cancel</button>
              <button class="next-btn" @click="handleNext">next</button>
            </div>
          </div>

          <div v-if="step === 2" class="protocol-section">
            <h3 class="protocol-title">Select Device Protocol</h3>
            
            <span v-if="showError && !form.protocol" class="error-text block-error">Please select a protocol</span>

            <div class="protocol-grid">
              <div 
                class="protocol-card"
                :class="{ selected: form.protocol === 'wifi' }"
                @click="selectProtocol('wifi')"
              >
                <a><img src="\image\wifi.png" width="70px" height="auto" /></a>
                <p>Wi-Fi</p>
              </div>

              <div 
                class="protocol-card"
                :class="{ selected: form.protocol === 'zigbee' }"
                @click="selectProtocol('zigbee')"
              >
                <a><img src="\image\zigbee.png" width="70px" height="auto" /></a>
                <p>Zigbee</p>
              </div>

              <div 
                class="protocol-card"
                :class="{ selected: form.protocol === 'lorawan' }"
                @click="selectProtocol('lorawan')"
              >
                <a><img src="\image\lorawan.png" width="70px" height="100%" /></a>
                <p>LoRaWAN</p>
              </div>
            </div>

            <div class="form-actions space-between">
              <button class="cancel-btn" @click="step = 1">back</button>
              <button class="next-btn" @click="handleNext">next</button>
            </div>
          </div>

          <div v-if="step === 3" class="detail-section">
            
            <div v-if="form.protocol === 'wifi'" class="config-layout-split">
              <div class="config-left">
                <h3 class="config-header">Wi-Fi device configuration</h3>
                <div class="form-group">
                  <label>MAC Address <span class="required">*</span></label>
                  <input 
                    type="text" 
                    v-model="form.macAddress" 
                    :class="{ 'error-border': showError && !form.macAddress }"
                  />
                  <span v-if="showError && !form.macAddress" class="error-text">MAC Address is required</span>
                </div>
              </div>
              <div class="config-right">
                <div class="warning-box box-red">
                  <span class="material-symbols-outlined warning-icon">warning</span>
                  <div>
                    To connect device with gateway, Please ensure your device and gateway are on the same Wi-Fi network before creating it.
                    <br /><br />
                    Current network SSID : <strong>KMITL-IOT</strong>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="form.protocol === 'zigbee'" class="config-layout-stack">
              <div class="config-top-row">
                <h3 class="config-header">Zigbee device configuration</h3>
                <div class="warning-box box-red">
                  <span class="material-symbols-outlined warning-icon">warning</span>
                  Make sure to enable Pairing Mode on your Zigbee device.
                </div>
              </div>
              
              <div class="zigbee-scan-container">
                <div class="scan-header">
                  <div>
                    <h4 class="scan-title">Discover Zigbee Devices</h4>
                    <p class="scan-subtitle">Put your device in pairing mode and click scan.</p>
                  </div>
                  <div class="scan-actions">
                    <button class="btn-secondary" @click="fetchZigbeeDevices" :disabled="isScanning">
                      <span class="material-symbols-outlined">refresh</span>
                    </button>
                    <button class="next-btn" style="border-radius: 8px;" @click="scanZigbee" :disabled="isScanning">
                      <span class="material-symbols-outlined" :class="{ 'spin-anim': isScanning }">sensors</span>
                      {{ isScanning ? `Scanning (${scanCountdown}s)...` : 'Scan New Device' }}
                    </button>
                  </div>
                </div>

                <div class="device-list-box">
                  <div v-if="isLoadingZigbee" class="empty-state-small">Loading devices...</div>
                  <div v-else-if="zigbeeDevices.length === 0" class="empty-state-small">
                    No new devices found. Try scanning again.
                  </div>
                  
                  <table v-else class="zigbee-table">
                    <thead>
                      <tr>
                        <th>Device Name</th>
                        <th>Vendor</th>
                        <th>Model</th>
                        <th class="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="zDev in zigbeeDevices" :key="zDev.ieeeAddr">
                        <td>
                          <div class="z-name">{{ zDev.friendlyName }}</div>
                          <div class="z-ieee code-font">{{ zDev.ieeeAddr }}</div>
                        </td>
                        <td><span class="badge-gray">{{ zDev.vendor }}</span></td>
                        <td><span class="z-model">{{ zDev.model_id }}</span></td>
                        <td class="text-right">
                          <button 
                            class="add-dev-btn" 
                            :class="{ 'selected-btn': form.ieeeAddr === zDev.ieeeAddr }"
                            @click="selectZigbeeDevice(zDev)"
                          >
                            {{ form.ieeeAddr === zDev.ieeeAddr ? 'Deselect' : 'Add' }}
                          </button>
                        </td>
                        
                      </tr>
                    </tbody>
                  </table>
                </div>
                <span v-if="showError && !form.ieeeAddr" class="error-text block-error" style="margin-top: 16px; text-align: left;">
                  Please select a Zigbee device from the list above.
                </span>
              </div>
            </div>

            <div v-else-if="form.protocol === 'lorawan'" class="config-layout-stack">
              <div class="config-top-row">
                <h3 class="config-header">LoRaWAN device configuration</h3>
                <div class="warning-box box-red">
                  <span class="material-symbols-outlined warning-icon">warning</span>
                  Don't forget to configure these value in your LoRaWAN Device
                </div>
              </div>
              
              <div class="lorawan-input-row">
                
                <div class="form-group">
                  <label>DevEUI <span class="required">*</span></label>
                  <div class="input-with-actions">
                    <input type="text" v-model="form.devEui" :class="{ 'error-border': showError && !form.devEui }" />
                    <div class="input-actions">
                      <span class="material-symbols-outlined action-icon" @click="generate16Hex('devEui')" title="Generate">autorenew</span>
                      <span class="material-symbols-outlined action-icon" @click="copyText(form.devEui)" title="Copy">content_copy</span>
                    </div>
                  </div>
                  <span v-if="showError && !form.devEui" class="error-text">DevEUI is required</span>
                </div>

                <div class="form-group">
                  <label>JoinEUI/AppEUI <span class="required">*</span></label>
                  <div class="input-with-actions">
                    <input type="text" v-model="form.joinEui" :class="{ 'error-border': showError && !form.joinEui }" />
                    <div class="input-actions">
                      <span class="material-symbols-outlined action-icon" @click="generate16Hex('joinEui')" title="Generate">autorenew</span>
                      <span class="material-symbols-outlined action-icon" @click="copyText(form.joinEui)" title="Copy">content_copy</span>
                    </div>
                  </div>
                  <span v-if="showError && !form.joinEui" class="error-text">JoinEUI is required</span>
                </div>

                <div class="form-group">
                  <label>AppKey <span class="required">*</span></label>
                  <div class="input-with-actions">
                    <input type="text" v-model="form.appKey" :class="{ 'error-border': showError && !form.appKey }" />
                    <div class="input-actions">
                      <span class="material-symbols-outlined action-icon" @click="generate32Hex('appKey')" title="Generate">autorenew</span>
                      <span class="material-symbols-outlined action-icon" @click="copyText(form.appKey)" title="Copy">content_copy</span>
                    </div>
                  </div>
                  <span v-if="showError && !form.appKey" class="error-text">AppKey is required</span>
                </div>

              </div>
            </div>

            <div class="form-actions space-between" style="margin-top: 40px;">
              <button class="cancel-btn" @click="step = 2">back</button>
              <button class="create-btn" @click="submitDevice">Create</button>
            </div>
          </div>

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
import Bar from '@/components/Bar.vue'
import { http } from '@/api/http'

export default {
  components: { TopNavBar, Bar },
  data() {
    return {
      username: 'Unknown User',
      step: 1,
      showError: false,
      showToast: false,
      toastMessage: '',
      form: {
        name: '',
        category: '',
        description: '',
        protocol: '',
        macAddress: '',
        devEui: '',
        joinEui: '',
        appKey: '',
        ieeeAddr: '' // เพิ่มมารองรับ Zigbee
      },
      // ตัวแปรสำหรับ Zigbee Scan
      zigbeeDevices: [],
      isLoadingZigbee: false,
      isScanning: false,
      scanCountdown: 0,
      scanTimer: null,
    }
  },
  mounted() {
    const storedUser = localStorage.getItem('username')
    if (storedUser) {
      this.username = storedUser
    }
  },
  beforeUnmount() {
    // ล้างเวลาทิ้งเมื่อออกจากหน้า
    if (this.scanTimer) clearInterval(this.scanTimer);
  },
  methods: {
    selectProtocol(type) {
      this.form.protocol = type
      this.showError = false
    },
    handleNext() {
      if (this.step === 1) {
        if (!this.form.name.trim() || !this.form.category) {
          this.showError = true
          return
        }
      } else if (this.step === 2) {
        if (!this.form.protocol) {
          this.showError = true
          return
        }
        // ถ้าเป็น Zigbee ให้โหลดข้อมูลเลยตอนกด Next
        if (this.form.protocol === 'zigbee' && this.zigbeeDevices.length === 0) {
          this.fetchZigbeeDevices();
        }
      }
      this.showError = false
      this.step++
    },
    goToStep(targetStep) {
      if (targetStep > this.step) {
        if (this.step === 1 && (!this.form.name.trim() || !this.form.category)) {
          this.showError = true
          return
        }
        if (targetStep === 3 && !this.form.protocol) {
          this.showError = true
          return
        }
      }
      this.step = targetStep
      this.showError = false
      
      if (this.step === 3 && this.form.protocol === 'zigbee' && this.zigbeeDevices.length === 0) {
        this.fetchZigbeeDevices();
      }
    },
    // --- Zigbee Methods ---
    async scanZigbee() {
      this.isScanning = true;
      this.scanCountdown = 60;
      
      try {
        await http.post('/devices/zigbee/permit-join');
        this.triggerToast('Pairing mode enabled. Please activate your device.');
        
        this.scanTimer = setInterval(() => {
          this.scanCountdown--;
          if (this.scanCountdown <= 0) {
            this.stopScan();
          }
        }, 1000);

      } catch (error) {
        console.error("Failed to start scan:", error);
        alert("Failed to enable pairing mode.");
        this.stopScan();
      }
    },
    stopScan() {
      this.isScanning = false;
      clearInterval(this.scanTimer);
      this.fetchZigbeeDevices(); // โหลดข้อมูลอัตโนมัติเมื่อครบเวลา
    },
    async fetchZigbeeDevices() {
      this.isLoadingZigbee = true;
      try {
        const res = await http.get('/devices/zigbee/discover');
        this.zigbeeDevices = res.data.devices || []; 
      } catch (error) {
        console.error("Failed to fetch zigbee devices:", error);
      } finally {
        this.isLoadingZigbee = false;
      }
    },
    selectZigbeeDevice(zDevice) {
      // ดักจับว่าถ้ากดปุ่มของอุปกรณ์ตัวเดิมที่เลือกไว้อยู่แล้ว ให้เคลียร์ค่าทิ้ง (Deselect)
      if (this.form.ieeeAddr === zDevice.ieeeAddr) {
        this.form.ieeeAddr = ''; 
        this.triggerToast('Device deselected.');
      } 
      // ถ้ากดยังอุปกรณ์ตัวใหม่ ให้เลือกอุปกรณ์นั้น (Select)
      else {
        this.form.ieeeAddr = zDevice.ieeeAddr;
        if (!this.form.name.trim()) {
          this.form.name = zDevice.friendlyName; 
        }
        this.triggerToast(`${zDevice.friendlyName} selected!`);
        this.showError = false;
      }
    },
    // -----------------------
    async submitDevice() {
      // Validate ก่อน Submit
      if (this.form.protocol === 'wifi') {
        if (!this.form.macAddress.trim()) {
          this.showError = true; return;
        }
      } else if (this.form.protocol === 'lorawan') {
        if (!this.form.devEui.trim() || !this.form.joinEui.trim() || !this.form.appKey.trim()) {
          this.showError = true; return;
        }
      } else if (this.form.protocol === 'zigbee') {
        if (!this.form.ieeeAddr.trim()) {
          this.showError = true; return;
        }
      }
      this.showError = false;

      // จัดเตรียม Config Data
      const configData = {};
      if (this.form.protocol === 'wifi') {
        configData.macAddress = this.form.macAddress;
      } else if (this.form.protocol === 'lorawan') {
        configData.devEui = this.form.devEui;
        configData.joinEui = this.form.joinEui;
        configData.appKey = this.form.appKey;
      } else if (this.form.protocol === 'zigbee') {
        configData.ieeeAddr = this.form.ieeeAddr;
      }

      const payload = {
        name: this.form.name,
        category: this.form.category,
        description: this.form.description,
        protocol: this.form.protocol,
        config: configData
      };

      try {
        await http.post('/devices', payload);
        this.$router.push('/managedevice'); 
      } catch (err) {
        console.error('Failed to create device:', err);
        const errorMsg = err.response?.data?.message || 'Unknown error occurred';
        alert(`Error: ${errorMsg}`);
      }
    },
    generate16Hex(field) {
      const hexString = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      this.form[field] = hexString;
    },
    generate32Hex(field) {
      const hexString = [...Array(32)].map(() => Math.floor(Math.random() * 32).toString(32)).join('').toUpperCase();
      this.form[field] = hexString;
    },
    async copyText(text) {
      if (!text || text === '-') return;
      try {
        await navigator.clipboard.writeText(text);
        this.triggerToast('Text copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy', err);
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
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; margin: 0; color: #486284; }
.back-btn { border: none; background: none; cursor: pointer; display: flex; align-items: center; color: #FF4B4A; padding: 0; }
.register-card { background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

.steps { display: flex; width: 100%; border-bottom: 2px solid #e5e7eb; margin-bottom: 32px; }
.steps span { flex: 1; text-align: center; padding: 12px 0; font-weight: 600; color: #9ca3af; cursor: pointer; position: relative; }
.steps .active { color: #000; }
.steps .active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background-color: #000; }

.form-section { display: flex; flex-direction: column; gap: 20px;}
.form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 60vh; }
label { font-weight: 600; font-size: 14px; color: #374151; }
.required { color: #ef4444; }
input, select, textarea { padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px; font-family: inherit; }
textarea { min-height: 80px; resize: none; }
.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; }
.block-error { display: block; text-align: center; margin-bottom: 16px; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.form-actions.space-between { justify-content: space-between; }
.cancel-btn { border: 1px solid #FF4B4A; background: white; color: #FF4B4A; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-family: inherit; }
.cancel-btn:hover { background: #FF4B4A; color: white; transition: 0.2s; }
.next-btn { background: #FF4B4A; color: white; border: none; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2); }
.next-btn:hover { background: #fb3131; }
.next-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.create-btn { background: #10b981; color: white; border: none; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
.create-btn:hover { background: #059669; }
.btn-secondary { background-color: white; border: 1px solid #cbd5e1; color: #475569; padding: 6px 12px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; font-family: inherit;}
.btn-secondary:hover:not(:disabled) { background-color: #f1f5f9; }

.protocol-section, .detail-section { display: flex; flex-direction: column; }
.protocol-title { font-size: 18px; font-weight: 600; margin-bottom: 24px; color: #374151; text-align: center; }
.protocol-grid { display: flex; justify-content: center; gap: 24px; margin-bottom: 30px; }
.protocol-card { width: 180px; height: 150px; background: #DEE5ED; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; transition: 0.2s ease; }
.protocol-card:hover { background: #aab2bb; }
.protocol-card.selected { background: #aab2bb; }

.config-header { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 16px 0; }
.config-layout-split { display: flex; gap: 32px; }
.config-left { flex: 1; }
.config-right { flex: 1; }
.config-layout-stack { display: flex; flex-direction: column; gap: 20px; }
.config-top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.lorawan-input-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

.warning-box { padding: 16px; border-radius: 8px; font-size: 13px; line-height: 1.5; display: flex; align-items: flex-start; gap: 12px; }
.warning-icon { font-size: 20px; }
.box-red { background-color: #fef2f2; border: 1px solid #fecaca; color: #ef4444; }

.input-with-actions { position: relative; display: flex; align-items: center; width: 100%; }
.input-with-actions input { width: 100%; padding-right: 64px; box-sizing: border-box; }
.input-actions { position: absolute; right: 10px; display: flex; gap: 8px; }
.action-icon { font-size: 18px; color: #9ca3af; cursor: pointer; transition: color 0.2s ease; }
.action-icon:hover { color: #FF4B4A; }

/* Zigbee Specific CSS */
.zigbee-scan-container {
  background-color: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}
.scan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.scan-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; }
.scan-subtitle { font-size: 13px; color: #64748b; margin: 0; }
.scan-actions { display: flex; gap: 8px; align-items: center; }

.device-list-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.empty-state-small { text-align: center; padding: 30px; color: #94a3b8; font-size: 14px; }
.zigbee-table { width: 100%; border-collapse: collapse; text-align: left; }
.zigbee-table th { background-color: #f8fafc; padding: 12px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; }
.zigbee-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
.zigbee-table tr:last-child td { border-bottom: none; }
.zigbee-table tr:hover { background-color: #f1f5f9; }

.z-name { font-weight: 600; color: #0f172a; font-size: 14px; }
.z-ieee { font-size: 12px; color: #64748b; margin-top: 4px; }
.z-model { font-size: 13px; color: #475569; }
.badge-gray { background: #e2e8f0; color: #334155; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.code-font { font-family: 'Courier New', Courier, monospace; }

.add-dev-btn {
  background-color: white;
  color: #FF4B4A;
  border: 1px solid #FF4B4A;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}
.add-dev-btn:hover { background-color: #fef2f2; }
.selected-btn {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}
.selected-btn:hover { background-color: #059669; }
.text-right { text-align: right; }

.spin-anim { animation: spin 2s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.toast-notification {
  position: fixed; bottom: 40px; right: 40px; background-color: #7B7B7B; 
  color: white; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; gap: 10px;
  box-shadow: 0 10px 15px -3px rgba(134, 134, 134, 0.3); z-index: 9999; font-weight: 600; font-size: 14px;
}
.toast-notification .material-symbols-outlined { font-size: 22px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }
</style>