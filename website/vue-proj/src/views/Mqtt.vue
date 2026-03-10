<template>
  <div class="app-wrapper">
    <TopNavBar :username="username" />
    <div class="layout">
      <SideNavBar />
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