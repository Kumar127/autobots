<script>
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead';

export default {
  name: 'LinkJiraProject',
  components: {
    VueBootstrapTypeahead,
  },
  props: ['projectId', 'projectName'],
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      jiraProjectName: null,
      jiraProjectKey: null,
      jiraUsers: [],
      selectedJiraUser: null,
      errorMessage: '',
      queryUser: '',
      jiraProject: {},
      jiraProjectTypes: [],
      selectedJiraProjectType: -1,
      jiraProjectTemplates: [],
      selectedJiraProjectTemplate: -1,
      jiraUser: null,
    };
  },
  watch: {
    // When the query value changes, fetch new results from API
    queryUser(newQuery) {
      if (newQuery) {
        if (newQuery.length >= 3) {
          this.selectedJiraUser = null;
          this.$http
            .get('/jira/user', {
              params: {
                username: newQuery,
              },
            })
            .then((response) => {
              this.jiraUsers = response.data;
            })
            .catch((error) => {
              this.selectedJiraUser = null;
              this.jiraUsers = [];
            });
        }
      }
    },
  },
  created() {
    this.isLoading = true;
    this.$http
      .get('/jira/projectTypes')
      .then((response) => {
        this.jiraProjectTypes = response.data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.isLoading = false;
        this.errorMessage = error.response.data.message ? error.response.data.message : 'Error Occurred in fetching project types';
      });
  },
  methods: {
    createNewJiraProject() {
      if (this.selectedJiraProjectType !== -1) {
        if (this.selectedJiraProjectTemplate !== -1) {
          this.isLoading = true;
          const body = {
            jiraProjectName: this.jiraProjectName,
            jiraProjectKey: this.jiraProjectKey,
            jiraProjectLead: this.selectedJiraUser.name,
            jiraProjectTypeName: this.selectedJiraProjectType.jiraProjectTypeName,
            jiraProjectTypeId: this.selectedJiraProjectType.jiraProjectTypeId,
            jiraProjectTemplateKey: this.selectedJiraProjectTemplate.jiraProjectTemplateKey,
            projectId: this.projectId,
          };
          this.$http
            .post('/jira/projects', body)
            .then((response) => {
              if (response) {
                this.addJiraTeamLeadToGroup(response);
              }
            })
            .catch((error) => {
              this.isLoading = false;
              console.error(error);
              this.errorMessage = error.response.data ? error.response.data : 'Error Occurred in create new jira project';
            });
        } else {
          this.errorMessage = 'Please select Jira Project Template';
        }
      } else {
        this.errorMessage = 'Please select Jira Project Type';
      }
    },
    resetModalValues() {
      this.jiraProjectName = '';
      this.jiraProjectKey = '';
      this.selectedJiraProjectType = -1;
      this.selectedJiraProjectTemplate = -1;
      this.errorMessage = '';
    },
    closeErrorMessageBox() {
      this.errorMessage = '';
    },
    selectJiraUser($event) {
      this.queryUser = '';
      this.selectedJiraUser = $event;
    },
    onProjectTypeSelection() {
      if (this.selectedJiraProjectType !== -1) {
        this.isLoading = true;
        this.$http
          .get('/jira/projectTemplates', {
            params: {
              jiraProjectTypeId: this.selectedJiraProjectType.jiraProjectTypeId,
            },
          })
          .then((response) => {
            this.jiraProjectTemplates = response.data;
            this.isLoading = false;
          })
          .catch((error) => {
            this.isLoading = false;
            console.error(error);
            this.errorMessage = error.response.data.error ? error.response.data.error :
              'Error Occurred in fetching project templates';
          });
      } else {
        this.errorMessage = 'Please select jira project Type Id';
      }
    },
    addJiraTeamLeadToGroup(addJiraResponse) {
      // Internal User
      if (this.selectedJiraUser.emailAddress.includes('basf')) {
        this.jiraUser = {
          userName: this.selectedJiraUser.userName,
          emailAddress: this.selectedJiraUser.emailAddress,
          fullName: this.selectedJiraUser.displayName,
          userType: 'I',
          mobileNumber: this.selectedJiraUser.mobileNumber,
        };
        const users = [this.jiraUser];
        const body = {
          users,
          projectId: this.projectId,
          projectName: this.projectName,
        };
        this.$http
          .post('/users', body)
          .then((response) => {
            this.jiraProject = {
              jiraProjectId: addJiraResponse.data.jiraProjectId,
              jiraProjectName: this.jiraProjectName,
              jiraProjectKey: this.jiraProjectKey,
              jiraProjectUrl: addJiraResponse.data.jiraProjectUrl,
              projectId: addJiraResponse.data.projectId,
            };
            this.jiraUser.userId = response.data[0].userId;
            const payload = {
              name: 'linkJiraProject',
              jiraProject: this.jiraProject,
              users: [this.jiraUser],
              successMessage: 'Created and Linked New Jira Project To the Team',
            };
            this.isLoading = false;
            this.$emit('linkedJiraProject', payload);
          })
          .catch((error) => {
            console.error(error);
            this.isLoading = false;
            this.errorMessage = 'Error occured in adding internal users, Please try again';
          });
      } else {
        // Add External user
        const body = {
          fName: this.selectedJiraUser.displayName.split(' ')[0],
          lName: this.selectedJiraUser.displayName.split(' ')[1],
          email: this.selectedJiraUser.emailAddress,
          mobileNumber: this.selectedJiraUser.mobileNumber,
          userType: 'E',
          projectId: this.projectId,
          projectName: this.projectName,
        };

        this.$http
          .post('/users/addExternalUser', body)
          .then((response) => {
            const userId = response.data;
            this.jiraUser = {
              userId,
              userName: this.selectedJiraUser.emailAddress,
              emailAddress: this.selectedJiraUser.emailAddress,
              fullName: this.selectedJiraUser.displayName,
              userType: 'E',
              mobileNumber: this.selectedJiraUser.mobileNumber,
            };
            this.jiraProject = {
              jiraProjectId: addJiraResponse.data.jiraProjectId,
              jiraProjectName: this.jiraProjectName,
              jiraProjectKey: this.jiraProjectKey,
              jiraProjectUrl: addJiraResponse.data.jiraProjectUrl,
              projectId: addJiraResponse.data.projectId,
            };
            const payload = {
              name: 'linkJiraProject',
              jiraProject: this.jiraProject,
              users: [this.jiraUser],
              successMessage: 'Created and Linked New Jira Project To the Team',
            };
            this.isLoading = false;
            this.$emit('linkedJiraProject', payload);
          })
          .catch((error) => {
            console.error(error);
            this.isLoading = false;
            this.errorMessage = 'Error occured in adding external user, Please try again';
          });
      }
    },
  },
};
</script>

