<template>
  <div class="login-page">
    <div class="login-container">

      <h1 class="main-title">MULTI-PROTOCOL PLATFORM</h1>

      <div class="avatar-icon">
        <span class="material-symbols-outlined">account_circle</span>
      </div>

      <h2 class="signin-text">Sign in</h2>

      <form @submit.prevent="handleLogin" class="login-form">

        <div class="input-wrapper">
          
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            required
          />
        </div>

        <div class="input-wrapper">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Login</span>
        </button>

      </form>
    </div>
  </div>
</template>

<script>
import { http } from '@/api/http';

export default {
  data() {
    return {
      username: '',
      password: '',
      error: '',
      isLoading: false
    };
  },
  methods: {
    async handleLogin() {
      this.error = '';
      this.isLoading = true;

      try {
        const res = await http.post('/auth/login', {
          username: this.username,
          password: this.password
        });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.user.username);
        
        this.$router.push('/managedevice');
      } catch (err) {
        this.error = err.response?.data?.message || 'Invalid username or password';
      } finally {
        this.isLoading = false;
      }
    }
  }
};


</script>

<style scoped>
/* ตั้งค่าความคมชัดให้ไอคอนที่โหลดมา */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 48;
  font-size: 70px; /* ขนาดไอคอนใหญ่พอดีวงกลม */
}

/* ===== Background ===== */
.login-page {
  min-height: 100vh;
  background: #D3DCE7;
  display: flex;
  align-items: center;
  justify-content: center;
  /* เรียกใช้งานตัวอักษรที่โหลดมาให้ครอบคลุมทั้งหน้า */
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ===== Container ===== */
.login-container {
  text-align: center;
  width: 100%;
  max-width: 380px;
}

/* ===== Main Title ===== */
.main-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #1f2933;
  margin-bottom: 40px;
}

/* ===== Avatar Icon ===== */
.avatar-icon {
  width: 70px;
  height: 70px;
  color: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  background-color: transparent;
}

/* ===== Sign in text ===== */
.signin-text {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #1f2933;
}

/* ===== Input fields ===== */
.input-wrapper {
  margin-bottom: 18px;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 18px;
  border-radius: 30px;
  border: none;
  outline: none;
  background: #FEFEFE;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  font-size: 14px;
  transition: 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* ===== Button ===== */
.login-btn {
  margin-top: 10px;
  width: 140px;
  padding: 12px;
  border-radius: 25px;
  border: none;
  background: #ff4d4f;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  transition: 0.2s;
  font-family: inherit;
}

.login-btn:hover:not(:disabled) {
  background: #e63946;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ===== Error ===== */
.error-message {
  margin-bottom: 15px;
  font-size: 13px;
  color: #b91c1c;
}
</style>