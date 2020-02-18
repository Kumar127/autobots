<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div class="modal-dialog modal-lg modal-dialog-centered"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription">
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title pull-left">{{ modalTitle }}</h4>
                <button type="button" class="close" @click="close" aria-label="Close modal">&times;</button>
              </div>
              <div class="modal-body">
                <p class="linkJiraCheckbox" v-if='modalName==="createNewProject" || modalName==="createTeamAndJiraProject"'>
                  <input type="checkbox" id="createNLinkJiraProject" name="createNLinkJiraProject" v-model="createNLinkJiraProject"/>
                  <label for="createNLinkJiraProject">Create New Jira Project </label>
                </p>
                <createTeamAndJiraProject @createTeamAndJiraProject="successCloseModal" v-if='modalName==="createTeamAndJiraProject"'
                ref="createTeamAndJira" v-bind:projectId="projectId">
                </createTeamAndJiraProject>
                <createNewProject @createdNewProject="successCloseModal" v-if='modalName==="createNewProject"' ref="createTeam"
                v-bind:projectId="projectId">
                </createNewProject>
                 <createNewPadm @usersAddedAsProjectAdmin="successCloseModal" v-if='modalName==="createNewPadm"' 
                  v-bind:projectName="projectName" v-bind:usersPresent="usersPresent" ref="createpadm">
                </createNewPadm>
                <addUsersToProject @usersAdded="successCloseModal" v-if='modalName==="addUsersToProject"' v-bind:projectId="projectId"
                  v-bind:projectName="projectName" v-bind:usersPresent="usersPresent" ref="addUserToTeam">
                </addUsersToProject>
                <newJiraProject @linkedJiraProject="successCloseModal" v-if='modalName==="linkJiraProject"'
                  v-bind:projectName="projectName" v-bind:projectId="projectId" ref="createJiraProject">
                </newJiraProject>
                <addUsersToJira @addedUsersToJiraRole="successCloseModal" v-if='modalName==="addUsersToJiraRole"'
                  v-bind:addUsersToJira="addUsersToJira" ref="addUserToJiraRole">
                </addUsersToJira>
                <newJenkinsProject @linkedJenkinsProject="successCloseModal"
                  v-if='modalName==="linkJenkinsProject"' v-bind:projectId="projectId" ref="createJenkinsProject">
                </newJenkinsProject>
                <newSonarqubeProject @linkedsonarqubeProject="successCloseModal"
                  v-if='modalName==="linkSonarqubeProject"' v-bind:projectId="projectId" v-bind:projectName="projectName" ref ='linksonar'>
                </newSonarqubeProject>
              </div>
            </div>
        </div>
    </div>
  </transition>
</template>
<script>
import addUsersToJira from './AddUsersToJira.vue';
import createNewProject from './CreateNewProject.vue';
import addUsersToProject from './AddUsers.vue';
import newJiraProject from './NewJiraProject.vue';
import createTeamAndJiraProject from './CreateTeamAndJiraProject.vue';
import newJenkinsProject from './NewJenkinsProject.vue';
import createNewPadm from './CreateNewPadm.vue';
import newSonarqubeProject from './NewSonarqubeProject.vue';


export default {
  name: 'modal',
  components: {
    createNewProject,
    addUsersToProject,
    newJiraProject,
    addUsersToJira,
    createTeamAndJiraProject,
    newJenkinsProject,
    createNewPadm,
    newSonarqubeProject,
  },
  props: {
    modalTitle: {
      type: String,
      required: true,
    },
    modalName: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
    },
    projectName: {
      type: String,
    },
    addUsersToJira: {
      type: Object,
    },
    usersPresent: {
      type: Array,
    },
  },
  data() {
    return {
      createNLinkJiraProject: '',
      createProjectAndLinkJiraPayload: [],
    };
  },
  watch: {
    createNLinkJiraProject(newValue) {
      if (newValue) {
        this.modalTitle = 'Create New Group and Link Jira Project';
        this.modalName = 'createTeamAndJiraProject';
      } else {
        this.modalTitle = 'Create New Group';
        this.modalName = 'createNewProject';
      }
    },
  },
  methods: {
    close() {
      this.createNLinkJiraProject = false;
      if (this.modalName === 'createNewProject') {
        this.$refs.createTeam.resetModalValues();
      } else if (this.modalName === 'createTeamAndJiraProject') {
        this.$refs.createTeamAndJira.resetModalValues();
      } else if (this.modalName === 'addUsersToProject') {
        this.$refs.addUserToTeam.resetModalValues();
      } else if (this.modalName === 'linkJiraProject') {
        this.$refs.createJiraProject.resetModalValues();
      } else if (this.modalName === 'addUsersToJiraRole') {
        this.$refs.addUserToJiraRole.resetModalValues();
      } else if (this.modalName === 'linkJenkinsProject') {
        this.$refs.createJenkinsProject.resetModalValues();
      } else if (this.modalName === 'createNewPadm') {
        this.$refs.createpadm.resetModalValues();
      } else if (this.modalName === 'linkSonarqubeProject') {
        this.$refs.linksonar.resetModalValues();
      }
      this.$emit('close', null);
    },
    successCloseModal(payload) {
      this.$emit('close', payload);
    },
  },
};
</script>
<style scoped lang='scss'>
/* TODO Move into style.css */
.linkJiraCheckbox {
  padding: 0px;
  label {
    margin-left: 10px;
  }

}
</style>
