<template>
  <div class="pageContainer users">
      <h3><label title="Group dashboard">Group Dashboard</label></h3>
      <h5 v-if="project.jenkinsProjectType === 'N/A' || project.jiraProjectName === 'N/A' ||project.sonarqubeProjectName === 'N/A'">
      Please click on any of the tool icons below to Create a new resource in the tool</h5>
    <ul>
      <li v-if="project.jenkinsProjectType === 'N/A'" title="Link a Jenkins Project to group">
      <button class="btn btn-outline-info same" @click="showCreateJenkinsProjectModal"
      title="Create new jenkins project">
       <strong> <img src="~@/assets/jenkinslogo.svg">   </strong> </button></li>
      <li v-else class="jiraProjectName same"  title="Jenkins project"> <label> JENKINS FOLDER NAME -
        <strong> {{ project.jenkinsProjectName }} </strong> </label> </li>
      <li v-if="project.jiraProjectName === 'N/A'"  title="Link a Jira Project to group">
      <button class="btn btn-outline-info same" @click="showCreateNewJiraProjectModal"
      title="Create new jira project"> <strong><img src="~@/assets/Jiralogo.png"> </strong></button></li>
      <li v-else class="jiraProjectName same"  title="Jira project"> <label> JIRA PROJECT -
        <strong> {{ project.jiraProjectName }} </strong> </label> </li>
      <li v-if="project.sonarqubeProjectName === 'N/A'"  title="Link a Sonarqube Project to group">
      <button class="btn btn-outline-info same" @click="showCreateNewSonarqubeProjectModal"
      title="Create and Link New Sonarqube Project">
        <strong> <img src="~@/assets/sonarqube_logo.png">  </strong> </button></li>
      <li v-else  title="jiraProjectName same"> <label> SONARQUBE PROJECT -
        <strong> {{ project.sonarqubeProjectName }} </strong> </label> </li>
      <li>
        <button class="btn btn-outline-info same" @click="showUserModal" title="Add new user to group">
          <strong> <i class="fas fa-user">&nbsp;&nbsp; New User </i></strong>
        </button>
      </li>
    </ul>
    <div class="alert alert-success" v-show="successMessage">
        <a href="#" class="close" @click="closeSuccessMessageBox()">&times;</a>
        {{ successMessage }}
    </div>
    <div class="usersTable">
       <label title="List of user in group"> List of Users for SSA Group : <b> {{this.$route.params.projectName}} </b> </label>
      <p>
      <button class="btn btn-info btn-sm actionButtons" v-if="showRemoveUserFromTeam"
        @click="showRemoveUsersConfirmBox" title="Remove user from group">
        Remove User From Group</button>
      <button class="btn btn-info btn-sm  actionButtons" v-if="showAddUserToJenkins"
        @click="showAddUsersToJenkinsConfirmBox" title="Add user to jenkins">
        Add Users to Jenkins</button>
      <button  class="btn btn-info btn-sm actionButtons" v-if="showAddUserToJira"
      @click="showAddUsersToJiraModal" title="Add users to jira role">
        Add Users to Jira </button>
      <button class="btn btn-info btn-sm actionButtons" v-if ="showAddUserToSonarqube"
        @click="showAddUsersToSonarqubeConfirmBox" title="Add users to sonarqube group">
        Add Users To Sonarqube </button>
      </p>
      <vue-bootstrap4-table :classes="classes" :rows="rows" :columns="columns" :config="config" @on-select-row="onSelectUsers"
      @on-all-select-rows="onSelectAllUsers" @on-unselect-row="onUnSelectUsers" @on-all-unselect-rows="onUnSelectUsers"
      ref="usersTable">
          <template slot="empty-results">
            No Users present in group
        </template>
        <template slot="jira_role_slot" slot-scope="props">
          <div>
              <span>
              {{props.cell_value}}
              </span>
              <button v-show="props.cell_value !== 'N/A'"
                class="btn btn-info btn-sm removeUserJiraBtn" @click.stop="removeUserFromJira(props.row)">
                <i class="fa fa-trash" aria-hidden="true"></i></button>
          </div>
      </template>
        <template slot="paginataion-previous-button">
          <i class="fa fa-arrow-left" aria-hidden="true"></i>
        </template>
        <template slot="paginataion-next-button">
          <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </template>
      </vue-bootstrap4-table>
    </div>
    <confirmModal
      v-show="isConfirmModalVisible"
      @close="closeRemoveUserConfirmBox"
      @isLoading ='isload'
      @confirm="confirmBoxSuccess"
      v-bind:jenkinsUsersRole = "jenkinsUsersRole"
      v-bind:sonarqubeUserData = "sonarqubeUserData"
    >
      <template slot="message">
        <p v-show="confirmBoxTitle && confirmBoxTitle === 'sonarqube'">
        <strong>DO YOU WANT TO ADD THE SELECTED USERS TO SONARQUBE GROUP ? </strong></p>
        <p v-show="confirmBoxTitle && confirmBoxTitle === 'removeUser'"> Do you really want to delete
          <strong>{{ selectedUsers.length }}</strong>
          {{selectedUsers.length > 1 ? 'users' : 'user'}} from the team <b> {{projectName}} </b> ? <p>
        <p v-show="confirmBoxTitle && confirmBoxTitle === 'jenkins'"> Do you want to add the users to jenkins Project Role? </p>
      </template>
    </confirmModal>
    <modal
      v-show="isModalVisible"
      @close="closeModal"
      v-bind:modalName = "modalName"
      v-bind:modalTitle = "modalTitle"
      v-bind:projectId = "projectId"
      v-bind:projectName = "projectName"
      v-bind:addUsersToJira = "addUsersToJira"
      v-bind:usersPresent = "usersPresent"
    >
    </modal>
    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
  </div>
