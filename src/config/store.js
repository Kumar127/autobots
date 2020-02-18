import Vue from 'vue';

const globalStore = new Vue({
  data: {
    user: {},
    project: {},
  },
  methods: {
    getUser() {
      return this.user;
    },
    setUser(user) {
      this.user = user;
    },
    getProject() {
      return this.project;
    },
    setProject(project) {
      this.project = project;
    },
  },
});

export default globalStore;
