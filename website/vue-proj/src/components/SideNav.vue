<template>
  <aside class="sidebar">
    <nav class="nav-menu">
      <router-link to="/managedevice" class="nav-item">
        <span class="material-symbols-outlined nav-icon">home</span>
        <span class="nav-text">Manage Device</span>
      </router-link>

      <router-link to="/mqtt" class="nav-item">
        <span class="material-symbols-outlined nav-icon">design_services</span>
        <span class="nav-text">MQTT Client</span>
      </router-link>

      <router-link to="/dashboard" class="nav-item">
        <span class="material-symbols-outlined nav-icon">monitor</span>
        <span class="nav-text">Dashboard</span>
      </router-link>

      <router-link to="/profile" class="nav-item">
        <span class="material-symbols-outlined nav-icon">settings_account_box</span>
        <span class="nav-text">Profile Setting</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  height: 92vh;
  background-color: #ffffff;
  border-right: 1px solid #DADADA;
  display: flex;
  flex-direction: column;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.nav-menu {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* สไตล์พื้นฐานของเมนู (สถานะปกติ: สีเทา) */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: #6b7280; /* สีเทา */
  border-radius: 10px;
  transition: all 0.2s ease;
}

.nav-icon {
  font-size: 22px;
  transition: color 0.2s ease;
}

.nav-text {
  font-size: 15px;
  font-weight: 600;
}

/* เมื่อ Hover เมนูสีเทาให้เข้มขึ้นเล็กน้อย */
.nav-item:hover:not(.router-link-active) {
  background-color: #f3f4f6;
  color: #374151;
}

/* สถานะ Active: เมื่อเข้าสู่หน้านั้นๆ (สีแสด) */
.nav-item.router-link-active {
  background-color: #fff7ed; /* พื้นหลังสีแสดอ่อนๆ */
  color: #FF4B4A; /* สีแสด */
  position: relative;
}

/* เพิ่มแถบสีแสดด้านซ้ายเพื่อความชัดเจน */
.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: -12px; /* ขยับไปชิดขอบ Sidebar */
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 4px;
  background-color: #FF4B4A; /* สีแสด */
  border-radius: 0 4px 4px 0;
}
</style>