<template>
  <div class="app-wrapper">
    <TopNavBar :username="navbarUsername" />

    <div class="layout">
      <SideNavBar />

      <div class="content">
        <div class="page-header">
          <h1 class="page-title">My Profile</h1>
          <div class="header-actions">
            <button v-if="!isEditing" class="btn-secondary" @click="startEdit">
              <span class="material-symbols-outlined">edit</span> Edit Profile
            </button>
            
            <template v-else>
              <button class="cancel-btn" @click="cancelEdit">Cancel</button>
              <button class="save-btn" @click="saveProfile">
                <span class="material-symbols-outlined">save</span> Save Changes
              </button>
            </template>
          </div>
        </div>

        <div class="profile-card">
          
          <div class="profile-header">
            <div class="avatar-large"><span class="material-symbols-outlined">person</span></div>
            <div class="profile-title-info">
              <h2>{{ profile.username || 'Loading...' }}</h2>
              <p class="role-badge">{{ profile.role || 'User' }}</p>
            </div>
          </div>

          <hr class="divider" />

          <div class="form-section">
            <h3 class="section-title">System Information <span class="hint-text">(Read-only)</span></h3>
            
            <div class="form-row">
              <div class="form-group half-width">
                <label>Account ID</label>
                <input type="text" :value="profile.id" disabled class="disabled-input" />
              </div>
              <div class="form-group half-width">
                <label>System Role</label>
                <input type="text" :value="profile.role || 'User'" disabled class="disabled-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label>Created Time</label>
                <input type="text" :value="formatDate(profile.created_at)" disabled class="disabled-input" />
              </div>
            </div>

            <h3 class="section-title mt-24">Personal Details</h3>
            
            <div class="form-row">
              <div class="form-group half-width">
                <label>Username <span v-if="isEditing" class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.username" 
                  :disabled="!isEditing" 
                  :class="{ 'editable-input': isEditing, 'disabled-input': !isEditing, 'error-border': showError && !form.username }" 
                />
                <span v-if="showError && !form.username" class="error-text">Username is required</span>
              </div>
              
              <div class="form-group half-width">
                <label>Email <span v-if="isEditing" class="required">*</span></label>
                <input 
                  type="email" 
                  v-model="form.email" 
                  :disabled="!isEditing" 
                  :class="{ 'editable-input': isEditing, 'disabled-input': !isEditing, 'error-border': showError && !form.email }" 
                />
                <span v-if="showError && !form.email" class="error-text">Email is required</span>
              </div>
            </div>

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
      navbarUsername: 'Unknown User',
      isEditing: false,
      showError: false,
      showToast: false,
      toastMessage: '',
      
      // ข้อมูลดั้งเดิมที่ดึงมาจาก Database
      profile: {
        id: '',
        username: '',
        email: '',
        role: 'user',
        created_at: ''
      },
      
      // ข้อมูลสำหรับฟอร์มตอน Edit (แยกกันเพื่อให้กดยกเลิกแล้วคืนค่าเดิมได้)
      form: {
        username: '',
        email: ''
      }
    }
  },
  async mounted() {
    // 1. ดึงชื่อจาก LocalStorage มาโชว์ NavBar ก่อนเพื่อความไว
    const storedUser = localStorage.getItem('username');
    if (storedUser) this.navbarUsername = storedUser;

    // 2. ไปดึงข้อมูลเต็มๆ จาก Backend
    await this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      try {
        // 🟢 เปลี่ยน path เป็น API Backend ของคุณ
        const res = await http.get('/profile'); 
        this.profile = res.data;
        
        // อัปเดต NavBar ถ้าชื่อมีการเปลี่ยนแปลง
        this.navbarUsername = this.profile.username;
        localStorage.setItem('username', this.profile.username);

      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    },
    startEdit() {
      // ก๊อปปี้ข้อมูลปัจจุบันลงฟอร์ม
      this.form.username = this.profile.username;
      this.form.email = this.profile.email;
      this.isEditing = true;
      this.showError = false;
    },
    cancelEdit() {
      this.isEditing = false;
      this.showError = false;
    },
    async saveProfile() {
      if (!this.form.username.trim() || !this.form.email.trim()) {
        this.showError = true;
        return;
      }
      
      try {
        // 🟢 ยิง API ไปอัปเดตข้อมูล (ส่งไปแค่ฟิลด์ที่อนุญาตให้แก้)
        await http.put('/profile', {
          username: this.form.username,
          email: this.form.email
        });

        // อัปเดตข้อมูลใน UI
        this.profile.username = this.form.username;
        this.profile.email = this.form.email;
        this.navbarUsername = this.form.username;
        localStorage.setItem('username', this.form.username); // อัปเดต LocalStorage ด้วย

        this.isEditing = false;
        this.triggerToast('Profile updated successfully!');
      } catch (error) {
        console.error("Error updating profile:", error);
        alert('Failed to update profile. Email might be already in use.');
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + 
             d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
.header-actions { display: flex; gap: 12px; }

.btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-family: inherit; transition: 0.2s; }
.btn-secondary:hover { background: #f3f4f6; }
.cancel-btn { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; transition: 0.2s; }
.cancel-btn:hover { background: #fef2f2; }
.save-btn { background: #10b981; border: none; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-family: inherit; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); transition: 0.2s; }
.save-btn:hover { background: #059669; transform: translateY(-1px); }

.profile-card { background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); max-width: 800px; margin: 0 auto; }

.profile-header { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
.avatar-large { width: 80px; height: 80px; background: #FF4B4A; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 10px rgba(255, 75, 74, 0.3); }
.avatar-large .material-symbols-outlined { font-size: 40px; }
.profile-title-info h2 { margin: 0 0 8px 0; font-size: 22px; color: #111827; }
.role-badge { display: inline-block; margin: 0; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: capitalize; }

.divider { border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0; }

.section-title { font-size: 16px; font-weight: 700; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.hint-text { font-size: 12px; font-weight: 500; color: #9ca3af; }
.mt-24 { margin-top: 24px; }

.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; gap: 20px; }
.half-width { flex: 1; }
.form-group { display: flex; flex-direction: column; gap: 8px; }

label { font-weight: 600; font-size: 13px; color: #4b5563; }
.required { color: #ef4444; }

input { padding: 10px 14px; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: 0.2s; }
.disabled-input { background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #6b7280; cursor: not-allowed; }
.editable-input { background-color: white; border: 1px solid #d1d5db; color: #111827; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
.editable-input:focus { border-color: #111827; }
.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; margin-top: -4px; }

.toast-notification { position: fixed; bottom: 40px; right: 40px; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 9999; font-weight: 600; font-size: 14px; }
.toast-notification .material-symbols-outlined { font-size: 22px; color: #10b981; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }
</style>