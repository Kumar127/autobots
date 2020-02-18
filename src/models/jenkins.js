const uuidv4 = require("uuid/v4");
const connection = require("../config/dbConnection");
const logger = require("../common/logger");

const jenkins = {
  createProject: (body) => {
    const jenkinsProjectId = uuidv4();
    logger.debug("Creating new jenkins project in local db");
    return new Promise((resolve, reject) => {
      return connection.query(
        `INSERT INTO jenkins_projects (jenkins_project_id, jenkins_project_name, description, url) VALUES(?, ?, ?, ?)`,
        [jenkinsProjectId, body.jenkinsProjectName, body.description, body.url],
        (err, results) => {
          if (err) {
            logger.error("Error: ", err);
            return reject(err);
          }
          return resolve(jenkinsProjectId);
        }
      );
    });
  },
  updateJenkinsProjectRole: (pattern, projectRole, jenkinsProjectId) => {
    logger.debug("Adding project role and pattern to a jenkins project");
    return new Promise((resolve, reject) => {
      return connection.query(
        "UPDATE jenkins_projects SET pattern = ?, project_role = ? WHERE jenkins_project_id = ? ",
        [pattern, projectRole, jenkinsProjectId],
        (err, results) => {
          if (err) {
            logger.error("Error: ", err);
            return reject(err);
          }
          return resolve(jenkinsProjectId);
        }
      );
    });
  },
  assignUserToJenkinsProject: (jenkinsProjectId, userId) => {
    logger.debug("Adding user to a jenkins project");
    const jenkinsUserId = uuidv4();
    return new Promise((resolve, reject) => {
      return connection.query(
        "INSERT INTO jenkins_users (jenkins_users_id, jenkins_project_id, user_id) VALUES (?, ?, ?) ",
        [jenkinsUserId, jenkinsProjectId, userId],
        (err, results) => {
          if (err) {
            logger.error("Error: ", err);
            return reject(err);
          }
          return resolve({ jenkinsUserId });
        }
      );
    });
  },
  bulkAddUsersToJenkinsProject: (jenkinsUsersRole) => {
    logger.debug("Adding users to a jenkins project");
    return new Promise((resolve, reject) => {
      return connection.query(
        "INSERT INTO jenkins_users (jenkins_users_id, jenkins_project_id, user_id) VALUES ? ",
        [jenkinsUsersRole],
        (err, results) => {
          if (err) {
            logger.error("Error: ", err);
            return reject(err);
          }
          return resolve({ jenkinsUsersRole });
        }
      );
    });
  },
  addJenkinsProject: (body) => {
    logger.debug("Adding jenkins project to a group");
    return new Promise((resolve, reject) => {
      return connection.query(
        "UPDATE projects SET jenkins_project_id = ?, jenkins_project_type = ? WHERE project_id = ? ",
        [body.jenkinsProjectId, body.jenkinsProjectType, body.projectId],
        (err, results) => {
          if (err) {
            logger.error("Error: ", err);
            return reject(err);
          }
          return resolve(body.jenkinsProjectId);
        }
      );
    });
  },
};

module.exports = jenkins;
