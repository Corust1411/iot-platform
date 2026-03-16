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
      path: '/login',
      redirect: '/'
    },
    {
      path: '/manage-device',
      name: 'ManageDevice',
      component: () => import('../views/ManageDevice.vue'), 
    },
    {
      path: '/mqtt-websocket-client',
      name: 'MQTTClient',
      component: () => import('../views/MqttClient.vue'),
    },
    {
      path: '/managedashboard',
      name: 'Dashboard',
      component: () => import('../views/ManageDashboard.vue'), 
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/EditProfile.vue'), 
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
      path: '/manage-account',
      name: 'ManageAccount',
      component: () => import('../views/ManageAccount.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/register-account',
      name: 'RegisterAccount',
      component: () => import('../views/RegisterAccount.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/dashboard/:id',
      name: 'DashboardDetail',
      component: () => import('../views/DashboardDetail.vue'),
    },
    {
      path: '/dashboard/:id/create-widget',
      name: 'CreateWidget',
      component: () => import('../views/CreateWidget.vue')
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