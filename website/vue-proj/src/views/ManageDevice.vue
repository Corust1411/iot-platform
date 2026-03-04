<template>
  <div>
    <TopBar :username="username" />

    <div class="layout">
      <SideNav />

      <div class="content">
        <DeviceTable :devices="devices" />
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import SideNav from '@/components/SideNav.vue'
import DeviceTable from '@/components/DeviceTable.vue'
import { http } from '@/api/http'

export default {
  components: { TopBar, SideNav, DeviceTable },
  data() {
    return {
      username: 'User account name',
      devices: []
    }
  },
  async mounted() {
    const res = await http.get('/devices')
    this.devices = res.data
  }
}
</script>

<style scoped>
.layout {
  display: flex;
}

.content {
  flex: 1;
  padding: 30px;
  background: #f8fafc;
}
</style>