const Joi = require('joi');

const newUser = {
  name: Joi.string().required('Name is required'),
  emailAddress: Joi.string().email().required('Email Address is required'),
  displayName: Joi.string().required('DisplayName is required'),
  userId: Joi.string(),
  userType: Joi.string(),
  userJiraRoleId: Joi.string(),
};

const addUserToProject = {
  jiraProjectKey: Joi.string().required('Project Key is required'),
  role: Joi.number().required('Role is required'),
  roleName: Joi.string().required('Role name is required'),
  jiraProjectId: Joi.string().required('Jira Project Id is required'),
  users: Joi.array().items(newUser),
};

const newProject = {
  jiraProjectName: Joi.string().required('Name is required'),
  jiraProjectKey: Joi.string().required('Key is required'),
  jiraProjectLead: Joi.string().required('Project Lead name is required'),
  jiraProjectTypeKey: Joi.string().required('Project Type Key is required'),
  projectId: Joi.string().required('SSA Project Id is required'),
}
module.exports = {
  newUser,
  addUserToProject,
  newProject,
};