<template>
  <div class="linkJiraProject">
    <div class="alert alert-danger" v-show="errorMessage">
      <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
      {{ errorMessage }}
    </div>
      <form method="post" @submit.prevent="createNewJiraProject">
        <div class="form-row">
        <div class="form-group col-md-6">
          <label for="jiraProjectName">Project Name</label>
          <input
            type="text"
            class="form-control"
            id="jiraProjectName"
            v-model="jiraProjectName"
            placeholder="Enter Project Name"
            required>
        </div>
        <div class="form-group col-md-6">
          <label for="jiraProjectKey">Project Key</label>
          <input
            type="text"
            class="form-control"
            id="jiraProjectKey"
            v-model="jiraProjectKey"
            placeholder="Enter Project Key"
            v-uppercase
            required>
        </div>
        <div class="form-group col-md-12">
          <label for="searchProjectLeads">Select Project Lead</label>
            <vue-bootstrap-typeahead
              id="searchProjectLeads"
              v-model="queryUser"
              class="searchBox"
              :data="jiraUsers"
              :serializer="item => item.name"
              placeholder="Search Project Leads"
              @hit="selectJiraUser($event)"/>
        </div>
        <div class="form-group col-md-12 projectType">
          <label for="projectType" class="col-md-4">Select Project Type</label>
          <select name="projectType" class="col-md-4" @change="onProjectTypeSelection" v-model="selectedJiraProjectType">
            <option value="-1" selected title="Select a Project Project Type"> Select a Jira Project Type </option>
            <option v-for="jiraProjectType in jiraProjectTypes" :key="jiraProjectType.jiraProjectTypeId"
              :value="jiraProjectType">{{jiraProjectType.jiraProjectTypeName}}</option>
          </select>
        </div>
        <div class="form-group col-md-12 projectType">
          <label for="projectTemplate" class="col-md-4">Select Project Template</label>
          <select name="projectTemplate" class="col-md-4"
            @change="onProjectTypeSelection" v-model="selectedJiraProjectTemplate">
            <option value="-1" selected title="Select a Project template"> Select a Jira Project Template </option>
            <option v-for="jiraProjectTemplate in jiraProjectTemplates" :key="jiraProjectTemplate.jiraProjectTemplateKey"
              :value="jiraProjectTemplate">{{jiraProjectTemplate.jiraProjectTemplateName}}</option>
          </select>
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
