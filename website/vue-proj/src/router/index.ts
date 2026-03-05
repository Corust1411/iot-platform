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
      path: '/managedashboard',
      name: 'Dashboard',
      component: () => import('../views/ManageDashboard.vue'), 
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
    }
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