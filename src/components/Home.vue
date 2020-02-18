<template>
  <div class="projects">
    <div class="pageContainer project-table">
      <p><h3> <label title="Groups assigned to you"> Your Groups </label></h3><p/>
      <p class="projectTitle"> <label title="Select a group"> <h4>Select a group to find more details</h4> </label>
      <button class="btn btn-info" @click="showNewProjectModal" title="Create new group"><i class="fas fa-user">&nbsp;&nbsp; Create New Group </i></button>
      </p>
      <div class="alert alert-success" v-show="successMessage">
        <a href="#" class="close" @click="closeSuccessMessageBox()">&times;</a>
        {{ successMessage }}
      </div>
      <div class="alert alert-danger" v-show="errorMessage">
        <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
        {{ errorMessage }}
      </div>
      <vue-bootstrap4-table :classes="classes" :rows="rows" :columns="columns" :config="config"
        @on-select-row="onProjectSelect">
        <template slot="empty-results">
            No groups found
        </template>
        <template slot="paginataion-previous-button">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </template>
        <template slot="paginataion-next-button">
          <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </template>
         <template slot="edit_team_name" slot-scope="props">
           <div v-if="showEditTeamName && showEditTeamNameIndex === props.row.vbt_id" class="row">
                <input type="text" placeholder="Enter Group Name" name="editTeam" v-model="teamName" required
                  @click.stop class="teamNameEditText col-md-5"/>
           </div>
            <div v-if="!showEditTeamName || showEditTeamNameIndex !== props.row.vbt_id" class="col-md-12">
              <label>
              {{props.cell_value}}
              </label>
            </div>
        </template>
        <template slot="actions" slot-scope="props">
          <button v-if="!showEditTeamName || showEditTeamNameIndex !== props.row.vbt_id" class="btn btn-info editTeamNameBtn"
            @click.stop="editTeamName(props.row)">
            <i class="fas fa-user-edit" aria-hidden="true"></i>
          </button>
          <div class="editDiv" v-if="showEditTeamName && showEditTeamNameIndex === props.row.vbt_id">
            <button type="submit" @click.stop="updateTeamName(props.row)" class="btn btn-primary"> Update </button>
            <a href="#" class="close" @click.stop="closeEditTeamName()">&times;</a>
          </div>
        </template>
      </vue-bootstrap4-table>
    </div>

    <modal
      v-show="isModalVisible"
      @close="closeModal"
      v-bind:modalName = "modalName"
      v-bind:modalTitle = "modalTitle"
    >
    </modal>

    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
  </div>
</template>

<script>
import VueBootstrap4Table from 'vue-bootstrap4-table';
import modal from './ModalComponent.vue';
import globalStore from '../config/store';

