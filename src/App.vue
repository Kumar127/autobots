<template>
  <div id="app">
    <AppHeader/>
    <router-view> </router-view>
    <AppFooter/>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter,
  },
};
</script>

<style lang="scss">
@import '../node_modules/bootstrap/scss/bootstrap.scss';
#app {
  min-height: 100vh;
  padding-bottom: 50px;
  position: relative;
}

</style>
