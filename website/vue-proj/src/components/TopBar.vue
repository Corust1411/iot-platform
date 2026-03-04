<template>
  <div class="topbar">
    <div class="left">
      <span class="material-symbols-outlined menu-icon">menu</span>
    </div>

    <div class="right">
      <div class="user-pill">
        {{ username }}
      </div>

      <button class="logout-btn" @click="logout">Logout</button>

      <div class="notification">
        <span class="material-symbols-outlined">notifications</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['username'],
  methods: {
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.topbar {
  height: 60px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
}

.right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-pill {
  background: #ff4d4f;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
}

.logout-btn {
  border: 1px solid #cbd5e1;
  padding: 6px 14px;
  border-radius: 20px;
  background: white;
  cursor: pointer;
}

.notification {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>