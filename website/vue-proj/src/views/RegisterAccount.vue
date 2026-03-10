<template>
  <div class="app-wrapper">
    <TopNavBar :username="currentUsername" />

    <div class="layout">
      <SideNavBar />

      <div class="content">
        <div class="page-header">
          <button class="back-btn" @click="$router.push('/manage-account')">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="page-title">Register New Account</h1>
        </div>

        <div class="register-card">
          <h2 class="section-title">Account Information</h2>
          
          <div class="form-section">
            
            <div class="form-row">
              <div class="form-group half-width">
                <label>First Name <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.first_name" 
                  :class="{ 'error-border': showError && !form.first_name }" 
                  placeholder="Enter first name" 
                />
                <span v-if="showError && !form.first_name" class="error-text">First name is required</span>
              </div>
              
              <div class="form-group half-width">
                <label>Last Name <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.last_name" 
                  :class="{ 'error-border': showError && !form.last_name }" 
                  placeholder="Enter last name" 
                />
                <span v-if="showError && !form.last_name" class="error-text">Last name is required</span>
              </div>
            </div>

            <div class="form-group">
              <label>Username <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="form.username" 
                :class="{ 'error-border': showError && !form.username }" 
                placeholder="Choose a unique username" 
              />
              <span v-if="showError && !form.username" class="error-text">Username is required</span>
            </div>

            <div class="form-group">
              <label>Email Address <span class="required">*</span></label>
              <input 
                type="email" 
                v-model="form.email" 
                :class="{ 'error-border': showError && !form.email }" 
                placeholder="email@example.com" 
              />
              <span v-if="showError && !form.email" class="error-text">Email is required</span>
            </div>

            <div class="form-group">
              <label>Password <span class="required">*</span></label>
              <div class="input-with-actions">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="form.password" 
                  :class="{ 'error-border': showError && !form.password }" 
                  placeholder="Enter a strong password" 
                />
                <div class="input-actions">
                  <span class="material-symbols-outlined action-icon" @click="showPassword = !showPassword">
                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                  </span>
                </div>
              </div>
              <span v-if="showError && !form.password" class="error-text">Password is required</span>
            </div>

            <div class="form-group">
              <label>System Role <span class="required">*</span></label>
              <select v-model="form.role" :class="{ 'error-border': showError && !form.role }">
                <option value="user">User (Standard Access)</option>
                <option value="viewer">Viewer (Read-only Access)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>

            <div class="form-actions space-between" style="margin-top: 32px;">
              <button class="cancel-btn" @click="$router.push('/manage-account')">Cancel</button>
              <button class="create-btn" @click="submitAccount">Create Account</button>
            </div>

          </div>
        </div>
      </div>
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
      currentUsername: 'Unknown User',
      showError: false,
      showPassword: false,
      form: {
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        role: 'user'
      }
    }
  },
  mounted() {
    const storedUser = localStorage.getItem('username');
    if (storedUser) this.currentUsername = storedUser;
  },
  methods: {
    async submitAccount() {
      // ตรวจสอบข้อมูลก่อนส่ง
      if (!this.form.first_name || !this.form.last_name || !this.form.username || !this.form.email || !this.form.password) {
        this.showError = true;
        return;
      }
      this.showError = false;

      try {
        await http.post('/accounts', this.form);
        alert('Account created successfully!');
        this.$router.push('/manage-account'); // สร้างเสร็จให้เด้งกลับไปหน้าตาราง
      } catch (error) {
        console.error('Failed to create account:', error);
        alert(error.response?.data?.message || 'Failed to create account');
      }
    }
  }
}
</script>

<style scoped>
.app-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; }
.layout { display: flex; min-height: calc(100vh - 64px); }
.content { flex: 1; padding: 32px 40px; background: #f8fafc; }

/* Header */
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 800; margin: 0; color: #486284; }
.back-btn { border: none; background: none; cursor: pointer; display: flex; align-items: center; color: #FF4B4A; padding: 0; }

/* Main Card */
.register-card { 
  background: #ffffff; 
  padding: 32px 40px; 
  border-radius: 16px; 
  border: 1px solid #e5e7eb; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
  max-width: 700px; 
}

.section-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }

/* Form Styles */
.form-section { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: flex; gap: 20px; }
.half-width { flex: 1; }

.form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
label { font-weight: 600; font-size: 14px; color: #374151; }
.required { color: #ef4444; }

input, select { 
  padding: 10px 14px; 
  border-radius: 8px; 
  border: 1px solid #d1d5db; 
  font-size: 14px; 
  font-family: inherit; 
  transition: border-color 0.2s;
  outline: none;
}
input:focus, select:focus { border-color: #111827; }

.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; margin-top: -4px; }

/* Password Input with eye icon */
.input-with-actions { position: relative; display: flex; align-items: center; width: 100%; }
.input-with-actions input { width: 100%; padding-right: 40px; box-sizing: border-box; }
.input-actions { position: absolute; right: 12px; display: flex; align-items: center; }
.action-icon { font-size: 20px; color: #9ca3af; cursor: pointer; transition: color 0.2s ease; }
.action-icon:hover { color: #111827; }

/* Buttons */
.form-actions { display: flex; justify-content: flex-end; gap: 12px; }
.form-actions.space-between { justify-content: space-between; }

.cancel-btn { 
  border: 1px solid #d1d5db; 
  background: white; 
  color: #4b5563; 
  padding: 10px 24px; 
  border-radius: 20px; 
  cursor: pointer; 
  font-family: inherit; 
  font-weight: 600;
  transition: 0.2s; 
}
.cancel-btn:hover { background: #f3f4f6; }

.create-btn { 
  background: #10b981; 
  color: white; 
  border: none; 
  padding: 10px 24px; 
  border-radius: 20px; 
  cursor: pointer; 
  font-family: inherit; 
  font-weight: 600;
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); 
  transition: 0.2s;
}
.create-btn:hover { background: #059669; }
</style>