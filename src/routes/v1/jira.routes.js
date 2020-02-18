const express = require('express');
const validate = require('express-validation');
const jiraController = require("../../controllers/jira.controller");
const validations = require('../../validations/jira.validations');

const router = express.Router();

// New user Creation
router.post('/user', validate(validations.newUser), jiraController.createUser);

// Fetching user details or all users
router.get('/user?:username', jiraController.searchUser);

// Creating new project
router.post('/projects', validate(validations.newProject), jiraController.createJiraProject);

// Fetching all roles
router.get('/roles', jiraController.getAllJiraProjectRoles);

// Adding a user to project role
router.route('/projects/users')
      .post(validate(validations.addUserToProject), jiraController.addUsersToJiraProjectRole)
      .delete(jiraController.deleteUserFromJiraProjectRole);

// Fetching all jira project Types
router.get('/projectTypes', jiraController.getProjectTypes);

// Fetching all jira project Types
router.get('/projectTemplates?:jiraProjectTypeId', jiraController.getProjectTemplates);

module.exports = router;
