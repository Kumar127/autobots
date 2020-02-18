<script>
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead';
import globalStore from '../config/store';

export default {
  name: 'CreateTeamAndJiraProject',
  components: {
    VueBootstrapTypeahead,
  },
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      projectName: null,
      projectDescription: null,
      errorMessage: '',
      project: {},
      jiraProjectName: '',
      jiraProjectKey: null,
      jiraUsers: [],
      selectedJiraUser: null,
      queryUser: '',
      jiraProject: {},
      jiraProjectTypes: [],
      selectedJiraProjectType: -1,
      jiraProjectTemplates: [],
      selectedJiraProjectTemplate: -1,
    };
  },
  created() {
    this.$http
      .get('/jira/projectTypes')
      .then((response) => {
        this.jiraProjectTypes = response.data;
      })
      .catch((error) => {
        this.errorMessage = error.response.data.message ? error.response.data.message : 'Error Occurred in fetching project types';
      });
  },
  methods: {
    createNewTeamAndJiraProject() {
      if (this.selectedJiraProjectType !== -1) {
        if (this.selectedJiraProjectTemplate !== -1) {
          this.isLoading = true;
          this.$http
            .post('/projects', {
              name: this.projectName,
              description: this.projectDescription,
            })
            .then((response) => {
              this.createNewJiraProject(response.data);
            })
            .catch((error) => {
              this.isLoading = false;
              this.errorMessage = error.response.data.message ? error.response.data.message : 'Error occured in creating group';
            });
        } else {
          this.errorMessage = 'Please select Jira Project Template';
        }
      } else {
        this.errorMessage = 'Please select Jira Project Type';
      }
    },
    createNewJiraProject(projectId) {
      const body = {
        jiraProjectName: this.jiraProjectName,
        jiraProjectKey: this.jiraProjectKey,
        jiraProjectLead: this.selectedJiraUser.name,
        jiraProjectTypeName: this.selectedJiraProjectType.jiraProjectTypeName,
        jiraProjectTypeId: this.selectedJiraProjectType.jiraProjectTypeId,
        jiraProjectTemplateKey: this.selectedJiraProjectTemplate.jiraProjectTemplateKey,
        projectId,
      };
      this.$http
        .post('/jira/projects', body)
        .then((response) => {
          if (response) {
            this.addCreatorToGroup();
            this.jiraProject = {
              jiraProjectId: response.data.jiraProjectId,
              jiraProjectName: this.jiraProjectName,
              jiraProjectKey: this.jiraProjectKey,
              jiraProjectUrl: response.data.jiraProjectUrl,
              projectId,
            };
            this.project = {
              id: projectId,
              name: this.projectName,
              description: this.projectDescription,
              jira: this.jiraProjectName,
            };
            const payload = {
              name: 'createdTeamAndLinkedJiraProject',
              jiraProject: this.jiraProject,
              project: this.project,
              successMessage: 'Created Group and Linked New Jira Project To the Group',
            };
            this.isLoading = false;
            this.$emit('createTeamAndJiraProject', payload);
          }
        })
        .catch((error) => {
          this.errorMessage = error.response.data.message ? error.response.data.message : 'Error Occurred in create new jira project';
        });
    },
    resetModalValues() {
      this.projectName = '';
      this.projectDescription = '';
      this.errorMessage = '';
      this.projectName = '';
      this.projectKey = '';
      this.selectedJiraProjectType = -1;
      this.selectedJiraProjectTemplate = -1;
      this.errorMessage = '';
    },
    closeErrorMessageBox() {
      this.errorMessage = '';
    },
    onProjectTypeSelection() {
      if (this.selectedJiraProjectType !== -1 && this.selectedJiraProjectTemplate === -1) {
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
            this.errorMessage = error.response.data.message ? error.response.data.message
              : 'Error Occurred in fetching project templates';
          });
      } else {
        this.errorMessage = 'Please select jira project Type Id';
      }
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
};
</script>

<template>
<div class="createTeam">
  <div class="alert alert-danger" v-show="errorMessage">
    <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
    {{ errorMessage }}
  </div>
  <form method="post" @submit.prevent="createNewTeamAndJiraProject">
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
      <p class="col-md-12"> <strong> New Jira Project Details </strong> </p>
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
              @hit="selectedJiraUser = $event"/>
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
          <label for="projectTemplate" class="col-md-4">Select Project Type</label>
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
