<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div class="modal-dialog modal-lg modal-dialog-centered"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription">
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title pull-left">Are you sure?</h4>
                <button type="button" class="close" @click="onCancel" aria-label="Close modal">&times;</button>
              </div>
              <div class="modal-window">
                <slot name="message">
                </slot>
                <div class="actions">
                <button class="btn btn-info confirm" @click="onConfirm">Confirm</button>
                <button class="btn btn-info cancel" @click="onCancel">Cancel</button>
                </div>
              </div>
            </div>
        </div>
    </div>
    
    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
  </transition>
</template>
<script>

export default {
  name: 'confirmModal',
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      errorMessage: '',
      userData: {},
      sonarUsers: [],
    };
  },
  props: ['jenkinsUsersRole', 'sonarqubeUserData'],
  methods: {
    onCancel() {
      this.$emit('close', null);
    },
    onConfirm() {
      if (this.jenkinsUsersRole) {
        const users = this.jenkinsUsersRole.users.map(user => {
          if (user.userType !== 'External') {
            return user.name;
          }
        });
        const body = {
          jenkinsProjectId: this.jenkinsUsersRole.jenkinsProjectId,
          jenkinsRoleType: 'projectRoles',
          jenkinsProjectRole: this.jenkinsUsersRole.jenkinsProjectRole,
          users,
        };
        this.isLoading = true;
        this.$http
          .post('/jenkins/users', body)
          .then((response) => {
            if (response) {
              const payload = {
                name: 'addUsersToJenkinsRole',
                jenkinsRoles: response.data,
                successMessage: 'Users Successfully added to Jenkins Project',
              };
              this.isLoading = false;
              this.$emit('confirm', payload);
            }
          })
          .catch((error) => {
            this.isLoading = false;
            this.errorMessage = error.response.data ? error.response.data : 'Error occured in adding users to jenkins Role';
          });
      }
      else if (this.sonarqubeUserData) {
        this.isLoading = true;
        this.$emit('isLoading',this.isLoading);
        for (let i = 0; i < this.sonarqubeUserData.users.length; i +=1) {
          if (this.sonarqubeUserData.users[i].userType !== 'External') {
            this.userData = {
              login: this.sonarqubeUserData.users[i].name,
              emailAddress: this.sonarqubeUserData.users[i].emailAddress,
              fullName: this.sonarqubeUserData.users[i].displayName,
            };
          }
          this.sonarUsers.push(this.userData);
        }
        const sonarBody = {
          sonarqubeProjectId: this.sonarqubeUserData.sonarqubeProjectId,
          sonarqubeProjectGroupName: this.sonarqubeUserData.sonarqubeProjectGroupName,
          sonarUsers: this.sonarUsers,
        };
        this.$http
          .post('/sonarqube/project/user', sonarBody)
          .then((response) => {
            if (response) {
              const payload = {
                name: 'addUsersToSonarqube',
                sonarUsers: response.data,
                successMessage: 'Users Successfully added to Sonarqube Project',
              };
              this.isLoading = false;
              this.$emit('confirm', payload);
            }
          })
          .catch((error) => {
            this.isLoading = false;
            this.errorMessage = error.response.data.errors[0].msg ? error.response.data.errors[0].msg
              : 'Error occured in adding users to sonarqube';
          });
      }
       else {
        this.$emit('confirm', null);
      }
    },
  },
};
</script>

<style >
.action button {
  border-radius: 16px;
}
.modal-header {
    background: #17a2b8;
    color: white;
}
.modal-window {
  margin: 5px;
}
p {
  padding: 10px;
}
.btn {
  margin: 0px 5px;
}
</style>
