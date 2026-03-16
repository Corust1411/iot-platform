<template>
  <div class="app-wrapper">
    <TopNavBar :username="username" />

    <div class="layout">
      <SideNavBar />

      <div class="content">
        <div class="page-header space-between">
          <h1 class="page-title">Manage Accounts</h1>
          <button class="create-btn" @click="$router.push('/register-account')">
            <span class="material-symbols-outlined">person_add</span>
            Create Account
          </button>
        </div>

        <div class="account-card">
          <div class="table-container">
            <div class="table-header">
              <span>Username</span>
              <span>Name</span>
              <span>Role</span>
              <span class="text-right">Action</span>
            </div>

            <div 
              v-for="acc in accounts" 
              :key="acc.id" 
              class="table-row"
            >
              <div class="user-info">
                <span class="fw-bold">{{ acc.username }}</span>
                <span class="text-gray text-small">{{ acc.email }}</span>
              </div>
              
              <span>{{ acc.first_name }} {{ acc.last_name }}</span>
              
              <span>
                <span class="role-badge" :class="getRoleClass(acc.role)">
                  {{ acc.role.toUpperCase() }}
                </span>
              </span>
              
              <span class="text-right action-wrapper">
                <button class="icon-btn" @click.stop="toggleMenu(acc.id)">
                  <span class="material-symbols-outlined">more_vert</span>
                </button>
                
                <div v-if="activeMenu === acc.id" class="overflow-menu">
                  <button @click="openEditModal(acc)">
                    <span class="material-symbols-outlined">edit</span> Edit
                  </button>
                  <button class="danger-text" @click="deleteAccount(acc.id, acc.username)">
                    <span class="material-symbols-outlined">delete</span> Delete
                  </button>
                </div>
              </span>
            </div>

            <div v-if="isLoading" class="empty-state">Loading accounts...</div>
            <div v-else-if="accounts.length === 0" class="empty-state">No accounts found.</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Account' : 'Create New Account' }}</h2>
          <button class="close-btn" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group half-width">
              <label>First Name <span class="required">*</span></label>
              <input type="text" v-model="form.first_name" :class="{'error-border': showError && !form.first_name}" />
            </div>
            <div class="form-group half-width">
              <label>Last Name <span class="required">*</span></label>
              <input type="text" v-model="form.last_name" :class="{'error-border': showError && !form.last_name}" />
            </div>
          </div>

          <div class="form-group">
            <label>Username <span class="required">*</span></label>
            <input type="text" v-model="form.username" :class="{'error-border': showError && !form.username}" />
          </div>

          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input type="email" v-model="form.email" :class="{'error-border': showError && !form.email}" />
          </div>

          <div class="form-group">
            <label>Password <span v-if="!isEditing" class="required">*</span></label>
            <input 
              type="password" 
              v-model="form.password" 
              :placeholder="isEditing ? 'Leave blank to keep current password' : 'Enter password'"
              :class="{'error-border': showError && !isEditing && !form.password}" 
            />
          </div>

          <div class="form-group">
            <label>Role <span class="required">*</span></label>
            <select v-model="form.role">
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <span v-if="showError" class="error-text block-error">Please fill in all required fields.</span>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">Cancel</button>
          <button class="save-btn" @click="saveAccount">
            {{ isEditing ? 'Save Changes' : 'Create Account' }}
          </button>
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
      username: 'Unknown User',
      accounts: [],
      isLoading: true,
      showModal: false,
      isEditing: false,
      showError: false,
      showToast: false,
      toastMessage: '',
      activeMenu: null,
      form: {
        id: null,
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        role: 'user'
      }
    }
  },
  async mounted() {
    const storedUser = localStorage.getItem('username');
    if (storedUser) this.username = storedUser;
    
    document.addEventListener('click', this.closeMenu);
    await this.fetchAccounts();
    if (this.$route.query.action === 'created') {
      this.triggerToast('Account registered successfully!');
      this.$router.replace({ path: this.$route.path });
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu);
  },
  methods: {
    toggleMenu(id) {
      this.activeMenu = this.activeMenu === id ? null : id;
    },
    closeMenu() {
      this.activeMenu = null;
    },
    getRoleClass(role) {
      if (role === 'admin') return 'badge-admin';
      if (role === 'viewer') return 'badge-viewer';
      return 'badge-user';
    },
    async fetchAccounts() {
      this.isLoading = true;
      try {
        const res = await http.get('/accounts');
        this.accounts = res.data;
      } catch (error) {
        console.error("Error fetching accounts:", error);
        if (error.response?.status === 403) {
          alert('You do not have permission to view this page.');
          this.$router.push('/dashboard');
        }
      } finally {
        this.isLoading = false;
      }
    },
    openCreateModal() {
      this.isEditing = false;
      this.form = { id: null, first_name: '', last_name: '', username: '', email: '', password: '', role: 'user' };
      this.showError = false;
      this.showModal = true;
    },
    openEditModal(acc) {
      this.isEditing = true;
      this.form = { 
        id: acc.id, 
        first_name: acc.first_name, 
        last_name: acc.last_name, 
        username: acc.username, 
        email: acc.email, 
        password: '', 
        role: acc.role 
      };
      this.showError = false;
      this.showModal = true;
      this.activeMenu = null;
    },
    closeModal() {
      this.showModal = false;
    },
    async saveAccount() {
      if (!this.form.first_name || !this.form.last_name || !this.form.username || !this.form.email) {
        this.showError = true; return;
      }
      if (!this.isEditing && !this.form.password) {
        this.showError = true; return;
      }

      this.showError = false;
      
      try {
        const payload = { ...this.form };
        if (this.isEditing && !payload.password) {
          delete payload.password;
        }

        if (this.isEditing) {
          await http.put(`/accounts/${this.form.id}`, payload);
          this.triggerToast('Account updated successfully!');
        } else {
          await http.post('/accounts', payload);
          this.triggerToast('Account created successfully!');
        }

        this.closeModal();
        await this.fetchAccounts();
      } catch (error) {
        console.error('Failed to save account:', error);
        alert(error.response?.data?.message || 'Failed to save account');
      }
    },
    async deleteAccount(id, username) {
      this.activeMenu = null;
      
      if (username === this.username) {
        alert("You cannot delete your own account while logged in!");
        return;
      }

      const isConfirm = confirm(`Are you sure you want to delete account "${username}"?`);
      if (isConfirm) {
        try {
          await http.delete(`/accounts/${id}`);
          this.triggerToast('Account deleted.');
          await this.fetchAccounts();
        } catch (error) {
          console.error('Failed to delete account:', error);
          alert(error.response?.data?.message || 'Failed to delete account.');
        }
      }
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
.app-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; }
.layout { display: flex; min-height: calc(100vh - 64px); }
.content { flex: 1; padding: 32px 40px; background: #f8fafc; }

.page-header { display: flex; align-items: center; margin-bottom: 24px; }
.space-between { justify-content: space-between; }
.page-title { font-size: 24px; font-weight: 800; margin: 0; color: #111827; }

.create-btn {
  background: #ffffff;
  color: #343434;
  border: 1.5px solid #343434;
  padding: 2px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.create-btn:hover { background: #343434; color: #ffffff; }

.account-card { background: #ffffff; padding: 24px; min-height: 70vh; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.table-container { display: flex; flex-direction: column; background-color: #DEE5ED; border-radius: 10px; padding: 0 1vh; flex: 1; overflow-y: auto; }

.table-header, .table-row { display: grid; grid-template-columns: 2fr 2fr 1.5fr 60px; align-items: center; padding: 16px 12px; }
.table-header { font-weight: 700; color: #4b5563; font-size: 13px; border-bottom: 1px solid #7B7B7B; }
.table-row { border-bottom: 1px solid #7B7B7B; transition: 0.2s; font-size: 14px; }
.table-row:hover { background-color: #d6d8db; }
.table-row:last-child { border-bottom: none; }

.user-info { display: flex; flex-direction: column; gap: 4px; }
.fw-bold { font-weight: 600; color: #1f2937; }
.text-gray { color: #6b7280; }
.text-small { font-size: 12px; }
.text-right { text-align: right; display: flex; justify-content: flex-end; }

/* Role Badges */
.role-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
.badge-admin { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
.badge-user { background-color: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
.badge-viewer { background-color: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }

/* Action Menu */
.action-wrapper { position: relative; }
.icon-btn { background: none; border: none; cursor: pointer; color: #6b7280; border-radius: 50%; padding: 6px; display: flex; align-items: center; transition: 0.2s; }
.icon-btn:hover { background-color: #cbd5e1; color: #1f2937; }

.overflow-menu { position: absolute; top: 100%; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; min-width: 140px; z-index: 10; overflow: hidden; }
.overflow-menu button { background: none; border: none; padding: 10px 16px; text-align: left; cursor: pointer; font-size: 13px; font-weight: 500; color: #374151; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-family: inherit; }
.overflow-menu button:hover { background-color: #f1f5f9; }
.danger-text { color: #ef4444 !important; }
.danger-text:hover { background-color: #fef2f2 !important; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-content { background: white; width: 100%; max-width: 500px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; animation: modalIn 0.3s ease; }
@keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
.close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; border-radius: 50%; transition: 0.2s; }
.close-btn:hover { background: #f3f4f6; color: #111827; }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; gap: 16px; }
.half-width { flex: 1; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.required { color: #ef4444; }
.form-group input, .form-group select { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: 0.2s; }
.form-group input:focus, .form-group select:focus { border-color: #111827; }
.error-border { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 12px; margin-top: 4px; }
.block-error { text-align: center; margin-top: 10px; font-weight: 600; }

.modal-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; display: flex; justify-content: flex-end; gap: 12px; }
.cancel-btn { background: white; border: 1px solid #d1d5db; color: #4b5563; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: 0.2s; }
.cancel-btn:hover { background: #f3f4f6; }
.save-btn { background: #111827; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: 0.2s; }
.save-btn:hover { background: #374151; }

.empty-state { text-align: center; padding: 40px; color: #6b7280; }

.toast-notification { position: fixed; bottom: 40px; right: 40px; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 9999; font-weight: 600; font-size: 14px; }
.toast-notification .material-symbols-outlined { font-size: 22px; color: #10b981; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }
</style>