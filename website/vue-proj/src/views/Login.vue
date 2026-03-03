<template>
  <div class="login-container">
    <h1>MULTI-PROTOCOL PLATFORM</h1>
    <h2>Sign in</h2>

    <input v-model="username" placeholder="Username" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="handleLogin">Login</button>

    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script>

import { api } from '@/services/api';

export default {
  data() {
    return {
      username: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      try {
        const res = await api.post('/auth/login', {
          username: this.username,
          password: this.password
        });

        localStorage.setItem('token', res.data.token);

        this.$router.push('/dashboard');
      } catch (err) {
        this.error = 'Invalid username or password';
      }
    }
  }
};
</script>