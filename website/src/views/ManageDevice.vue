<template>
  <div class="app-wrapper">
    <TopNavBar :username="username" />

    <div class="layout">
      <SideNavBar />

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
              class="table-row clickable-row"
              @click="goToDeviceDetail(device.id)"
            >
              <span class="fw-bold">{{ device.name }}</span>
              <span>
                <span class="badge">{{ device.category || 'Uncategorized' }}</span>
              </span>
              <span class="protocol-text">
                <span v-if="device.protocol === 'wifi'"></span>
                <span v-else-if="device.protocol === 'zigbee'"></span>
                <span v-else></span>
                {{ device.protocol ? device.protocol.toUpperCase() : 'N/A' }}
              </span>
              <span class="text-right">
                <button class="icon-btn heart-btn" @click.stop="toggleFavorite(device)">
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
            <button class="add-btn" @click="$router.push('/register-device')">
              <span class="material-symbols-outlined">add</span>
              Register new device
            </button>
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
import SideNavBar from '@/components/SideNavBar.vue'
import { http } from '@/api/http'

export default {
  components: { TopNavBar, SideNavBar },
  data() {
    return {
      username: 'Unknown User',
      devices: [],
      currentTab: 'all',
      currentPage: 1,
      itemsPerPage: 5,
      showToast: false,
      toastMessage: '',
    }
  },
  computed: {
    filteredDevices() {
      if (this.currentTab === 'favorite') {
        return this.devices.filter(d => d.is_favorite);
      }
      return this.devices;
    },
    totalPages() {
      return Math.ceil(this.filteredDevices.length / this.itemsPerPage) || 1;
    },
    displayedDevices() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredDevices.slice(start, end);
    }
  },
  methods: {
    setTab(tab) {
      this.currentTab = tab;
      this.currentPage = 1;
    },
    goToDeviceDetail(id) {
      this.$router.push(`/device/${id}`);
    },
    async toggleFavorite(device) {
      device.is_favorite = !device.is_favorite;
    },
    async fetchDevices() {
      try {
        const res = await http.get('/devices');
        this.devices = res.data;
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    },
    triggerToast(message) {
      this.toastMessage = message;
      this.showToast = true;
      
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }
  },
  async mounted() {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      this.username = storedUser;
    }
    await this.fetchDevices();

    if (this.$route.query.action === 'created') {
      this.triggerToast('Device registered successfully!');
      this.$router.replace({ path: this.$route.path });
    }
  }
}
</script>

<style scoped>
.layout { display: flex; min-height: calc(100vh - 64px); }
.content { flex: 1; padding: 32px 40px; max-height: 93vh; background: #f8fafc; }
.page-title { font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 24px; margin-top: 0; }
.device-card { background: #ffffff; padding: 24px; height: 70vh; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.tabs { display: flex; gap: 24px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
.tabs span { cursor: pointer; color: #6b7280; font-weight: 600; font-size: 15px; padding: 1vh 6vh; transition: color 0.2s; position: relative; }
.tabs span:hover { color: #374151; }
.tabs .active { color: #000000; }
.tabs .active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background-color: #000000; }
.table-container { display: flex; flex-direction: column; background-color: #DEE5ED; border-radius: 10px; padding: 0vh 1vh; flex: 1; overflow-y: auto; }
.table-header, .table-row { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 80px; align-items: center; padding: 16px 12px; }
.table-header { font-weight: 700; color: #4b5563; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #7B7B7B; }
.table-row { border-bottom: 1px solid #7B7B7B; transition: background-color 0.2s; font-size: 13px; }
.table-row:hover { background-color: #d6d8db; }
.table-row:last-child { border-bottom: none; }
.text-right { text-align: right; display: flex; justify-content: flex-end; }
.fw-bold { font-weight: 300; color: #1f2937; }
.badge { background-color: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.protocol-text { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4b5563; font-weight: 500; }
.icon-btn { background: none; border: none; cursor: pointer; color: #9ca3af; border-radius: 50%; padding: 6px; display: flex; align-items: center; transition: all 0.2s; }
.icon-btn:hover { background-color: #f3f4f6; color: #4b5563; }
.icon-filter { color: #6b7280; font-size: 20px; }
.filled-heart { font-variation-settings: 'FILL' 1; color: #ef4444; }
.heart-btn:hover .material-symbols-outlined:not(.filled-heart) { color: #ef4444; opacity: 0.5; }
.empty-state { text-align: center; padding: 40px; min-height: 39vh; color: #6b7280; }
.paginator { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; padding-top: 16px; }
.paginator button { background: none; border: 1px solid #d1d5db; border-radius: 8px; padding: 4px 8px; cursor: pointer; display: flex; align-items: center; color: #374151; }
.paginator button:disabled { opacity: 0.5; cursor: not-allowed; background-color: #f3f4f6; }
.paginator span { font-size: 14px; font-weight: 600; color: #4b5563; }
.clickable-row { cursor: pointer; }
.footer { text-align: right; margin-top: auto; padding-top: 16px; }
.add-btn { background: #FF4B4A; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2); transition: transform 0.2s, background-color 0.2s; }
.add-btn:hover { background: #fb3131; transform: translateY(-2px); }

/* Toast Notification Styles */
.toast-notification { position: fixed; bottom: 40px; right: 40px; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 9999; font-weight: 600; font-size: 14px; }
.toast-notification .material-symbols-outlined { font-size: 22px; color: #10b981; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }
</style>