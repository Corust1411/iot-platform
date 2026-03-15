<template>
  <div class="app-wrapper">
    <TopNavBar :username="navbarUsername" />

    <div class="layout">
      <SideNavBar />

      <div class="content">
        <div class="page-header">
          <h1 class="page-title">Account Profile Setting</h1>
        </div>

        <div class="detail-card">
          <div class="profile-header">
            <div class="profile-title-info">
              <h2>{{ profile.username || 'Loading...' }}</h2>
              <p class="badge" style="margin-top: 4px;">{{ profile.role || 'User' }}</p>
            </div>
          </div>

          <div class="detail-sections">
            
            <div class="section-block">
              <h2 class="section-title">Personal Details</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">First Name</span>
                  <input v-if="isEditing" type="text" v-model="form.first_name" class="form-input">
                  <span v-else class="info-value">{{ profile.first_name || '-' }}</span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">Last Name</span>
                  <input v-if="isEditing" type="text" v-model="form.last_name" class="form-input">
                  <span v-else class="info-value">{{ profile.last_name || '-' }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">Username <span v-if="isEditing" class="required">*</span></span>
                  <div v-if="isEditing" class="w-100">
                    <input type="text" v-model="form.username" class="form-input w-100" :class="{ 'error-border': showError && !form.username }">
                    <span v-if="showError && !form.username" class="error-text">Username is required</span>
                  </div>
                  <span v-else class="info-value">{{ profile.username || '-' }}</span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">Email <span v-if="isEditing" class="required">*</span></span>
                  <div v-if="isEditing" class="w-100">
                    <input type="email" v-model="form.email" class="form-input w-100" :class="{ 'error-border': showError && !form.email }">
                    <span v-if="showError && !form.email" class="error-text">Email is required</span>
                  </div>
                  <span v-else class="info-value">{{ profile.email || '-' }}</span>
                </div>
              </div>

              <div class="mt-16" v-if="isEditing">
                <button class="btn-secondary" @click="showPasswordModal = true">
                  <span class="material-symbols-outlined">lock_reset</span> Change Password
                </button>
              </div>
            </div>

            <div class="section-block">
              <h2 class="section-title">System Information</h2>
              <div class="info-grid config-grid">
                <div class="info-item">
                  <span class="info-label">System Role</span>
                  <span class="info-value capitalize">{{ profile.role || 'User' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Account Created</span>
                  <span class="info-value">{{ formatDate(profile.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="footer-action">
              <template v-if="isEditing">
                <button class="cancel-btn" @click="cancelEdit">Cancel</button>
                <button class="save-btn" @click="saveProfile">Save Changes</button>
              </template>
              <template v-else>
                <button class="edit-btn" @click="startEdit">
                  <span class="material-symbols-outlined">edit</span>
                  Edit Profile
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="share-modal">
        <div class="modal-header">
          <h2>Change Password</h2>
          <button class="close-btn" @click="closePasswordModal"><span class="material-symbols-outlined">close</span></button>
        </div>
        
        <div class="form-section">
          <div class="form-group">
            <label>Current Password</label>
            <div class="input-with-icon">
              <input :type="showPwd.current ? 'text' : 'password'" v-model="pwdForm.current" class="editable-input w-100" />
              <span class="material-symbols-outlined eye-icon" @click="showPwd.current = !showPwd.current">
                {{ showPwd.current ? 'visibility_off' : 'visibility' }}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label>New Password</label>
            <div class="input-with-icon">
              <input :type="showPwd.new ? 'text' : 'password'" v-model="pwdForm.new" class="editable-input w-100" />
              <span class="material-symbols-outlined eye-icon" @click="showPwd.new = !showPwd.new">
                {{ showPwd.new ? 'visibility_off' : 'visibility' }}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label>Confirm New Password</label>
            <div class="input-with-icon">
              <input :type="showPwd.confirm ? 'text' : 'password'" v-model="pwdForm.confirm" class="editable-input w-100" />
              <span class="material-symbols-outlined eye-icon" @click="showPwd.confirm = !showPwd.confirm">
                {{ showPwd.confirm ? 'visibility_off' : 'visibility' }}
              </span>
            </div>
            <span v-if="pwdError" class="error-text">{{ pwdError }}</span>
          </div>
        </div>

        <div class="modal-footer mt-24" style="display: flex; justify-content: flex-end; gap: 12px;">
          <button class="cancel-btn" @click="closePasswordModal">Cancel</button>
          <button class="save-btn" @click="submitPasswordChange">Update Password</button>
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
      
      profile: { username: '', email: '', first_name: '', last_name: '', role: 'user', created_at: '' },
      form: { username: '', email: '', first_name: '', last_name: '' },
      
      showPasswordModal: false,
      pwdForm: { current: '', new: '', confirm: '' },
      pwdError: '',
      
      showPwd: { current: false, new: false, confirm: false }
    }
  },
  async mounted() {
    const storedUser = localStorage.getItem('username');
    if (storedUser) this.navbarUsername = storedUser;
    await this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      try {
        const res = await http.get('/profile'); 
        this.profile = res.data;
        this.navbarUsername = this.profile.username;
        localStorage.setItem('username', this.profile.username);
      } catch (error) { console.error("Error fetching profile:", error); }
    },
    startEdit() {
      this.form.username = this.profile.username;
      this.form.email = this.profile.email;
      this.form.first_name = this.profile.first_name;
      this.form.last_name = this.profile.last_name;
      this.isEditing = true;
      this.showError = false;
    },
    cancelEdit() {
      this.isEditing = false;
      this.showError = false;
    },
    async saveProfile() {
      if (!this.form.username.trim() || !this.form.email.trim()) {
        this.showError = true; return;
      }
      try {
        await http.put('/profile', {
          username: this.form.username,
          email: this.form.email,
          first_name: this.form.first_name,
          last_name: this.form.last_name
        });
        Object.assign(this.profile, this.form);
        this.navbarUsername = this.form.username;
        localStorage.setItem('username', this.form.username);
        this.isEditing = false;
        this.triggerToast('Profile updated successfully!');
      } catch (error) {
        alert('Failed to update profile.');
      }
    },
    closePasswordModal() {
      this.showPasswordModal = false;
      this.pwdForm = { current: '', new: '', confirm: '' };
      this.pwdError = '';
      this.showPwd = { current: false, new: false, confirm: false };
    },
    async submitPasswordChange() {
      this.pwdError = '';
      if (!this.pwdForm.current || !this.pwdForm.new || !this.pwdForm.confirm) {
        this.pwdError = 'All fields are required'; return;
      }
      if (this.pwdForm.new !== this.pwdForm.confirm) {
        this.pwdError = 'New passwords do not match'; return;
      }
      try {
        await http.put('/profile/password', {
          currentPassword: this.pwdForm.current,
          newPassword: this.pwdForm.new
        });
        this.triggerToast('Password updated successfully!');
        this.closePasswordModal();
      } catch (error) {
        this.pwdError = error.response?.data?.message || 'Failed to update password';
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

.detail-card { background: #ffffff; padding: 24px; min-height: fit-content; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.profile-header { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb; }
.avatar-large { width: 80px; height: 80px; background: #FF4B4A; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 10px rgba(255, 75, 74, 0.3); }
.avatar-large .material-symbols-outlined { font-size: 40px; }
.profile-title-info h2 { display: flex; margin: 0; font-size: 22px; color: #111827; }

.detail-sections { display: flex; flex-direction: column; gap: 32px; }
.section-block { border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
.section-block:last-of-type { border-bottom: none; padding-bottom: 0; }
.section-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.config-grid { background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px dashed #d1d5db; }
.info-item { display: flex; flex-direction: column; gap: 6px; }
.info-label { font-size: 13px; font-weight: 600; color: #6b7280; }
.info-value { font-size: 15px; font-weight: 500; color: #1f2937; }
.capitalize { text-transform: capitalize; }
.required { color: #ef4444; }
.mt-16 { margin-top: 16px; }
.w-100 { width: 100%; box-sizing: border-box; }

.badge { background-color: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; width: fit-content; text-transform: capitalize; display: inline-block; }

.form-input { width: 85%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit; color: #1f2937; outline: none; transition: border-color 0.2s; background: #ffffff; }
.form-input:focus { border-color: #486284; }
.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; margin-top: 4px; display: block; }

.btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-family: inherit; transition: 0.2s; }
.btn-secondary:hover { background: #f3f4f6; }

.footer-action { display: flex; justify-content: flex-end; gap: 16px; margin-top: 8px; }
.edit-btn { background: #486284; color: white; border: none; padding: 10px 24px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; }
.edit-btn:hover { background: #324766; transform: translateY(-2px); }
.cancel-btn { background: white; color: #6b7280; border: 1px solid #d1d5db; padding: 10px 24px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: 0.2s; }
.cancel-btn:hover { background: #f3f4f6; }
.save-btn { background: #10b981; color: white; border: none; padding: 10px 24px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; transition: 0.2s; }
.save-btn:hover { background: #059669; }

.profile-header { display: flex; align-items: center; gap: 24px; margin-bottom: 16px; }
.profile-title-info h2 { margin: 0 0 8px 0; font-size: 22px; color: #111827; }

.section-title { font-size: 16px; font-weight: 700; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.mt-24 { margin-top: 24px; }
.mt-16 { margin-top: 16px; }

.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }

label { font-weight: 600; font-size: 13px; color: #4b5563; }
.required { color: #ef4444; }

input { padding: 10px 14px; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: 0.2s; }
.editable-input { background-color: white; border: 1px solid #d1d5db; color: #111827; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
.editable-input:focus { border-color: #111827; }
.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; margin-top: -4px; }

.capitalize { text-transform: capitalize; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.share-modal { background: white; width: 450px; border-radius: 12px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h2 { margin: 0; font-size: 20px; color: #111827; }
.close-btn { background: none; border: none; cursor: pointer; color: #6b7280; }

.input-with-icon { position: relative; display: flex; align-items: center; }
.w-100 { width: 100%; box-sizing: border-box; padding-right: 40px; } /* เว้นที่ไว้ให้ลูกตา */
.eye-icon { position: absolute; right: 12px; color: #9ca3af; cursor: pointer; user-select: none; font-size: 20px; }
.eye-icon:hover { color: #4b5563; }

.toast-notification { position: fixed; bottom: 40px; right: 40px; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 9999; font-weight: 600; font-size: 14px; }
.toast-notification .material-symbols-outlined { font-size: 22px; color: #10b981; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }
</style>