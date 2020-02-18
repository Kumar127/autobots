<template>
  <div class="container login">
    <h1 class="loginTitle">LOGIN</h1>
    <form method="post" @submit.prevent="login()">
      <div class="alert alert-danger loginAlert" v-show="loginError">
        <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
        {{ loginError }}
      </div>
      <div class="form-group">
        <label for="userName" title="Username"> User Name </label>
        <input class="form-control" name="userName" id="userName" placeholder="Enter user name" v-model="userName" required autofocus />
      </div>

      <div class="form-group">
        <label for="loginPassword" title="Password"> Password </label>
        <input type="password" class="form-control" name="password" id="loginPassword" placeholder="Enter password"
          v-model="password" required/>
      </div>

      <div class="form-group">
        <button type="submit" class="btn btn-info" title="Login"> Login </button>
      </div>
    </form>
    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
  </div>
</template>

<script>
import axios from 'axios';
import globalStore from '../config/store';
import eventBus from '../eventBus';

const baseUrl = process.env.VUE_APP_API_URL;

export default {
  name: 'Login',
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      userName: '',
      password: '',
      loginError: '',
    };
  },
  mounted() {
    if (localStorage.token) {
      this.$router.push('/');
    }
  },
  methods: {
    login() {
      this.isLoading = true;
      axios.post(`${baseUrl}/login`, {}, {
        auth: {
          username: this.userName,
          password: this.password,
        },
      })
        .then(this.loginSuccessful)
        .catch((error) => {
          this.isLoading = false;
          this.loginError = error.response.data.message ? error.response.data.message : 'Incorred username/password, please try again';
        });
    },
    closeErrorMessageBox() {
      this.loginError = '';
    },
    loginSuccessful(res) {
      if (!res.data.token) {
        this.loginFailed();
        return;
      }
      if (res.data) {
        eventBus.emit('login', res.data.token);
        globalStore.setUser(res.data.userDetails);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('projectAdmin', res.data.userDetails.userName);
        const userDetails = res.data.userDetails;
        delete userDetails.id;
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        this.loginError = '';
        this.isLoading = false;
        setTimeout(() => {
          this.$router.push('/');
        }, 500);
      }
    },
    loginFailed() {
      this.isLoading = false;
      this.loginError = 'Login failed';
      delete localStorage.token;
    },
  },
};

</script>

<style scoped lang='scss'>
</style>
