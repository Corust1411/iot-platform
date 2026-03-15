<template>
  <div class="app-wrapper">
    <TopNavBar :username="navbarUsername" />

    <div class="layout">
      <SideNavBar />

      <div class="content">
        <div class="page-header">
          <h1 class="page-title">MQTT Web Client</h1>
          <div class="header-actions">
            <div class="status-badge" :class="isConnected ? 'status-connected' : 'status-disconnected'">
              <span class="status-dot"></span>
              {{ isConnected ? 'Connected' : 'Disconnected' }}
            </div>
          </div>
        </div>

        <div class="mqtt-grid">
          <div class="detail-card">
            <h2 class="section-title">Connection</h2>
            <div class="info-grid mt-16">
              <div class="info-item">
                <span class="info-label">Host</span>
                <div class="input-with-btn">
                  <select v-model="connection.protocol" class="form-input" :disabled="isConnected" style="border-radius: 6px 0 0 6px; border-right: none; width: 80px; padding: 8px 4px;">
                    <option value="ws">ws://</option>
                    <option value="wss">wss://</option>
                  </select>
                  <input type="text" v-model="connection.host" class="form-input w-100" :disabled="isConnected" style="border-radius: 0 6px 6px 0;" placeholder="localhost">
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">Port</span>
                <input type="number" v-model.number="connection.port" class="form-input w-100" :disabled="isConnected" placeholder="1883">
              </div>
              <div class="info-item">
                <span class="info-label">Client ID</span>
                <div class="input-with-btn">
                  <input type="text" v-model="connection.clientId" class="form-input w-100" :disabled="isConnected">
                  <button class="icon-btn" @click="generateClientId" :disabled="isConnected" title="Generate ID"><span class="material-symbols-outlined">autorenew</span></button>
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">Path</span>
                <input type="text" v-model="connection.path" class="form-input w-100" :disabled="isConnected" placeholder="/mqtt">
              </div>
            </div>
            
            <div class="mt-16 text-right">
              <button v-if="!isConnected" class="save-btn" @click="connectMqtt">
                <span class="material-symbols-outlined">power</span> Connect
              </button>
              <button v-else class="cancel-btn text-red border-red" @click="disconnectMqtt">
                <span class="material-symbols-outlined">power_off</span> Disconnect
              </button>
            </div>
          </div>

          <div class="detail-card">
            <h2 class="section-title">Publish</h2>
            <div class="info-grid mt-16" style="grid-template-columns: 1fr;">
              <div class="info-item">
                <span class="info-label">Topic</span>
                <input type="text" v-model="publishData.topic" class="form-input w-100" placeholder="e.g. sensor/temp">
              </div>
              <div class="info-item">
                <span class="info-label">Message</span>
                <textarea v-model="publishData.message" class="form-input w-100 textarea" placeholder="Enter payload here..."></textarea>
              </div>
            </div>
            <div class="footer-action mt-16" style="justify-content: space-between;">
              <div class="publish-options">
                <label class="info-label">QoS</label>
                <select v-model.number="publishData.qos" class="form-input" style="width: auto; padding: 4px 8px;">
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <button class="save-btn bg-blue" @click="publishMessage" :disabled="!isConnected">
                <span class="material-symbols-outlined">send</span> Publish
              </button>
            </div>
          </div>

          <div class="detail-card">
            <h2 class="section-title">Subscriptions</h2>
            <div class="subscribe-input mt-16">
              <div class="input-with-btn w-100">
                <input type="text" v-model="subTopic" class="form-input w-100" placeholder="Topic to subscribe (e.g. #)">
                <button class="save-btn" style="border-radius: 0 6px 6px 0;" @click="subscribeTopic" :disabled="!isConnected">Subscribe</button>
              </div>
            </div>

            <div class="subscriptions-list mt-16">
              <div v-if="subscriptions.length === 0" class="empty-text">No active subscriptions.</div>
              <div v-for="(sub, index) in subscriptions" :key="index" class="sub-badge">
                <div class="sub-info">
                  <span class="sub-topic">{{ sub.topic }}</span>
                  <span class="sub-qos">QoS {{ sub.qos }}</span>
                </div>
                <button class="icon-btn text-red" @click="unsubscribeTopic(sub.topic)" title="Unsubscribe">
                  <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
                </button>
              </div>
            </div>
          </div>

          <div class="detail-card terminal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h2 class="section-title" style="margin: 0; color: white;">Messages</h2>
              <button class="icon-btn text-gray" @click="messages = []" title="Clear Messages">
                <span class="material-symbols-outlined">delete_sweep</span>
              </button>
            </div>
            
            <div class="terminal-box" ref="terminalBox">
              <div v-if="messages.length === 0" class="empty-terminal">Waiting for messages...</div>
              
              <div v-for="(msg, index) in messages" :key="index" class="msg-row">
                <div class="msg-header">
                  <span class="msg-time">[{{ msg.time }}]</span>
                  <span class="msg-topic">{{ msg.topic }}</span>
                  <span class="msg-qos">QoS: {{ msg.qos }}</span>
                </div>
                <div class="msg-payload">{{ msg.payload }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <transition name="fade">
      <div v-if="showToast" class="toast-notification">
        <span class="material-symbols-outlined">info</span>
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue'
import SideNavBar from '@/components/SideNavBar.vue'
import mqtt from 'mqtt'

export default {
  components: { TopNavBar, SideNavBar },
  data() {
    return {
      navbarUsername: 'Unknown User',
      client: null,
      isConnected: false,
      showToast: false,
      toastMessage: '',
      
      connection: {
        protocol: 'ws',
        host: 'localhost',
        port: 9001,
        path: '/',
        clientId: 'kmitl_iot_' + Math.random().toString(16).substr(2, 8),
      },
      
      publishData: {
        topic: '',
        message: '',
        qos: 0
      },
      
      subTopic: '#',
      subscriptions: [],
      messages: []
    }
  },
  mounted() {
    const storedUser = localStorage.getItem('username');
    if (storedUser) this.navbarUsername = storedUser;
  },
  beforeUnmount() {
    if (this.client) {
      this.client.end();
    }
  },
  methods: {
    generateClientId() {
      this.connection.clientId = 'kmitl_iot_' + Math.random().toString(16).substr(2, 8);
    },
    connectMqtt() {
      if (this.client) this.client.end(); 
      const { protocol, host, port, path, clientId } = this.connection;
      const url = `${protocol}://${host}:${port}${path}`;

      const options = {
        clientId: clientId,
        clean: true,
        connectTimeout: 4000,
      };

      this.triggerToast(`Connecting to ${url}...`);
      this.client = mqtt.connect(url, options);

      this.client.on('connect', () => {
        this.isConnected = true;
        this.triggerToast('Connected to MQTT Broker!');
      });

      this.client.on('error', (err) => {
        console.error('Connection error: ', err);
        this.triggerToast('Connection failed!');
        this.client.end();
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      this.client.on('message', (topic, message, packet) => {
        const time = new Date().toLocaleTimeString('en-GB');
        this.messages.push({
          time: time,
          topic: topic,
          payload: message.toString(),
          qos: packet.qos
        });
        
        this.$nextTick(() => {
          const terminal = this.$refs.terminalBox;
          if (terminal) terminal.scrollTop = terminal.scrollHeight;
        });
      });
    },
    disconnectMqtt() {
      if (this.client) {
        this.client.end();
        this.isConnected = false;
        this.subscriptions = [];
        this.triggerToast('Disconnected');
      }
    },
    subscribeTopic() {
      if (!this.subTopic.trim()) return;
      if (this.subscriptions.find(s => s.topic === this.subTopic)) {
        this.triggerToast('Already subscribed to this topic');
        return;
      }

      this.client.subscribe(this.subTopic, { qos: 0 }, (err) => {
        if (!err) {
          this.subscriptions.push({ topic: this.subTopic, qos: 0 });
          this.triggerToast(`Subscribed to ${this.subTopic}`);
          this.subTopic = '';
        } else {
          this.triggerToast('Failed to subscribe');
        }
      });
    },
    unsubscribeTopic(topic) {
      this.client.unsubscribe(topic, (err) => {
        if (!err) {
          this.subscriptions = this.subscriptions.filter(s => s.topic !== topic);
          this.triggerToast(`Unsubscribed from ${topic}`);
        }
      });
    },
    publishMessage() {
      const { topic, message, qos } = this.publishData;
      if (!topic.trim()) {
        this.triggerToast('Topic cannot be empty');
        return;
      }
      
      this.client.publish(topic, message, { qos: qos, retain: false }, (err) => {
        if (err) this.triggerToast('Publish failed');
        else this.triggerToast('Message published!');
      });
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
.layout { display: flex; min-height: calc(100vh - 64px); }
.content { flex: 1; padding: 32px 40px; background: #f8fafc; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; color: #111827; margin: 0; }

.status-badge { display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
.status-connected { background-color: #d1fae5; color: #059669; }
.status-disconnected { background-color: #fee2e2; color: #dc2626; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-connected .status-dot { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
.status-disconnected .status-dot { background-color: #ef4444; }

.mqtt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

.detail-card { background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.section-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.info-item { display: flex; flex-direction: column; gap: 6px; }
.info-label { font-size: 13px; font-weight: 600; color: #6b7280; }
.mt-16 { margin-top: 16px; }
.w-100 { width: 100%; box-sizing: border-box; }

.form-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit; color: #1f2937; outline: none; transition: 0.2s; background: #ffffff; }
.form-input:focus { border-color: #486284; }
.form-input:disabled { background-color: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
.textarea { resize: vertical; min-height: 80px; }

.input-with-btn { display: flex; }
.input-with-btn .form-input { border-radius: 6px 0 0 6px; border-right: none; }
.icon-btn { background: #f3f4f6; border: 1px solid #d1d5db; padding: 0 12px; border-radius: 0 6px 6px 0; cursor: pointer; color: #4b5563; display: flex; align-items: center; transition: 0.2s; }
.icon-btn:hover:not(:disabled) { background: #e5e7eb; }
.icon-btn:disabled { cursor: not-allowed; color: #9ca3af; }

.footer-action { display: flex; align-items: center; }
.publish-options { display: flex; align-items: center; gap: 8px; }

/* Buttons */
.save-btn { background: #10b981; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
.save-btn:hover:not(:disabled) { background: #059669; }
.save-btn:disabled { background: #9ca3af; cursor: not-allowed; }
.bg-blue { background: #3b82f6; }
.bg-blue:hover:not(:disabled) { background: #2563eb; }

.cancel-btn { background: white; border: 1px solid #d1d5db; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
.text-red { color: #ef4444 !important; }
.border-red { border-color: #ef4444 !important; }
.cancel-btn:hover { background: #fef2f2; }

/* Subscriptions List */
.subscriptions-list { display: flex; flex-direction: column; gap: 8px; max-height: 150px; overflow-y: auto; }
.sub-badge { display: flex; justify-content: space-between; align-items: center; background: #f9fafb; border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 6px; }
.sub-info { display: flex; flex-direction: column; }
.sub-topic { font-weight: 600; font-size: 14px; color: #111827; }
.sub-qos { font-size: 12px; color: #6b7280; }
.sub-badge .icon-btn { border: none; background: transparent; padding: 4px; }
.sub-badge .icon-btn:hover { background: #fef2f2; border-radius: 4px; }
.empty-text { font-size: 13px; color: #9ca3af; font-style: italic; }

.terminal-card { background: #111827; border: none; }
.terminal-card .section-title { border-bottom-color: #374151; }
.terminal-box { background: #1f2937; border-radius: 6px; padding: 12px; height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; font-family: 'Courier New', Courier, monospace; }
.empty-terminal { color: #6b7280; text-align: center; margin-top: 20px; font-size: 14px; }
.msg-row { border-left: 3px solid #3b82f6; padding-left: 10px; }
.msg-header { display: flex; gap: 8px; font-size: 12px; margin-bottom: 4px; align-items: center; }
.msg-time { color: #9ca3af; }
.msg-topic { background: #374151; color: #d1d5db; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
.msg-qos { color: #6b7280; }
.msg-payload { color: #10b981; font-size: 14px; word-break: break-all; }

/* Toast */
.toast-notification { position: fixed; bottom: 40px; right: 40px; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 9999; font-weight: 600; font-size: 14px; }
.toast-notification .material-symbols-outlined { font-size: 22px; color: #3b82f6; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }

@media (max-width: 1024px) {
  .mqtt-grid { grid-template-columns: 1fr; }
}
</style>