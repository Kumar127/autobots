<template>
  <section id="header">
    <div class="pageContainer">
      <nav class="navbar navbar-expand-lg navbar-light bg-light  px-5">
          <router-link to="/" class="navbar-brand">Autobots - Self Service Application</router-link>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
          </button>
          <div id="navbarNavDropdown" v-if="showNavBar" class="collapse navbar-collapse justify-content-end">
              <ul class="navbar-nav">
                  <li v-if="loggedInUserName" class="nav-item welcomeTitle">
                    Welcome {{ loggedInUserName }}
                  </li>
                  <li class="nav-item">
                    <router-link  v-if ="rolecheck" to="/manageGroupAdmins" class="navbar-brand">Manage Group Admins</router-link>
                  </li>
                  <li class="nav-item">
                      <router-link to="/"  class="navbar-brand">Home</router-link>
                  </li>
                  <li class="nav-item">
                      <button @click="logout" class=" logoutButton navbar-brand">Logout</button>
                  </li>
              </ul>
          </div>
      </nav>
    </div>
  </section>
</template>

<script>
import globalStore from '../config/store';

export default {
  name: 'Header',
  computed: {
     rolecheck() {
        if (localStorage.userDetails) {
            if (JSON.parse(localStorage.userDetails).roleId === 'PADM')
              return true
            else
              return false
          }
        if (globalStore.user.roleId === 'PADM') {
            return true;
          }
     return false;
    },
    loggedInUserName() {
      /*
        Check if username present in globalStore
        If not present then check in localStorage
        else do not show
      */ 
      if (globalStore.user.fullName) {
        return globalStore.user.fullName;
      }
      if (localStorage.projectAdmin) {
        return localStorage.projectAdmin;
      }
      return null;
    },
    showNavBar() {
      if (this.loggedInUserName || localStorage.projectAdmin) {
        return true;
      }
      return false;
    },
  },
  methods: {
    logout() {
      if (localStorage.getItem('token')) {
        delete localStorage.token;
        delete localStorage.projectAdmin;
        globalStore.setUser({});
        this.$router.push('/login');
      }
    },
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.navbar-light .navbar-nav .nav-link {
    color:chartreuse(0, 0, 0, 1);
}
.navbar-light .navbar-nav .nav-link :hover{
    color:greenyellow;
}
  @media (min-width: 1300px) {
    .container {
        max-width: 1300px;
    }
  }
   .navbar-light .navbar-brand:hover{
    color:greenyellow;
  }
  .navbar-nav {
      li {
          router-link {
              color:lightcoral!important;
          }
          router-link:hover {
            color:greenyellow!important;
          }
      }
  }
  #header {
    background-color: #1e96cc !important;
    height: 60px;
  }
  .navbar {
      router-link {
          color: #ffffff;
      }
      margin-bottom: 3%;
      background-color: transparent!important;
      padding: 10px 0!important;
  }
  .nav-item {
    left: auto !important;
    right: 0px;
  }
</style>
