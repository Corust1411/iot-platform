<template>
  <div class="sidenav">
    <div 
      v-for="item in menu"
      :key="item.name"
      :class="['nav-item', { active: $route.path === item.path }]"
      @click="$router.push(item.path)"
    >
      <span class="material-symbols-outlined">{{ item.icon }}</span>
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menu: [
        { name: 'Manage Device', path: '/dashboard', icon: 'home' },
        { name: 'MQTT Client', path: '/mqtt', icon: 'hub' },
        { name: 'Dashboard', path: '/sensor-dashboard', icon: 'dashboard' },
        { name: 'Profile Setting', path: '/profile', icon: 'settings' }
      ]
    }
  }
}
</script>

<style scoped>
.sidenav {
  width: 220px;
  background: #f3f4f6;
  padding-top: 20px;
  min-height: calc(100vh - 60px);
}

.nav-item {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #6b7280;
}

.nav-item.active {
  color: #ff4d4f;
  border-left: 4px solid #ff4d4f;
  background: #fff;
}

.nav-item:hover {
  background: #e5e7eb;
}
</style>