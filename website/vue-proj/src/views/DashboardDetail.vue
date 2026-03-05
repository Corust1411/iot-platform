<template>
  <div class="app-wrapper">
    <TopBar :username="username" />
    <div class="layout">
      <SideNav />

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
            <button class="add-widget-btn">
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
          <h3>monitor</h3>

        <!-- SETTING PAGE -->
        <div v-if="currentTab === 'setting'" class="setting-area">
          <h3>Settings</h3>
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
      dashboardName: 'Loading...',
      currentTab: 'dashboard',
      switchState: true,
      dimmer: 40
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
        const res = await http.get('/dashboards');
        const dashboards = res.data;
        const currentDash = dashboards.find(d => d.id === parseInt(id));
        
        if (currentDash) {
          this.dashboardName = currentDash.name;
        } else {
          this.dashboardName = 'Dashboard Not Found';
        }
      } catch (error) {
        console.error("Error fetching dashboard details:", error);
        this.dashboardName = 'Error Loading Dashboard';
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
  gap:40px;
  border-bottom:2px solid #e5e7eb;
}

.tabs span{
  padding:10px 0;
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
}

.icon-btn{
  border:none;
  background:none;
  cursor:pointer;
}

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
</style>