<template>
  <header class="navbar">
    <div class="left">
        <a>
            <img src="\image\logo.png" width="70px" height="auto">
        </a>
    </div>

    <div class="right">
      

      <div class="divider"></div>

      <span class="username">{{ currentUsername }}</span>

      <button @click="handleLogout" class="logout-btn">
        <span>Logout</span>
      </button>
      <button class="icon-btn">
        <span class="material-symbols-outlined">notifications</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentUsername = ref<string>('Unknown User');

onMounted(() => {
  const storedUser = localStorage.getItem('username');
  if (storedUser) {
    currentUsername.value = storedUser;
  }
});

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  
  router.push('/');
};
</script>

<style scoped>

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 5vh 0px 1vh;
  height: 7vh;
  background-color: #ffffff;
  border-bottom: 2px solid #B6B6B6;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.left {
  display: flex;
  align-items: left;
}

.menu-icon {
  cursor: pointer;
  color: #6b7280;
  font-size: 24px;
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #e5e7eb;
}

.username {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #fee2e2;
  color: #ef4444;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: inherit;
}

.logout-btn:hover {
  background-color: #fecaca;
}

.logout-btn .material-symbols-outlined {
  font-size: 18px;
}
</style>