export default {
  name: 'Home',
  components: {
    VueBootstrap4Table,
    modal,
  },
  beforeMount() {
    if (!localStorage.token) {
      // This is not stopping from "mounted" getting called!
      this.$router.push('/login');
    }
  },
  mounted() {
    this.isLoading = true;
    this.$http.get('/projects', {
      params: {
        createdBy: this.createdBy,
      },
    })
      .then((response) => {
        for (let i = 0; i < response.data.length; i += 1) {
          if (response.data[i].projectName) {
            this.rows.push({
              id: response.data[i].projectId,
              name: response.data[i].projectName,
              description: response.data[i].projectDescription,
              jiraProjectId: response.data[i].jiraProjectId,
              jiraProjectName: response.data[i].jiraProjectId ? response.data[i].jiraProjectName : 'N/A',
              jiraProjectKey: response.data[i].jiraProjectKey,
              jiraProjectUrl: response.data[i].jiraProjectUrl,
              jenkinsProjectType: response.data[i].jenkinsProjectId ? response.data[i].jenkinsProjectType : 'N/A',
              jenkinsProjectId: response.data[i].jenkinsProjectId,
              jenkinsProjectRole: response.data[i].jenkinsProjectRole,
              sonarqubeProjectId: response.data[i].sonarqubeProjectId,
              sonarqubeProjectName: response.data[i].sonarqubeProjectName ? response.data[i].sonarqubeProjectName : 'N/A',
              sonarqubeProjectGroupName: response.data[i].sonarqubeProjectGroupName,
            });
          }
        }
        this.isLoading = false;
      })
      .catch((err) => {
        this.isLoading = false;
        if (err.code === 'NO_AUTH' || err.response.status === 401
          || (err.response.data.code === 500 && err.response.data.message === 'jwt malformed')) {
          localStorage.token = null;
          delete localStorage.token;
          this.$router.push('/login');
        }
        this.errorMessage = err.response.data.message ? err.response.data.message : 'Error Occurred in fetching Groups';
      });
  },
  computed: {
    createdBy() {
      if (localStorage.projectAdmin) {
        return localStorage.projectAdmin;
      }
      return null;
    },
  },
  data() {
    return {
      // TODO Make parameters global
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      rows: [],
      columns: [
        {
          label: 'Group',
          name: 'name',
          slot_name: 'edit_team_name',
          sort: true,
        },
        {
          label: 'Description',
          name: 'description',
          sort: false,
        },
        {
          label: 'Jira Project',
          name: 'jiraProjectName',
          sort: false,
        },
        {
          label: 'Jenkins Project',
          name: 'jenkinsProjectType',
          sort: false,
        },
        {
          label: 'Sonarqube Project',
          name: 'sonarqubeProjectName',
          sort: false,
        },
        {
          label: 'Edit',
          name: 'actions',
          slot_name: 'actions',
        },
      ],
      config: {
        global_search: {
          visibility: false,
        },
        show_refresh_button: false,
        show_reset_button: false,
        card_title: 'Teams',
        card_mode: false,
        checkbox_rows: false,
        rows_selectable: true,
        pagination: true, // default true
        pagination_info: true, // default true
        per_page_options: [5, 10, 20, 30],
        selected_rows_info: false,
      },
      classes: {
        tableWrapper: 'data-table-wrapper',
        table: 'table-bordered table-striped',
        row: 'table-rows',
        cell: {
          'table-columns': true,
          hyperLinkText: (row, column, cellValue) => column.name === 'name',
        },
      },
      isModalVisible: false,
      successMessage: '',
      modalName: 'createNewProject',
      modalTitle: 'Create New Group',
      errorMessage: '',
      showEditTeamName: false,
      showEditTeamNameIndex: -1,
      teamName: '',
    };
  },
  methods: {
    showNewProjectModal() {
      this.isModalVisible = true;
    },
    closeModal(payload) {
      if (payload) {
        if (payload.name === 'createdTeamAndLinkedJiraProject') {
          const project = {
            projectId: payload.project.id,
            projectDescription: payload.project.description,
            projectName: payload.project.name,
            jiraProjectId: payload.jiraProject.jiraProjectId,
            jiraProjectKey: payload.jiraProject.jiraProjectKey,
            jiraProjectName: payload.jiraProject.jiraProjectName,
            jiraProjectUrl: payload.jiraProject.jiraProjectUrl,
          };
          globalStore.setProject(project);
          this.rows.push({
            id: payload.project.id,
            name: payload.project.name,
            description: payload.project.description,
            jiraProjectName: payload.project.jira,
            jiraProjectId: payload.jiraProject.jiraProjectId,
            jiraProjectKey: payload.jiraProject.jiraProjectKey,
            jenkinsProjectType: 'N/A',
            sonarqubeProjectName: 'N/A',
          });
        } else {
          this.rows.push({
            id: payload.project.id,
            name: payload.project.name,
            description: payload.project.description,
            jiraProjectName: 'N/A',
            jenkinsProjectType: 'N/A',
            sonarqubeProjectName: 'N/A',
          });
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
    onProjectSelect(payload) {
      const project = {
        projectId: payload.selected_item.id,
        projectDescription: payload.selected_item.description,
        projectName: payload.selected_item.name,
        jiraProjectId: payload.selected_item.jiraProjectId,
        jiraProjectName: payload.selected_item.jiraProjectName,
        jiraProjectKey: payload.selected_item.jiraProjectKey,
        jiraProjectUrl: payload.selected_item.jiraProjectUrl,
        jenkinsProjectId: payload.selected_item.jenkinsProjectId,
        jenkinsProjectType: payload.selected_item.jenkinsProjectType,
        jenkinsProjectName: payload.selected_item.jenkinsProjectRole,
        jenkinsProjectRole: payload.selected_item.jenkinsProjectRole,
        sonarqubeProjectId: payload.selected_item.sonarqubeProjectId,
        sonarqubeProjectName: payload.selected_item.sonarqubeProjectName,
        sonarqubeProjectGroupName: payload.selected_item.sonarqubeProjectGroupName,

      };
      globalStore.setProject(project);
      this.$router.push(`/groups/${payload.selected_item.name}/users`);
    },
    closeSuccessMessageBox() {
      this.successMessage = '';
    },
    editTeamName(row) {
      this.teamName = row.name;
      this.showEditTeamName = true;
      this.showEditTeamNameIndex = row.vbt_id;
    },
    closeEditTeamName() {
      this.showEditTeamName = false;
      this.showEditTeamNameIndex = -1;
    },
    updateTeamName(row) {
      this.isLoading = true;
      const body = {
        projectId: row.id,
        projectName: this.teamName,
      };
      this.$http.put('/projects', { body })
        .then((response) => {
          this.rows.map((tableRow) => {
            if (tableRow.id === response.data) {
              tableRow.name = this.teamName; // eslint-disable-line no-param-reassign
            }
            return row;
          });
          this.isLoading = false;
          this.successMessage = 'Successfully Changed Group Name';
          // Close Success Message after 10 secs
          if (this.successMessage) {
            setTimeout(() => {
              this.successMessage = '';
            }, 10000);
          }
          this.closeEditTeamName();
        })
        .catch((error) => {
          this.isLoading = false;
          this.errorMessage = error.response.data.message;
        });
    },
  },
};
</script>
<style scoped lang='scss'>
@media (min-width: 1300px) {
  .container {
      max-width: 1280px;
  }
}
.projectTitle {
  padding: 5px 0;
  button {
    float: right;
  }
  i {
    font-style: normal;
  }
}
.editTeamNameBtn {
    padding: 1px 6px;
    margin: 0px 10px;
    background: transparent;
    color: #17a2b8;
    border: none;
    font-size: 20px;
    display: grid;
}
.teamNameEditText {
  margin:auto;
}
.editDiv {
  button{
    width: 100%;
    cursor: pointer;
  }
  .close {
    font-size: 1.6rem;
    font-weight: 1000;
    float: none;
    vertical-align: middle;
  }
  display: flex;
}
.actions-column {
  width: 10%;
}
</style>
