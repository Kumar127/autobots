const Joi = require('joi');

module.exports = {
  // POST /v1/projects
  newProject: {
    body: {
      name: Joi.string().required(),
    },
  },
  addJiraProject: {
    body: {
      jiraProjectId: Joi.string().required(),
    },
  },
};
