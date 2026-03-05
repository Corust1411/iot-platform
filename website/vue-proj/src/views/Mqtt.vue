<template>
  <div class="app-wrapper">
    <TopBar :username="username" />
    <div class="layout">
      <SideNav />
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
      currentTab: 'dashboard'
    }
  },
  async mounted() {
    const storedUser = localStorage.getItem('username')
    if (storedUser) this.username = storedUser

    const dashboardId = this.$route.params.id;
    if (dashboardId) {
      await this.fetchDashboardDetail(dashboardId);
    }
  }
  
}
</script>