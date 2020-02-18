const Joi = require('joi');
const newProject = {
  sonarqubeProjectName: Joi.string().required('Name is required'),
  sonarqubeProjectKey: Joi.string().required('Key is required'),
  sonarqubeProjectVisibility: Joi.string().required("Visibility is required"),
  sonarqubeProjectOrganization: Joi.string(),
  sonarqubeProjectGroupName: Joi.string().required("Group name is required"),
  projectId: Joi.string().required('SSA Project Id is required'),
}
module.exports.newProject;
