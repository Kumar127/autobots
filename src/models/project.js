const uuidv4 = require("uuid/v4");
const connection = require("../config/dbConnection");
const logger = require("../common/logger");

const project = {
  findByProjectName: (projectName) => {
    logger.debug("Fetching groups by name");
    return new Promise((resolve, reject) => {
      connection.query('select * from projects where project_name = ?',
        projectName, (error, results, ) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          logger.debug("DB results found: %d", results.length);
          if (results && results.length > 0) {
            return resolve(results[0]);
          }
          logger.debug("no records found");
          return resolve(null);
        });
    });
  },
  getAllProjects: (createdBy) => {
    logger.debug("Get all projects");
    return new Promise((resolve, reject) => {
      connection.query(`Select p.project_id as projectId, p.project_name as projectName, p.project_description as projectDescription,
      j.jira_project_id as jiraProjectId, j.jira_project_key as jiraProjectKey, j.jira_project_name as jiraProjectName,
      j.jira_project_url as jiraProjectUrl, je.jenkins_project_name as jenkinsProjectName, p.jenkins_project_type
      as jenkinsProjectType, je.jenkins_project_id as jenkinsProjectId, je.project_role as jenkinsProjectRole,
      sp.sonarqube_project_id as sonarqubeProjectId, sp.sonarqube_project_name as sonarqubeProjectName,
      sp.sonarqube_project_group_name as sonarqubeProjectGroupName
      from projects p
      LEFT JOIN jira_projects j ON p.jira_project_id = j.jira_project_id
      LEFT JOIN jenkins_projects je ON p.jenkins_project_id = je.jenkins_project_id
      LEFT JOIN sonarqube_projects sp ON sp.sonarqube_project_id = p.sonarqube_project_id 
      WHERE LOWER(p.created_by) = ?`, [createdBy.toLowerCase()],
        (error, results) => {
          if (error) {
            console.log(error);
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(results);
        });
    });
  },
  createProject: (body, createdBy) => {
    logger.debug("creating new group in local db");
    const projectId = uuidv4();
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO projects (project_id, project_name, project_description, created_by) VALUES(?, ?, ?, ?)",
        [projectId, body.name, body.description, createdBy],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(projectId);
        });
    });
  },
  getAllUsers: (projectId) => {
    logger.debug("fetching all users in a group");
    return new Promise((resolve, reject) => {
      connection.query(`SELECT DISTINCT u.user_id AS userId, u.user_name AS userName, u.email_address AS emailAddress, u.role_id AS roleId,
        u.mobile_number AS mobileNumber, u.full_name AS fullName, u.user_type AS userType, u.active_status AS activeStatus,
        j.users_jira_role_id as userJiraRoleId, j.project_role as jiraRole, j.project_role_id as jiraRoleId, 
        jep.project_role as jenkinsRole,sp.sonarqube_project_group_name as sonarqubeGroup,spu.sonarqube_project_id as isUserAddedToSonarqube
        FROM users u 
        INNER JOIN project_users pu ON pu.user_id = u.user_id
        INNER JOIN projects p ON pu.project_id = p.project_id
        LEFT JOIN users_jira_role j ON (j.jira_project_id = p.jira_project_id AND j.user_id = u.user_id)
        LEFT JOIN jenkins_users je ON (je.jenkins_project_id = p.jenkins_project_id AND je.user_id = u.user_name)
        LEFT JOIN jenkins_projects jep ON (jep.jenkins_project_id = je.jenkins_project_id)
        LEFT join sonarqube_users spu on  (spu.sonarqube_user_login_id = u.user_name)
       	LEFT JOIN sonarqube_projects sp ON (sp.sonarqube_project_id = spu.sonarqube_project_id)
        where p.project_id = ?`, [projectId],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(results);
        });
    });
  },
  editGroupName: (data) => {
    logger.debug("Updating group name");
    return new Promise((resolve, reject) => {
      connection.query("UPDATE projects SET project_name = ? WHERE project_id = ? ",
        [data.body.projectName, data.body.projectId],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(data.body.projectId);
        });
    });
  },
};
module.exports = project;