</template>

<script>
import VueBootstrap4Table from 'vue-bootstrap4-table';
import modal from './ModalComponent.vue';
import confirmModal from './ConfirmModalComponent.vue';
import globalStore from '../config/store';

export default {
  name: 'Users',
  components: {
    VueBootstrap4Table,
    modal,
    confirmModal,
  },
  computed: {
    projectName() {
      return this.project.projectName;
    },
    addUsersToJira() {
      return {
        jiraProjectId: this.project.jiraProjectId,
        jiraProjectKey: this.project.jiraProjectKey,
        jiraProjectName: this.project.jiraProjectName,
        jiraProjectUrl: this.project.jiraProjectUrl,
        selectedUsers: this.selectedUsers,
      };
    },
    showRemoveUserFromTeam() {
      if (this.selectedUsers.length > 0) {
        return true;
      }
      return false;
    },
    showAddUserToSonarqube() {
      if (this.selectedUsers.length > 0 && this.selectedUsers[0].sonarqubeGroup === 'N/A' && this.project.sonarqubeProjectId !== 'N/A') {
        return true;
      }
      return false;
    },
    showAddUserToJira() {
      if (this.selectedUsers.length > 0 && this.project.jiraProjectName !== 'N/A') {
        return true;
      }
      return false;
    },
    usersPresent() {
      return this.rows.map(row => row.emailAddress);
    },
    showAddUserToJenkins() {
      if (this.selectedUsers.length > 0 && this.project.jenkinsProjectId !== 'N/A') {
        return true;
      }
      return false;
    },
    jenkinsUsersRole() {
      if (this.confirmBoxTitle === 'jenkins') {
        return {
          jenkinsProjectId: this.project.jenkinsProjectId,
          jenkinsProjectRole: this.project.jenkinsProjectRole,
          users: this.selectedUsers,
        };
      }
      return null;
    },
    sonarqubeUserData() {
      if (this.confirmBoxTitle === 'sonarqube') {
        return {
          sonarqubeProjectId: this.project.sonarqubeProjectId,
          sonarqubeProjectGroupName: this.project.sonarqubeProjectGroupName,
          users: this.selectedUsers,
        };
      }
      return null;
    },
  },
  created() {
    this.isLoading = true;
    this.project = globalStore.getProject();
    this.$http.get('/projects/users', {
      params: {
        projectId: this.projectId,
      },
    })
      .then((response) => {
        for (let i = 0; i < response.data.length; i += 1) {
          if (response.data[i].userId) {
            this.rows.push({
              userId: response.data[i].userId,
              fullName: response.data[i].fullName,
              userName: response.data[i].userName,
              emailAddress: response.data[i].emailAddress,
              mobileNumber: response.data[i].mobileNumber,
              userType: response.data[i].userType === 'I' ? 'Internal' : 'External',
              jiraRole: response.data[i].jiraRole ? response.data[i].jiraRole : 'N/A',
              jiraRoleId: response.data[i].jiraRoleId,
              userJiraRoleId: response.data[i].userJiraRoleId,
              jenkinsProjectName: response.data[i].jenkinsProjectName,
              jenkinsRole: response.data[i].jenkinsRole ? response.data[i].jenkinsRole : 'N/A',
              sonarqubeGroup: response.data[i].sonarqubeGroup ? response.data[i].sonarqubeGroup : 'N/A',
            });
          }
        }
        this.isLoading = false;
      })
      .catch((err) => {
        this.isLoading = false;
        this.errorMessage = err.response.data.message ? err.response.data.message : 'Error Occurred in fetching Users of team';
        if (err.code && err.code === 'NO_AUTH') {
          this.$router.push('/');
        }
      });
  },
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      selectedUsers: [],
      unSelectedUser: {},
      rows: [],
      columns: [
        {
          label: 'Name',
          name: 'fullName',
          sort: true,
        },
        {
          label: 'User Name',
          name: 'userName',
          sort: true,
        },
        {
          label: 'Email Id',
          name: 'emailAddress',
          sort: true,
        },
        {
          label: 'Mobile Number',
          name: 'mobileNumber',
          sort: true,
        },
        {
          label: 'User Type',
          name: 'userType',
          sort: true,
        },
        {
          label: 'Jira Role',
          name: 'jiraRole',
          slot_name: 'jira_role_slot',
          sort: true,
        },
        {
          label: 'Jenkins Role',
          name: 'jenkinsRole',
          sort: true,
        },
        {
          label: 'Sonarqube Group',
          name: 'sonarqubeGroup',
          sort: true,
        },
      ],
      config: {
        global_search: {
          visibility: false,
        },
        show_refresh_button: false,
        show_reset_button: false,
        card_title: 'Users',
        card_mode: false,
        checkbox_rows: true,
        rows_selectable: true,
        pagination: true, // default true
        pagination_info: true, // default true
        per_page_options: [5, 10, 20, 30],
        selected_rows_info: false,
      },
      classes: {
        tableWrapper: 'data-table-wrapper',
        table: 'table table-bordered table-striped',
	row: 'table-rowss'
      },
      isModalVisible: false,
      projectId: globalStore.getProject().projectId,
      successMessage: '',
      project: {},
      isNewJiraProjectModalVisible: false,
      isAddUsersToJiraModalVisible: false,
      modalName: '',
      modalTitle: '',
      isConfirmModalVisible: false,
      confirmBoxTitle: '',
    };
  },
  methods: {
    showUserModal() {
      this.modalName = 'addUsersToProject';
      this.modalTitle = 'Add Users to Group';
      this.isModalVisible = true;
    },
    closeModal(payload) {
      if (payload) {
        if (payload.name === 'addUsers') {
          if (payload.users.length > 0) {
            this.addUsersToDataTable(payload.users);
          }
        } else if (payload.name === 'linkJiraProject') {
          this.project.jiraProjectId = payload.jiraProject.jiraProjectId;
          this.project.jiraProjectKey = payload.jiraProject.jiraProjectKey;
          this.project.jiraProjectName = payload.jiraProject.jiraProjectName;
          this.project.jiraProjectUrl = payload.jiraProject.jiraProjectUrl;
          globalStore.setProject(this.project);
          this.addUsersToDataTable(payload.users);
        } else if (payload.name === 'linksonarqubeProject') {
          this.project.sonarqubeProjectKey = payload.sonarqubeProject.sonarqubeProjectKey;
          this.project.sonarqubeProjectName = payload.sonarqubeProject.sonarqubeProjectName;
          this.project.sonarqubeProjectGroupName = payload.sonarqubeProject.sonarqubeProjectGroupName;
          this.project.sonarqubeProjectId = payload.sonarqubeProject.sonarqubeProjectId;
          this.project.projectId = payload.sonarqubeProject.projectId;
          globalStore.setProject(this.project);
          this.addUsersToDataTable(payload.users);
        } else if (payload.name === 'addedUserToJiraRole') {
          this.rows.map((row) => {
            for (let i = 0; i < payload.jiraRoles.length; i += 1) {
              if (row.userId === payload.jiraRoles[i].userId) {
                row.jiraRole = payload.jiraRoles[i].roleName; // eslint-disable-line no-param-reassign
                row.jiraRoleId = payload.jiraRoles[i].role; // eslint-disable-line no-param-reassign
                row.userJiraRoleId = payload.jiraRoles[i].userJiraRoleId; // eslint-disable-line no-param-reassign
                break;
              }
            }
            return row;
          });
          this.$refs.usersTable.unSelectAllItems();
          this.selectedUsers = [];
        } else if (payload.name === 'linkJenkinsProject') {
          this.project.jenkinsProjectId = payload.jenkinsProject.jenkinsProjectId;
          this.project.jenkinsProjectName = payload.jenkinsProject.jenkinsProjectName;
          this.project.jenkinsProjectType = payload.jenkinsProject.jiraPrjenkinsProjectTypejectKey;
          this.project.jenkinsProjectRole = payload.jenkinsProject.jenkinsProjectRole;
          globalStore.setProject(this.project);
        }
        this.successMessage = payload.successMessage;
        // Close Success Message after 10 secs
        if (this.successMessage) {
          setTimeout(() => {
            this.successMessage = '';
          }, 10000);
        }
      }
      this.isModalVisible = false;
    },
    onSelectUsers(payload) {
      if (payload.selected_items.length > 0) {
        for (let i = 0; i < payload.selected_items.length; i += 1) {
          if (!this.selectedUsers.some(user => user.name === payload.selected_items[i].userName)) {
            this.selectedUsers.push({
              name: payload.selected_items[i].userName,
              displayName: payload.selected_items[i].fullName,
              emailAddress: payload.selected_items[i].emailAddress,
              userId: payload.selected_items[i].userId,
              userType: payload.selected_items[i].userType,
              userJiraRoleId: payload.selected_items[i].userJiraRoleId,
              oldRole: payload.selected_items[i].jiraRole === 'N/A' ? null : payload.selected_items[i].jiraRoleId,
              jenkinsRole: payload.selected_items[i].jenkinsRole === 'N/A' ? null : payload.selected_items[i].jenkinsRole,
              sonarqubeGroup: payload.selected_items[i].sonarqubeGroup,
            });
          }
        }
      }
    },
    onUnSelectUsers(payload) {
      if (payload.selected_items.length > 0) {
        this.unSelectedUser = {
          name: payload.unselected_item.userName,
          displayName: payload.unselected_item.fullName,
          emailAddress: payload.unselected_item.emailAddress,
          userId: payload.unselected_item.userId,
        };
        for (let i = 0; i < this.selectedUsers.length; i += 1) {
          if (this.selectedUsers[i].name === this.unSelectedUser.name) {
            this.selectedUsers.splice(i, 1);
          }
        }
      } else {
        this.selectedUsers = [];
      }
    },
    showCreateNewJiraProjectModal() {
      this.modalName = 'linkJiraProject';
      this.modalTitle = 'Create and Link New Jira Project';
      this.isModalVisible = true;
    },
    showCreateNewSonarqubeProjectModal() {
      this.modalName = 'linkSonarqubeProject';
      this.modalTitle = 'Create and Link New Sonarqube Project';
      this.isModalVisible = true;
    },
    showAddUsersToJiraModal() {
      this.modalName = 'addUsersToJiraRole';
      this.modalTitle = 'Assign Role to Users';
      this.isModalVisible = true;
    },
    showRemoveUsersConfirmBox() {
      this.confirmBoxTitle = 'removeUser';
      this.isConfirmModalVisible = true;
    },
    closeRemoveUserConfirmBox() {
      this.isConfirmModalVisible = false;
    },
    isload() {
      this.isConfirmModalVisible = false;
      this.isLoading = true;
    },
    confirmBoxSuccess(payload) {
      if (payload) {
        if (payload.name && payload.name === 'addUsersToJenkinsRole') {
          this.rows.map((row) => {
            for (let i = 0; i < payload.jenkinsRoles.length; i += 1) {
              if (row.userName === payload.jenkinsRoles[i].userId) {
                row.jenkinsRole = payload.jenkinsRoles[i].jenkinsRole; // eslint-disable-line no-param-reassign
                break;
              }
            }
            return row;
          });
          this.$refs.usersTable.unSelectAllItems();
          this.successMessage = payload.successMessage;
          // Close Success Message after 10 secs
          if (this.successMessage) {
            setTimeout(() => {
              this.successMessage = '';
            }, 10000);
          }
          this.isConfirmModalVisible = false;
        } else if (payload.name && payload.name === 'addUsersToSonarqube') {
          this.rows.map((row) => {
            for (let i = 0; i < payload.sonarUsers.responseValue.length; i += 1) {
              if (row.userName === payload.sonarUsers.responseValue[i].sonarUsersGroupLogin) {
                row.sonarqubeGroup = payload.sonarUsers.sonarqubeProjectGroupName; // eslint-disable-line no-param-reassign
              }
            }
            return row;
          });
          this.$refs.usersTable.unSelectAllItems();
          this.successMessage = payload.successMessage;
          // Close Success Message after 10 secs
          if (this.successMessage) {
            setTimeout(() => {
              this.successMessage = '';
            }, 10000);
          }
          this.isConfirmModalVisible = false;
        }
        this.isLoading = false;
      } else {
        const body = {
          projectId: this.projectId,
          projectName: this.projectName,
          users: this.selectedUsers,
        };
        this.isLoading = true;
        this.$http
          .delete('/users', { data: body })
          .then((response) => {
            if (response) {
              for (let i = 0; i < this.rows.length; i += 1) {
                for (let j = 0; j < this.selectedUsers.length; j += 1) {
                  if (this.selectedUsers[j].userId === this.rows[i].userId) {
                    this.rows.splice(i, 1);
                  }
                }
              }
              this.selectedUsers = [];
              this.isLoading = false;
              this.successMessage = response.data;
              // Close Success Message after 10 secs
              if (this.successMessage) {
                setTimeout(() => {
                  this.successMessage = '';
                }, 10000);
              }
            }
          })
          .catch((error) => {
            this.isLoading = false;
            this.errorMessage = error.response.data;
          });
        this.isConfirmModalVisible = false;
      }
    },
    closeSuccessMessageBox() {
      this.successMessage = '';
    },
    removeUserFromJira(selectedRow) {
      this.isLoading = true;
      const body = {
        jiraProjectKey: this.project.jiraProjectKey,
        userJiraRoleId: selectedRow.userJiraRoleId,
        jiraRoleId: selectedRow.jiraRoleId,
        userName: selectedRow.userName,
        emailAddress: selectedRow.emailAddress,
        fullName: selectedRow.fullName,
        jiraProjectName: this.project.jiraProjectName,
      };
      this.$http
        .delete('/jira/projects/users', { data: body })
        .then((response) => {
          if (response) {
            this.rows.map((row) => {
              if (row.userName === body.userName) {
                row.jiraRoleId = null; // eslint-disable-line no-param-reassign
                row.jiraRole = 'N/A'; // eslint-disable-line no-param-reassign
                row.userJiraRoleId = null; // eslint-disable-line no-param-reassign
                return row;
              }
              return row;
            });
            this.$refs.usersTable.unSelectAllItems();
            this.isLoading = false;
            this.successMessage = response.data;
            // Close Success Message after 10 secs
            if (this.successMessage) {
              setTimeout(() => {
                this.successMessage = '';
              }, 10000);
            }
          }
        })
        .catch((error) => {
          this.isLoading = false;
          this.errorMessage = error.response.data.message;
        });
    },
    showCreateJenkinsProjectModal() {
      this.modalName = 'linkJenkinsProject';
      this.modalTitle = 'Link Jenkins to Group';
      this.isModalVisible = true;
    },
    showAddUsersToJenkinsConfirmBox() {
      this.confirmBoxTitle = 'jenkins';
      this.isConfirmModalVisible = true;
    },
    showAddUsersToSonarqubeConfirmBox() {
      this.confirmBoxTitle = 'sonarqube';
      this.isConfirmModalVisible = true;
    },
    addUsersToDataTable(users) {
      if (users) {
        for (let i = 0; i < users.length; i += 1) {
          this.rows.push({
            userId: users[i].userId,
            userName: users[i].userName,
            emailAddress: users[i].emailAddress,
            fullName: users[i].fullName,
            mobileNumber: users[i].mobileNumber,
            userType: users[i].userType === 'I' ? 'Internal' : 'External',
            jiraRole: users[i].jiraRole ? users[i].jiraRole : 'N/A',
            jenkinsRole: users[i].jenkinsRole ? users[i].jenkinsRole : 'N/A',
            sonarqubeGroup: users[i].sonarqubeGroup ? users[i].sonarqubeGroup : 'N/A',
          });
        }
      }
    },
  },
};

</script>

<style scoped lang='scss'>
h3 {
  padding: 5px;
  display: flex;
  justify-items: center;
  justify-content: center;
  margin-top: 10px;
}
alert {
  margin:10px;
  padding:15px;
}
.same {
  width: 13%;
}
.dataTable {
  overflow-x: unset!important;
}
@media (min-width: 1300px) {
  .container {
      max-width: 1280px;
  }
}
.users {
  ul {
    list-style-type: none;
    margin-bottom: 40px;
    margin-top: 35px;

    li {
      padding: 7px;
      margin-right: 30px;
      display: inline;
      label {
        color:black;
        margin-left:8px;
        font-size: 16px;
      }
    }
  }
}
  .usersTable {
    label {
      font-size: 20px;
      margin: 15px 0;
      float: left;
      color: brown;
    }
  }
.actionButtons {
  margin: 10px 5px;
}

.removeUserJiraBtn {
  float: right;
  background: transparent;
  color: #17a2b8;
  border: none;
  font-size: 20px;
  display: grid;
}
.removeUserJiraBtn:focus {
  outline: none;
}
button {
  border-radius:16px;
}
img {
  max-height: 25px;
}
</style>
