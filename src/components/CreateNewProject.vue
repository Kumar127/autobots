<script>
import globalStore from '../config/store';

export default {
  name: 'CreateNewProject',
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      projectName: null,
      projectDescription: null,
      errorMessage: '',
      project: {},
      projectId: null,
    };
  },
  methods: {
    createNewProject() {
      this.isLoading = true;
      this.$http
        .post('/projects', {
          name: this.projectName,
          description: this.projectDescription,
        })
        .then((response) => {
          if (response) {
            this.projectId = response.data;
            this.successMessage = 'Create New Group Successfully';
            this.project = {
              id: this.projectId,
              name: this.projectName,
              description: this.projectDescription,
              jira: 'N/A',
            };
            this.addCreatorToGroup();
            this.payload = {
              name: 'createNewProject',
              project: this.project,
              successMessage: 'Create New Group Successfully',
              errorMessage: '',
            };
            this.projectName = null;
            this.projectDescription = null;
            this.isLoading = false;
            this.resetModalValues();
            this.$emit('createdNewProject', this.payload);
          }
        })
        .catch((error) => {
          this.isLoading = false;
          this.errorMessage = error.response.data.message ? error.response.data.message
            : 'Error occured in creating group, please try again';
        });
    },
    resetModalValues() {
      this.projectName = '';
      this.projectDescription = '';
      this.errorMessage = '';
    },
    closeErrorMessageBox() {
      this.errorMessage = '';
    },
    addCreatorToGroup() {
      const users = [{
        userName: globalStore.user.userName,
        emailAddress: globalStore.user.emailAddress,
        fullName: globalStore.user.fullName,
        userType: globalStore.user.userType,
        mobileNumber: globalStore.user.mobileNumber,
      }];
      const body = {
        users,
        projectId: this.projectId,
        projectName: this.projectName,
      };
      this.$http
        .post('/users', body)
        .then(response => response)
        .catch((error) => {
          this.errorMessage = 'Error occured in adding internal users, Please try again';
        });
    },
  },
};
</script>

<template>
<div class="createTeam">
  <div class="alert alert-danger" v-show="errorMessage">
    <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
    {{ errorMessage }}
  </div>
  <form method="post" @submit.prevent="createNewProject">
    <div class="form-row">
      <div class="form-group col-md-12">
        <label for="projectName">Group Name</label>
        <input
          type="text"
          class="form-control"
          id="projectName"
          v-model="projectName"
          placeholder="Enter Group Name"
          required
          >
      </div>
      <div class="form-group col-md-12">
        <label for="projectDescription">Group Description</label>
        <textarea
          class="form-control"
          id="projectDescription"
          v-model="projectDescription"
          placeholder="Enter Group Description"> </textarea>
      </div>
      <div class="form-group">
        <button
          type="submit"
          class="btn btn-info"> Create </button>
      </div>
    </div>
  </form>
    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
</div>
</template>

<style>
</style>
