<script>

export default {
  name: 'modal',
  props: ['addUsersToJira'],
  created() {
    this.isLoading = true;
    this.$http
      .get('/jira/roles')
      .then((response) => {
        this.roles = response.data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.isLoading = false;
        this.errorMessage = error.response.data.message ? error.response.data.message : 'Error Occurred in fetching roles';
      });
  },
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      roles: [],
      projectRole: '-1',
      errorMessage: '',
      addedUser: {},
      showWarningMessageBox: false,
    };
  },
  methods: {
    closeErrorMessageBox() {
      this.errorMessage = '';
    },
    closeWarningMessageBox() {
      this.showWarningMessageBox = false;
    },
    addUsersToJiraRole() {
      if (this.projectRole !== '-1') {
        this.isLoading = true;
        this.showWarningMessageBox = true;
        this.closeErrorMessageBox();
        const users = [];

        for (let i = 0; i < this.addUsersToJira.selectedUsers.length; i += 1) {
          users.push({
            name: this.addUsersToJira.selectedUsers[i].name,
            displayName: this.addUsersToJira.selectedUsers[i].displayName,
            emailAddress: this.addUsersToJira.selectedUsers[i].emailAddress,
            userId: this.addUsersToJira.selectedUsers[i].userId,
            userType: this.addUsersToJira.selectedUsers[i].userType,
            userJiraRoleId: this.addUsersToJira.selectedUsers[i].userJiraRoleId,
            oldRole: this.addUsersToJira.selectedUsers[i].oldRole,
          });
        }

        const body = {
          jiraProjectKey: this.addUsersToJira.jiraProjectKey,
          jiraProjectName: this.addUsersToJira.jiraProjectName,
          jiraProjectUrl: this.addUsersToJira.jiraProjectUrl,
          role: this.projectRole.id,
          roleName: this.projectRole.name.slice(-1) === 's' ? this.projectRole.name.slice(0, -1) : this.projectRole.name,
          jiraProjectId: this.addUsersToJira.jiraProjectId,
          users,
        };

        this.$http
          .post('/jira/projects/users', body)
          .then((response) => {
            if (response) {
              this.showWarningMessageBox = false;
              const payload = {
                name: 'addedUserToJiraRole',
                jiraRoles: response.data.response,
                successMessage: 'User Successfully added to Jira Project',
              };
              this.isLoading = false;
              this.resetModalValues();
              this.$emit('addedUsersToJiraRole', payload);
            }
          })
          .catch((error) => {
            this.isLoading = false;
            this.closeWarningMessageBox();
            this.errorMessage = error.response.data.message ? error.response.data.message : 'Error occured in adding users to jira Role';
          });
      } else {
        this.errorMessage = 'Select a project Role';
      }
    },
    resetModalValues() {
      this.projectRole = -1;
      this.errorMessage = '';
    },
  },
};
</script>

<template>
  <div>
    <div class="alert alert-info" v-show="showWarningMessageBox">
      <a href="#" class="close" @click="closeWarningMessageBox()">&times;</a>
      Please wait, User is getting added to Jira project
    </div>
    <div class="alert alert-danger" v-show="errorMessage">
      <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
      {{ errorMessage }}
    </div>
    <form method="post" @submit.prevent="addUsersToJiraRole">
      <div class="form-group col-md-12 projectRoles">
        <label for="projectRole" class="col-md-4">Select Project Role</label>
        <select name="projectRole" class="col-md-4" v-model="projectRole">
            <option value="-1" selected title="Select a Project role"> Select project Role </option>
            <option v-for="role in roles" :key="role.id" :value="role" :title="role.description">{{role.name}}</option>
        </select>
      </div>
      <div class="form-group">
        <button
          type="submit"
          class="btn btn-info"> Add Users To Project</button>
      </div>
    </form>
    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
  </div>
</template>

<style>
</style>
