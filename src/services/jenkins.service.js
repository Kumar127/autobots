const axios = require('axios');
const https = require('https');
const CONSTS = require('../config/constants');
const logger = require("../common/logger");

const instance = axios.create({
  httpsAgent: new https.Agent({
  }),
  auth: {
    username: process.env.JENKINS_TEST_USERNAME,
    password: process.env.JENKINS_TEST_AUTH_TOKEN,
  },
});
const BASE_URL = process.env.JENKINS_TEST_BASE_URL;


const api = {};

// Fetch all user roles
api.getAllRoles = () => {
  logger.debug("Fetching all user roles through JENKINS API");
  return instance
    .get(`${BASE_URL}/role-strategy/strategy/getAllRoles`)
    .then(response => response.data)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

// Fetch specific role details
api.getRole = (roleName) => {
  logger.debug("Fetching specific role details through JENKINS API");
  return instance
    .get(`${BASE_URL}/role-strategy/strategy/getRole`, {
      params: {
        type: 'globalRoles',
        roleName,
      }
    })
    .then(response => response.data)
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
};

// Get Jenkins CSRF Token
api.getJenkinsCrumb = () => {
  logger.debug("Fetching CSRF Token for Jenkins API Requests");
  return instance
    .get(`${BASE_URL}/crumbIssuer/api/json`)
    .then(response =>  response.data)
    .catch((crumbError) => {
      logger.error("Error: ", crumbError);
      throw crumbError;
    });
};

// Create global role in jenkins
api.createGlobalRole = (roleName, roleType) => {
  logger.debug("Creating a global role for admin");
  const CSRFToken = api.getJenkinsCrumb();
  return CSRFToken.then((tokenValue) => {
    const params = {
      type: 'globalRoles',
      roleName,
      permissionIds: CONSTS.JENKINS.ROLES.GLOBAL_ROLE[roleType],
      overwrite: 'true',
    }
    params[tokenValue.crumbRequestField] = tokenValue.crumb;
    return instance
      .post(`${BASE_URL}/role-strategy/strategy/addRole`, null, {
        params
      })
      .then(response => response.data)
      .catch((error) => {
        logger.error("Error: ", error);
        throw error;
      });
  })
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
}

// Create project role in jenkins
api.createProjectRole = (roleName, pattern) => {
  logger.debug("Creating a project role for project");
  const CSRFToken = api.getJenkinsCrumb();
  return CSRFToken.then((tokenValue) => {
    const params = {
      type: 'projectRoles',
      roleName,
      permissionIds: CONSTS.JENKINS.ROLES.PROJECT_ROLE,
      overwrite: 'true',
      pattern,
    }
    const headers = [];
    headers[tokenValue.crumbRequestField] = tokenValue.crumb;

    const config = {
      headers,
      params,
    };
    return instance
      .post(`${BASE_URL}/role-strategy/strategy/addRole`, null, config)
      .then(response => roleName)
      .catch((error) => {
        logger.error("Error: ", error);
        throw error;
      });
  })
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
}

// Create project folder in shared jenkins
api.createProjectFolder = (folderName) => {
  logger.debug("Creating a project folder in current instance");
  const CSRFToken = api.getJenkinsCrumb();
  return CSRFToken.then((tokenValue) => {
    const params = {
      name: folderName,
      mode: CONSTS.JENKINS.FOLDER_MODE,
      Submit: 'OK',
    }
    const headers = [];
    headers[tokenValue.crumbRequestField] = tokenValue.crumb;

    const config = {
      headers,
      params,
    };
    return instance
      .post(`${BASE_URL}/createItem`, null, config)
      .then(response => response.data)
      .catch((error) => {
        throw error;
      });
  })
    .catch((error) => {
      throw error;
    });
}

// Add user to jenkins project role
api.assignRoleToUser = (roleType, roleName, sid) => {
  logger.debug("Assign a role to user");
  const CSRFToken = api.getJenkinsCrumb();
  return CSRFToken.then((tokenValue) => {
    const params = {
      type: roleType,
      roleName,
      sid,
    }
    params[tokenValue.crumbRequestField] = tokenValue.crumb;
    return instance
      .post(`${BASE_URL}/role-strategy/strategy/assignRole`, null, {
        params
      })
      .then((response) =>  {
        if (response.data === '') {
          return sid;
        }
        return response.data;
      })
      .catch((error) => {
        logger.error("Error: ", error);
        throw error;
      });
  })
    .catch((error) => {
      logger.error("Error: ", error);
      throw error;
    });
}


module.exports = api;
