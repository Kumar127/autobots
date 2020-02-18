const axios = require('axios');
const https = require('https');
const CONSTS = require('../config/constants');
const logger = require("../common/logger");
// Create Base Axios instance level which can connect to Git
const instance = axios.create({
  httpsAgent: new https.Agent({
  }),
  auth: {
    username: process.env.JIRA_TEST_USERNAME,
    password: process.env.JIRA_TEST_PASSWORD,
  },
});
const BASE_URL = process.env.JIRA_TEST_BASE_URL;

const api = {};

/* api.getIssueTest = () => {
  return instance.get(`${BASE_URL}/issue/AUT-93`)
    .then( response => response.data )
}; */

// Create User
api.newUser = (user) => {
  logger.debug("Creating new user through JIRA API");
  return instance
    .post(`${BASE_URL}/user`, user)
    .then(response => response.data)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

// Fetch User Details
api.getUserDetails = (username) => {
  logger.debug("Fetching user details through JIRA API");
  return instance
    .get(`${BASE_URL}/user/search`, {
      params: {
        username,
      },
    })
    .then(response => response.data)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

// Find user details by userName
api.findUserByUserName = (username) => {
  logger.debug("Fetching user details by username through JIRA API");
  return instance
    .get(`${BASE_URL}/user`, {
      params: {
        username,
      },
    })
    .then(response => {
      console.log(response);
      return response.data;
    })
    .catch((error) => {
      logger.error("Error: ", error);
      console.log(error);
      throw error;
    });
};

// Fetch all projects
api.getAllProjects = () => {
  logger.debug("Fetching all jira projects through JIRA API");
  return instance
    .get(`${BASE_URL}/project`)
    .then(response => response.data)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

// Fetch project details
api.getProjectDetails = (projectName) => {
  logger.debug("Fetching jira project details through JIRA API");
  return instance
    .get(`${BASE_URL}/project/${projectName}`)
    .then(response => response.data)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

// Fetch all project roles
api.getAllProjectRoles = () => {
  logger.debug("Fetching all jira project roles through JIRA API");
  return instance
    .get(`${BASE_URL}/role`)
    .then(response => {
      console.log(response);
      return response.data;
    })
    .catch((error) => {
      logger.error("Error: ", error);
      console.log(error);
      throw error;
    });
};

// Fetch all project roles
api.addUserToProject = (projectKey, role, user) => {
  logger.debug("Adding a user to jira project through JIRA API");
  return instance
    .post(`${BASE_URL}/project/${projectKey}/role/${role}`, {
      user,
    })
    .then(response => response.data)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

api.createProject = (project) => {
  logger.debug("Creating new jira project through JIRA API");
  return instance
    .post(`${BASE_URL}/project`, project)
    .then(response => response.data)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

api.deleteUserFromProjectRole = (projectKey, userName, role) => {
  logger.debug("Removing user from jira project role through JIRA API");
  return instance
    .delete(`${BASE_URL}/project/${projectKey}/role/${role}`, {
      params: {
        user: userName.toLowerCase()
      }
    })
    .then(response => userName)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
}

// Fetch all permission Schemes
api.getAllPermissionSchemes = () => {
  logger.debug("Fetching all jira project's permission schemes");
  return instance
    .get(`${BASE_URL}/permissionscheme`)
    .then(response => response.data.permissionSchemes)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

module.exports = api;
