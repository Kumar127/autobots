<script>
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead';

export default {
  name: 'Add Users to Group',
  components: {
    VueBootstrapTypeahead,
  },
  props: ['projectId', 'projectName', 'usersPresent'],
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
      userChoice: 'internal',
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      queryUser: '',
      users: [],
      selectedUser: null,
      user: {},
      selectedUsers: [],
      emailAddressToCheck: '',
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
    addInternalUser() {
      this.errorMessage = '';
      const users = [];
      for (let i = 0; i < this.selectedUsers.length; i += 1) {
        users.push({
          userName: this.selectedUsers[i].cn,
          emailAddress: this.selectedUsers[i].mail,
          fullName: `${this.selectedUsers[i].givenname} ${this.selectedUsers[i].sn}`,
          userType: 'I',
          mobileNumber: null,
        });
      }
      const body = {
        users,
        projectId: this.projectId,
        projectName: this.projectName,
      };
      this.isLoading = true;
      this.$http
        .post('/users', body)
        .then((response) => {
          const userDetails = [];
          let successMessage = '';
          if (response.status === 201) {
            successMessage = response.data;
          } else {
            for (let i = 0; i < users.length; i += 1) {
              userDetails.push({
                userId: response.data[i].userId,
                ...users[i],
              });
            }
            successMessage = 'Internal Users added in Group';
            this.selectedUser = null;
            this.selectedUsers = [];
          }
          const payload = {
            name: 'addUsers',
            users: userDetails,
            successMessage,
          };
          this.isLoading = false;
          this.resetModalValues();
          this.$emit('usersAdded', payload);
        })
        .catch((error) => {
          this.isLoading = false;
          console.error(error);
          this.errorMessage = 'Error occured in adding internal users, Please try again';
        });
    },
    addExternalUser() {
      if (!this.usersPresent.some(email => email === this.email)) {
        this.isLoading = true;
        const body = {
          fName: this.firstName,
          lName: this.lastName,
          email: this.email,
          mobileNumber: this.mobileNumber,
          userType: 'E',
          projectId: this.projectId,
          projectName: this.projectName,
        };

        this.$http
          .post('/users/addExternalUser', body)
          .then((response) => {
            if (response.status === 201) {
              this.user = {
                successMessage: 'User already present in project',
              };
            } else {
              const userId = response.data;
              this.user = {
                userId,
                userName: this.email,
                emailAddress: this.email,
                fullName: `${this.firstName} ${this.lastName}`,
                userType: 'external',
                mobileNumber: this.mobileNumber,
              };
              const payload = {
                name: 'addUsers',
                users: [this.user],
                successMessage: 'External User added in Group',
              };
              this.isLoading = false;
              this.resetModalValues();
              this.$emit('usersAdded', payload);
            }
          })
          .catch((error) => {
            this.isLoading = false;
            console.error(error);
            this.errorMessage = 'Error occured in adding external user, Please try again';
          });
      } else {
        this.errorMessage = 'User Already Present in Group, Please add another user';
      }
    },
    resetModalValues() {
      this.errorMessage = '';
      this.showInfoMessage = '';
      this.resetInternalUsers();
      this.resetExternalUserFormValues();
    },
    resetInternalUsers() {
      this.selectedUser = null;
      this.selectedUsers = [];
    },
    resetExternalUserFormValues() {
      this.emailAddressToCheck = '';
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      this.mobileNumber = '';
    },
    closeErrorMessageBox() {
      this.showInfoMessage = '';
      this.errorMessage = '';
    },
    addUsersToList() {
      if (this.selectedUser) {
        if (this.selectedUser.mail) {
          if (!this.selectedUsers.some(user => user.cn === this.selectedUser.cn)
              && !this.usersPresent.some(email => email === this.selectedUser.mail)) {
            this.errorMessage = '';
            this.showInfoMessage = '';
            this.selectedUsers.push(this.selectedUser);
            this.selectedUser = null;
            this.$refs.clearTypeahead.inputValue = '';
          } else {
            this.errorMessage = 'User Already Present in Group';
            this.selectedUser = null;
            this.$refs.clearTypeahead.inputValue = '';
          }
        } else {
          this.errorMessage = 'User has no email id, Please add another user';
          this.selectedUser = null;
          this.$refs.clearTypeahead.inputValue = '';
        }
      } else {
        this.errorMessage = 'Please select a User';
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
    checkDuplicateUser() {
      this.isLoading = true;
      this.$http
        .get('/users/externalUser', {
          params: {
            emailAddress: this.emailAddressToCheck,
          },
        })
        .then((response) => {
          this.firstName = response.data.firstName;
          this.lastName = response.data.lastName;
          this.email = response.data.emailAddress;
          this.mobileNumber = '';
          this.errorMessage = '';
          this.emailAddressToCheck = '';
          this.showInfoMessage = 'User found in external server';
          this.isLoading = false;
        })
        .catch((error) => {
          this.isLoading = false;
          console.log(error);
          this.showInfoMessage = 'User not found, Please create a new user';
        });
      // Close Success Message after 10 secs
      if (this.showInfoMessage) {
        setTimeout(() => {
          this.showInfoMessage = '';
          this.emailAddressToCheck = '';
        }, 10000);
      }
    },
  },
};
</script>

<template>
  <div class="addUsers">
    <div class="panel row userTypeSelection">
      <div class="mr-4">
        <label>
          <input type="radio" v-model="userChoice" value="internal" v-on:click="resetModalValues"> BASF User
        </label>
      </div>
      <div class="mr-4">
        <label>
          <input type="radio" v-model="userChoice" value="external" v-on:click="resetModalValues"> External User
        </label>
      </div>
    </div>
    <div class="alert alert-info" v-show="showInfoMessage">
      {{ showInfoMessage }}
    </div>
    <div class="alert alert-danger" v-show="errorMessage">
      <a href="#" class="close" @click="closeErrorMessageBox()">&times;</a>
      {{ errorMessage }}
    </div>
    <div v-if="userChoice === 'internal'">
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
            @click="addInternalUser"
            class="btn btn-info"> Add Selected BASF Users</button>
        </div>
      </div>
    </div>
    <div v-if="userChoice === 'external'">
      <form method="post" @submit.prevent="checkDuplicateUser" class="checkDuplicateUserForm">
        <div class="form-group">
          <label for="userEmailToCheck" class="col-md-12">Search External User By Email Address</label>
          <input
            type="email"
            class="form-control col-md-8 checkDuplicateEmail"
            id="userEmailToCheck"
            v-model="emailAddressToCheck"
            placeholder="Enter Email Address"
            required>
          <button
            class="btn btn-info col-md-3"> Check </button>
        </div>
      </form>
      <form method="post" @submit.prevent="addExternalUser">
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="userFirstName">FirstName</label>
            <input
              type="text"
              class="form-control"
              id="userFirstName"
              v-model="firstName"
              placeholder="Enter First Name"
              required>
          </div>
          <div class="form-group col-md-6">
            <label for="userLastName">Last Name</label>
            <input
              type="text"
              class="form-control"
              id="userLastName"
              v-model="lastName"
              placeholder="Enter Last Name"
              required>
          </div>
          <div class="form-group col-md-12">
            <label for="userContact">Mobile Number</label>
            <input
              type="text"
              class="form-control"
              id="userContact"
              v-model="mobileNumber"
              placeholder="Enter mobile number"
              required>
          </div>
          <div class="form-group col-md-12">
            <label for="userEmail">Email address</label>
            <input
              type="email"
              class="form-control"
              id="userEmail"
              v-model="email"
              placeholder="Enter email address"
              required>
          </div>
          <div class="form-group">
            <button
              type="submit"
              class="btn btn-info"> Add External User </button>
          </div>
        </div>
      </form>
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
