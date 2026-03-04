import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/ManageDevice.vue'), 
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.path === '/' && token) {
    next('/dashboard'); 
  } 
  else if (to.path !== '/' && !token) {
    next('/'); 
  } 
  else {
    next();
  }
});

export default router;