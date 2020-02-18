<script>
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead';
import globalStore from '../config/store';

export default {
  name: 'AddProjectAdmin',
  components: {
    VueBootstrapTypeahead,
  },
  props: ['projectName', 'usersPresent'],
  computed: {
    showAddInternalUsers() {
      return this.selectedUsers.length > 0;
    },
  },
  created() {
    this.users = [];
  },
  data() {
    return {
      isLoading: false,
      fullPage: true,
      spinnerColor: '#5dc596',
      errorMessage: '',
      queryUser: '',
      users: [],
      selectedUser: null,
      user: {},
      selectedUsers: [],
      showInfoMessage: '',
    };
  },
  watch: {
    // When the query value changes, fetch new results from API
    queryUser(newQuery) {
      if (newQuery && !this.selectedUser) {
        if (newQuery.length >= 3) {
          this.$http
            .get('/users/fetchFromLdap', {
              params: {
                searchParam: newQuery,
              },
            })
            .then((response) => {
              this.showInfoMessage = '';
              this.users = response.data;
              this.errorMessage = '';
            })
            .catch((error) => {
              console.error(error);
              this.selectedUser = null;
              this.showInfoMessage = 'No User Found, Please try again';
            });
        }
      }
    },
  },
  methods: {
    addProjectAdmins() {
      this.errorMessage = '';
      const users = [];
      for (let i = 0; i < this.selectedUsers.length; i += 1) {
        users.push({
          userName: this.selectedUsers[i].cn,
          emailAddress: this.selectedUsers[i].mail,
          fullName: `${this.selectedUsers[i].givenname} ${this.selectedUsers[i].sn}`,
          userType: 'I',
          mobileNumber: null,
          role_id: 'PADM',
        });
      }
      const body = {
        users,
      };
      this.isLoading = true;
      this.$http
        .post('/users/projectAdmins', body)
        .then((response) => {
          const successMessage = `${users.length} users added as group admin `;
          this.selectedUser = null;
          this.selectedUsers = [];
          const payload = {
            name: 'Padmusers',
            users: body.users,
            successMessage,
          };
          this.isLoading = false;
          this.resetModalValues();
          this.$emit('usersAddedAsProjectAdmin', payload);
        })
        .catch((error) => {
          this.isLoading = false;
          console.error(error);
          this.errorMessage = error.response.data.message ? error.response.data.message : 'Error occured in adding group admins, Please try again';
        });
    },
    resetModalValues() {
      this.errorMessage = '';
      this.showInfoMessage = '';
    },
    closeErrorMessageBox() {
      this.showInfoMessage = '';
      this.errorMessage = '';
    },
    addUsersToList() {
      if (this.selectedUser) {
        if (this.selectedUser.mail) {
          if (!this.selectedUsers.some(user => user.cn === this.selectedUser.cn)
            && !this.usersPresent.some(user => user === this.selectedUser.cn)) {
            this.errorMessage = '';
            this.showInfoMessage = '';
            this.selectedUsers.push(this.selectedUser);
            this.selectedUser = null;
            this.$refs.clearTypeahead.inputValue = '';
          } else {
            this.errorMessage = 'User Already Present ';
            this.showInfoMessage = '';
            this.selectedUser = null;
            this.$refs.clearTypeahead.inputValue = '';
          }
        } else {
          this.errorMessage = 'User has no email id, Please add another user';
          this.showInfoMessage = '';
          this.selectedUser = null;
          this.$refs.clearTypeahead.inputValue = '';
        }
      } else {
        this.errorMessage = 'Please select a User';
        this.showInfoMessage = '';
        this.selectedUser = null;
      }
    },
    removeUserFromList(userCN) {
      for (let i = 0; i < this.selectedUsers.length; i += 1) {
        if (this.selectedUsers[i].cn === userCN) {
          this.selectedUsers.splice(i, 1);
        }
      }
    },
  },
};
</script>

<template>
  <div class="addUsers">
    <div class="alert alert-info" v-show="showInfoMessage">
      {{ showInfoMessage }}
    </div>
    <div class="alert alert-danger" v-show="errorMessage">
      <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
      {{ errorMessage }}
    </div>
      <div>
        <ul class="selectedUsersTag">
        <li v-for="user in selectedUsers" :key="user.cn"> <span><a href="#" class="close"
            @click="removeUserFromList(user.cn)">&times;</a> </span> {{ user.fullName }} </li>
        </ul>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="searchInternalUser" class="col-md-12">Search BASF Users</label>
          <vue-bootstrap-typeahead
            id="searchInternalUser"
            class="searchBox col-md-8"
            v-model="queryUser"
            :data="users"
            ref="clearTypeahead"
            :serializer="item => item.givenname +' ' + item.sn + ' (' + item.cn + ')'"
            @hit="selectedUser = $event"
            placeholder="Search BASF Users"
          />
          <button
            @click="addUsersToList"
            class="btn btn-info  col-md-3"
            :disabled="!selectedUser"> Add User </button>
        </div>
        <div class="form-group col-md-12">
          <button
            v-show="showAddInternalUsers"
            @click="addProjectAdmins"
            class="btn btn-info"> Add Selected BASF Users</button>
        </div>
    </div>
    <loading-spinner :active.sync="isLoading"
        :is-full-page="fullPage" :color="spinnerColor"></loading-spinner>
  </div>
</template>
<style scoped lang='scss'>
.addUsers {
  height: 250px;
}
.selectedUsersTag {
  list-style: none;
  margin: 0;
  padding: 0;
}

.selectedUsersTag li {
  display: inline;
  padding: 5px 30px 5px 10px;
  background-color: #ccc;
  margin-right: 9px;
  position: relative;
  float: left;
  margin: 5px;
  border-radius: 25px;
}

.selectedUsersTag li span {
  position: absolute;
  right: -2px;
  top: 4px;
}

.form-row {
  float: left;
  width: 100%;
}

.searchBox {
  width: 75%!important;
  float: left!important;
}

.checkDuplicateEmail {
    width: 50%;
    float: left;
}

.checkDuplicateUserForm {
  margin: 30px 0px;
  label {
    padding: 0px;
  }
}
</style>
