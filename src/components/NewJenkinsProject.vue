<script>

export default {
  name: 'LinkJenkinsProject',
  components: {
  },
  props: ['projectId'],
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      projectName: null,
      projectDescription: null,
      errorMessage: '',
      jenkinsProjectType: 'shared',
    };
  },
  methods: {
    resetModalValues() {
      this.errorMessage = '';
      this.projectName = '';
      this.projectDescription = '';
    },
    createNewJenkinsProject() {
      this.isLoading = true;
      const body = {
        jenkinsProjectName: this.projectName,
        jenkinsProjectDescription: this.projectDescription,
        jenkinsProjectType: this.jenkinsProjectType,
        projectId: this.projectId,
      };
      this.$http
        .post('/jenkins/createFolder', body)
        .then((response) => {
          if (response) {
            this.jenkinsProject = {
              jenkinsProjectId: response.data.jenkinsProjectId,
              jenkinsProjectName: this.projectName,
              jenkinsProjectDescription: this.projectDescription,
              jenkinsProjectType: this.jenkinsProjectType,
              jenkinsProjectRole: response.data.projectRole,
              projectId: this.projectId,
            };
            const payload = {
              name: 'linkJenkinsProject',
              jenkinsProject: this.jenkinsProject,
              successMessage: 'Created and Linked New Jenkins Project To the Group',
            };
            this.isLoading = false;
            this.$emit('linkedJenkinsProject', payload);
          }
        })
        .catch((error) => {
          this.isLoading = false;
          this.errorMessage = error.response.data.message ? error.response.data.message : 'Error Occurred in create new jenkins project';
        });
    },
  },
};
</script>

<template>
  <div class="linkJenkinsProject">
    <div class="panel row userTypeSelection">
      <div class="mr-4">
        <label>
          <input type="radio" v-model="jenkinsProjectType" value="instance" v-on:click="resetModalValues"> New Instance
        </label>
      </div>
      <div class="mr-4">
        <label>
          <input type="radio" v-model="jenkinsProjectType" value="shared" v-on:click="resetModalValues"> Shared Instance
        </label>
      </div>
    </div>
    <div class="alert alert-danger" v-show="errorMessage">
      <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
      {{ errorMessage }}
    </div>
    <div v-if="jenkinsProjectType === 'instance'">
      <h3> To be implemented </h3>
    </div>
    <div v-if="jenkinsProjectType === 'shared'">
     <form method="post" @submit.prevent="createNewJenkinsProject">
      <div class="form-row">
        <div class="form-group col-md-12">
          <label for="projectName">Project Name</label>
          <input
            type="text"
            class="form-control"
            id="projectName"
            v-model="projectName"
            placeholder="Enter Jenkins Project Name"
            required
            />
        </div>
        <div class="form-group col-md-12">
          <label for="projectDescription">Project Description</label>
          <textarea
            class="form-control"
            id="projectDescription"
            v-model="projectDescription"
            placeholder="Enter Jenkins Project Description"
            required>
          </textarea>
        </div>
        <div class="form-group">
          <button
            type="submit"
            class="btn btn-info"> Create </button>
        </div>
    </div>
  </form>
    </div>
    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
  </div>
</template>

<style>
</style>
