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
      path: '/managedevice',
      name: 'ManageDevice',
      component: () => import('../views/ManageDevice.vue'), 
    },
    {
      path: '/mqtt',
      name: 'MQTTClient',
      component: () => import('../views/Mqtt.vue'),
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'), 
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'), 
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.path === '/' && token) {
    next('/managedevice'); 
  } 
  else if (to.path !== '/' && !token) {
    next('/'); 
  } 
  else {
    next();
  }
});

export default router;