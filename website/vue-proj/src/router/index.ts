import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: () => import('../views/Login.vue'), 
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
    {
      path: '/register-device',
      name: 'RegisterDevice',
      component: () => import('../views/RegisterDevice.vue'),
    },
    {
      path: '/device/:id',
      name: 'DeviceDetail',
      component: () => import('../views/DeviceDetail.vue'),
    },
    {
      path: '/manageaccount',
      name: 'ManageAccount',
      component: () => import('../views/ManageAccount.vue'),
      meta: { 
        requiresAuth: true, 
        requiresAdmin: true
      }
    }
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }
  if (to.meta.requiresAdmin && role !== 'admin') {
    alert('Access Denied: Admins only');
    return next('/dashboard');
  }
  
  next();
  
});

export default router;