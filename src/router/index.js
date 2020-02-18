import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  // get rid of the hash (#) in Url
  // the hash (#) helps the page not to be reloaded when the URL changes
  base: process.env.BASE_URL,
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/Login.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../components/Home.vue'),
    },
    {
      path: '/groups/:projectName/users',
      name: 'users',
      component: () => import('../components/Users.vue'),
    },
    {
      path: '/manageGroupAdmins',
      name: 'manageGroupAdmins',
      component: () => import('../components/ProjectAdmin.vue'),
     },  
     ],
     });
