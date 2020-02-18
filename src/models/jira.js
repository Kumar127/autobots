const uuidv4 = require("uuid/v4");
const connection = require("../config/dbConnection");
const logger = require("../common/logger");

const jira = {
  createProject: (body) => {
    logger.debug("Creating new jira project in local db");
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO jira_projects (jira_project_id, jira_project_name, jira_project_key, jira_project_type,
        jira_project_template_key, jira_project_lead, jira_project_url) VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [body.jiraProjectId, body.jiraProjectName, body.jiraProjectKey, body.jiraProjectType, body.jiraProjectTemplate,
        body.jiraProjectLead, body.jiraProjectUrl],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(body.jiraProjectId);
        });
    });
  },
  addJiraProject: (body) => {
    logger.debug("Adding jira project to a group");
    return new Promise((resolve, reject) => {
      connection.query("UPDATE projects SET jira_project_id = ? WHERE project_id = ? ",
        [body.jiraProjectId, body.projectId],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(body.jiraProjectId);
        });
    });
  },
  updateUserJiraRole: (jiraProjectId, userId, role) => {
    logger.debug("updating jira role of a user");
    const userJiraRoleId = uuidv4();
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO users_jira_role (users_jira_role_id, jira_project_id, user_id, project_role) VALUES (?, ?, ?, ?) ",
        [userJiraRoleId, jiraProjectId, userId, role],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve({ userJiraRoleId, userId, role });
        });
    });
  },
  bulkUpdateUsersJiraRole: (usersJiraRoles) => {
    logger.debug("updating jira role of users");
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO users_jira_role (users_jira_role_id, jira_project_id, user_id, 
        project_role, project_role_id) VALUES ? `,
        [usersJiraRoles],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(usersJiraRoles);
        });
    });
  },
  deleteUserJiraRoles: (usersJiraRoleIds) => {
    logger.debug("deleting jira role of a user");
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM users_jira_role WHERE users_jira_role_id IN (?) ", [usersJiraRoleIds],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(usersJiraRoleIds);
        });
    });
  },
  getAllProjectTypes: () => {
    return new Promise((resolve, reject) => {
      connection.query(`Select jpt.jira_project_type_id as jiraProjectTypeId, jpt.jira_project_type_name as jiraProjectTypeName 
      FROM jira_project_type jpt 
      ORDER BY jpt.jira_project_type_name DESC`,
        (error, rows) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(rows);
        });
    });
  },
  getAllProjectTemplates: (jiraProjectTypeId) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT jpt.jira_project_template_key as jiraProjectTemplateKey, 
        jpt.jira_project_template_name as jiraProjectTemplateName
        FROM jira_project_template jpt
        WHERE jpt.jira_project_type_id = ?`, [jiraProjectTypeId], (error, rows) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(rows);
        });
    });
  }
};

module.exports = jira;
