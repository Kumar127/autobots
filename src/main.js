import Vue from 'vue';
import Loading from 'vue-loading-overlay';
import App from './App.vue';
import router from './router';
import axios from './config/axios';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.config.productionTip = false;
Vue.prototype.$http = axios;

Vue.component('loading-spinner', Loading);

// Declaring global directive for uppercase input text
Vue.directive('uppercase', {
  update(el) {
    el.value = el.value.toUpperCase();
  },
});

new Vue({
  router,
  axios,
  render: h => h(App),
}).$mount('#app');
