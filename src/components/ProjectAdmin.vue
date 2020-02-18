<template>
  <div class="projects">
    <div class="pageContainer project-table">

      <p><h3> <label title="Groups assigned to you"> Your Groups Admins </label></h3><p/>
      <p class="projectTitle"> <label title="Select a group"> <h4>Click on the button to add more Group admins </h4> </label>
      <button class="btn btn-info" @click="showNewProjectAdminModal" title="Create new Project admin">
      <i class="fas fa-user">&nbsp;&nbsp; Create New Group Admin </i></button>
      </p>
      <div class="alert alert-success" v-show="successMessage">
        <a href="#" class="close" @click="closeSuccessMessageBox()">&times;</a>
        {{ successMessage }}
      </div>
      <div class="alert alert-danger" v-show="errorMessage">
        <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
        {{ errorMessage }}
      </div>
      <vue-bootstrap4-table :classes="classes" :rows="rows" :columns="columns" :config="config">
        <template slot="empty-results">
            No group admins found
        </template>
        <template slot="paginataion-previous-button">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </template>
        <template slot="paginataion-next-button">
          <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </template>
      </vue-bootstrap4-table>
    </div>
    <modal
      v-show="isModalVisible"
      @close="closeModal"
      v-bind:modalName = "modalName"
      v-bind:modalTitle = "modalTitle"
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

export default {
  name: 'ProjectAdmin',
  components: {
    VueBootstrap4Table,
    modal,
  },
  beforeMount() {
    if (!localStorage.token) {
      this.$router.push('/login');
    }
  },
  mounted() {
    this.isLoading = true;
    this.$http.get('/users/projectAdmins')
      .then((response) => {
        const projectAdmins = response.data;
        for (let i = 0; i < projectAdmins.length; i += 1) {
          this.rows.push({
            adminDisplayName: projectAdmins[i].projectAdminName,
            adminUserName: projectAdmins[i].projectAdminUserName,
            project: projectAdmins[i].projects ? projectAdmins[i].projects : 'N/A',
          });
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
        this.errorMessage = err.response.data.message ? err.response.data.message : 'Error Occurred in fetching Group Admins';
      });
  },
  computed: {
    createdBy() {
      if (localStorage.projectAdmin) {
        return localStorage.projectAdmin;
      }
      return null;
    },
    usersPresent() {
      return this.rows.map(row => row.adminUserName);
    },
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
          label: 'Full Name',
          name: 'adminDisplayName',
          sort: true,
        },
        {
          label: 'User Name',
          name: 'adminUserName',
          sort: true,
        },
        {
          label: 'Group Name',
          name: 'project',
          sort: true,
        },
      ],
      config: {
        global_search: {
          visibility: false,
        },
        show_refresh_button: false,
        show_reset_button: false,
        card_mode: false,
        checkbox_rows: false,
        rows_selectable: true,
        pagination: true, // default true
        pagination_info: true, // default true
        per_page_options: [5, 10, 20, 30],
        selected_rows_info: false,
      },
      classes: {
        
        table: 'table-bordered table-striped',
        row: 'table-rowss',
      },
      isModalVisible: false,
      successMessage: '',
      modalName: '',
      modalTitle: '',
      errorMessage: '',
      confirmBoxTitle: '',
      isConfirmModalVisible: false,

    };
  },
  methods: {
    showNewProjectAdminModal() {
      this.modalName = 'createNewPadm';
      this.modalTitle = 'Add Group Admins';
      this.isModalVisible = true;
    },
    closeModal(payload) {
      if (payload) {
        if (payload.name === 'Padmusers') {
          if (payload.users.length > 0) {
            this.addUsersToDataTable(payload.users);
          }
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
    closeSuccessMessageBox() {
      this.successMessage = '';
    },
    addUsersToDataTable(users) {
      if (users) {
        for (let i = 0; i < users.length; i += 1) {
          this.rows.push({
            adminDisplayName: users[i].fullName,
            adminUserName: users[i].userName,
            project: 'N/A',
          });
        }
      }
    },
  },
};
</script>
<style scoped lang='scss'>
@media (min-width: 1300px) {
  div.pageContainer .project-table{
    margin-bottom: 2.5rem!important;
  }
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
    font-weight: normal;
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
  .close {
    font-size: 1.6rem;
    font-weight: 1000;
    float: none;
  }
  position: relative;
}
.actions-column {
  width: 10%;
}
</style>
