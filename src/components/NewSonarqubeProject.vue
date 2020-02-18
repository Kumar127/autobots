<script>
export default {
  name: 'linkSonarqubeProject',
  props: ['projectId', 'projectName'],
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      sonarqubeProjectName: null,
      sonarqubeProjectKey: null,
      sonarqubeProjectVisibility: null,
      sonarqubeProjectGroupName: null,
      sonarqubeUser: null,
      errorMessage: '',
      projectCreatorLogin: '',
      projectCreatorName: '',
      projectCreatorEmail: '',
      sonarqubeProject: {},
    };
  },
  methods: {
    setGroupName() {
      return this.sonarqubeProjectName + '_' + this.sonarqubeProjectKey;
    },
    createNewSonarqubeProject() {
      this.isLoading = true;
      const localData = JSON.parse(localStorage.userDetails);
      const body = {
        sonarqubeProjectName: this.sonarqubeProjectName,
        sonarqubeProjectKey: this.sonarqubeProjectKey,
        sonarqubeProjectVisibility: this.sonarqubeProjectVisibility,
        projectId: this.projectId,
        sonarqubeProjectGroupName: this.setGroupName(),
        projectCreatorLogin: localData.userName,
        projectCreatorName: localData.fullName,
        projectCreatorEmail: localData.emailAddress,
      };
      this.$http
        .post('/sonarqube/project', body)
        .then((response) => {
          const self = this;
          if (response) {
            self.addSonarqubeUserToGroup(response);
          }
        })
        .catch((error) => {
          this.isLoading = false;
          this.errorMessage = error.response.data.message ? error.response.data.message : 'Error Occurred in create new sonarqube project';
        });
    },
    addSonarqubeUserToGroup(sonarqubeResponse) {
      const localData = JSON.parse(localStorage.userDetails);
      this.sonarqubeUser = {
        userName: localData.userName,
        emailAddress: localData.emailAddress,
        fullName: localData.fullName,
        userType: 'I',
        mobileNumber: 'N/A',
        sonarqubeGroup: sonarqubeResponse.data.sonarqubeProjectGroupName,
      };
      const users = [this.sonarqubeUser];
      const body = {
        users,
        projectId: this.projectId,
        projectName: this.projectName,
      };
      this.$http
        .post('/users', body)
        .then((response) => {
          this.sonarqubeProject = {
            sonarqubeProjectId: sonarqubeResponse.data.sonarqubeProjectId,
            sonarqubeProjectName: sonarqubeResponse.data.sonarqubeProjectName,
            sonarqubeProjectKey: sonarqubeResponse.data.sonarqubeProjectKey,
            sonarqubeProjectGroupName: sonarqubeResponse.data.sonarqubeProjectGroupName,
            projectId: sonarqubeResponse.data.projectId,
          };
          this.sonarqubeUser.userId = response.data[0].userId;
          const payload = {
            name: 'linksonarqubeProject',
            sonarqubeProject: this.sonarqubeProject,
            users: [this.sonarqubeUser],
            successMessage: 'Created and Linked New soanrqube Project To the Team',
          };
          this.isLoading = false;
          this.$emit('linkedsonarqubeProject', payload);
        })
        .catch((error) => {
          this.isLoading = false;
          this.errorMessage = error.response.data.message ? error.response.data.message
            : 'Error occured in adding Project creator to sonarqube, Please try again';
          // this.errorMessage = 'Error occured in adding Project creator to sonarqube, Please try again';
        });
    },
    resetModalValues() {
      this.sonarqubeProjectName = '';
      this.sonarqubeProjectKey = '';
      this.errorMessage = '';
    },
    closeErrorMessageBox() {
      this.errorMessage = '';
    },
  },
};
</script>

<template>
  <div class="linkSonarqubeProject">
    <div class="alert alert-danger" v-show="errorMessage">
      <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
        {{ errorMessage }}
    </div>
      <form method="post" @submit.prevent="createNewSonarqubeProject">
        <div class="form-row">
        <div class="form-group col-md-6">
          <strong><label for="sonarqubeProjectName">Project Name</label></strong>
          <input
            type="text"
            class="form-control"
            id="sonarqubeProjectName"
            v-model="sonarqubeProjectName"
            placeholder="Enter Project Name"
            required>
        </div>
        <div class="form-group col-md-6">
          <strong><label for="sonarqubeProjectKey">Project Key</label></strong>
          <input
            type="text"
            class="form-control"
            id="sonarqubeProjectKey"
            v-model="sonarqubeProjectKey"
            placeholder="Enter Project Key"
            v-uppercase
            required>
        </div>
        <div class="form-group col-md-12" required>
          <strong><label for="searchProjectLeads" class="radio-inline">Visibility</label> </strong> &nbsp;
            <input  type="radio" name="visibility" value="public" v-model="sonarqubeProjectVisibility"> Public
          <label for="searchProjectLeads" class="radio-inline"></label> &nbsp;
            <input type="radio" name="visibility" value="private" v-model="sonarqubeProjectVisibility"> Private
        </div>
        <div class="form-group">
          <button
            type="submit"
            class="btn btn-info"> Create Sonarqube project </button>
        </div>
      </div>
    </form>
    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
  </div>
</template>

<style>
</style>
