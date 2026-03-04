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
              <div class="zigbee-list-container">
                <p style="color: #6b7280; text-align: center; padding: 20px 0; border: 1px dashed #d1d5db;">
                  [Zigbee Device List Placeholder]
                </p>
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
      step: 1,
      showError: false,
      form: {
        name: '',
        category: '',
        description: '',
        protocol: '',
        macAddress: '',
        devEui: '',
        joinEui: '',
        appKey: ''
      }
    }
  },
  mounted() {
    const storedUser = localStorage.getItem('username')
    if (storedUser) {
      this.username = storedUser
    }
  },
  methods: {
    selectProtocol(type) {
      this.form.protocol = type
      this.showError = false
    },
    handleNext() {
      if (this.step === 1) {
        // เช็คว่า Name ว่าง หรือ Category ว่างหรือไม่
        if (!this.form.name.trim() || !this.form.category) {
          this.showError = true
          return
        }
      } else if (this.step === 2) {
        if (!this.form.protocol) {
          this.showError = true
          return
        }
      }
      this.showError = false
      this.step++
    },
    goToStep(targetStep) {
      if (targetStep > this.step) {
        // ดักกรณีผู้ใช้กดข้าม Step จากเมนูด้านบน
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
    },
    async submitDevice() {
      if (this.form.protocol === 'wifi') {
        if (!this.form.macAddress.trim()) {
          this.showError = true;
          return;
        }
      } else if (this.form.protocol === 'lorawan') {
        if (!this.form.devEui.trim() || !this.form.joinEui.trim() || !this.form.appKey.trim()) {
          this.showError = true;
          return;
        }
      }
      this.showError = false;

      const configData = {};
      if (this.form.protocol === 'wifi') {
        configData.macAddress = this.form.macAddress;
      } else if (this.form.protocol === 'lorawan') {
        configData.devEui = this.form.devEui;
        configData.joinEui = this.form.joinEui;
        configData.appKey = this.form.appKey;
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
        alert('Device registered successfully!');

        this.$router.push('/managedevice'); 
      } catch (err) {
        console.error('Failed to create device:', err);
        const errorMsg = err.response?.data?.message || 'Unknown error occurred';
        alert(`Error: ${errorMsg}`);
      }
    },
    generate16Hex(field) {
      const hexString = [...Array(16)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')
        .toUpperCase();
      this.form[field] = hexString;
    },
    generate32Hex(field) {
      const hexString = [...Array(32)]
        .map(() => Math.floor(Math.random() * 32).toString(32))
        .join('')
        .toUpperCase();
      this.form[field] = hexString;
    },
    async copyText(text) {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard: ' + text); 
      } catch (err) {
        console.error('Failed to copy text', err);
      }
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

.steps {
  display: flex;
  width: 100%;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 32px;
}

.steps span {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-weight: 600;
  color: #9ca3af;
  cursor: pointer;
  position: relative;
}

.steps .active {
  color: #000;
}

.steps .active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #000;
}

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
.create-btn { background: #10b981; color: white; border: none; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
.create-btn:hover { background: #059669; }

.protocol-section, .detail-section { display: flex; flex-direction: column; }
.protocol-title { font-size: 18px; font-weight: 600; margin-bottom: 24px; color: #374151; text-align: center; }
.protocol-grid { display: flex; justify-content: center; gap: 24px; margin-bottom: 30px; }
.protocol-card { width: 180px; height: 150px; background: #DEE5ED; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; transition: 0.2s ease; }
.protocol-card:hover { background: #aab2bb; }
.protocol-card.selected { background: #aab2bb; }
.protocol-icon { font-size: 48px; margin-bottom: 10px; }

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
</style>