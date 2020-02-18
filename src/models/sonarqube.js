const uuidv4 = require("uuid/v4");
const connection = require("../config/dbConnection");
const logger = require("../common/logger");

const sonarqube = {
    createSonarProjectInDb: (body) => {
      const sonarqubeProjectId = uuidv4();
      return new Promise((resolve, reject) => {
        connection.query("INSERT INTO sonarqube_projects (sonarqube_project_id, sonarqube_project_name, sonarqube_project_key, sonarqube_project_visibility, sonarqube_project_organization, sonarqube_project_group_name) VALUES(?, ?, ?, ?, ?, ?)",
          [sonarqubeProjectId, body.sonarqubeProjectName, body.sonarqubeProjectKey, 
            body.sonarqubeProjectVisibility, body.sonarqubeProjectOrganization,
            body.sonarqubeProjectGroupName],
          (error, results) => {
            if (error) {
              logger.error("Error: ", error);
              return reject(error);
            }
            return resolve(sonarqubeProjectId);
          });
      });
    },
    updateProjectForSonarqube: (sonarqubeProjectId, projectId) => {
        logger.debug("Adding sonarqubeProjectId in projects/Groups table");
        return new Promise((resolve, reject) => {
          return connection.query(
            "UPDATE projects SET sonarqube_project_id = ?  where project_id = ? ",
            [sonarqubeProjectId, projectId],
            (err, results) => {
              if (err) {
                logger.error("Error: ", err);
                return reject(err);
              }
              return resolve(sonarqubeProjectId);
            }
          );
        });
      },
      updateSonarqubeGroupInDb: (sonarqube_project_group_name, key) => {
        logger.debug("Adding group name in sonarqubeProject table");
        return new Promise((resolve, reject) => {
            return connection.query(
                "UPDATE sonarqube_projects SET sonarqube_project_group_name = ?  WHERE sonarqube_project_key = ? ",
                [ sonarqube_project_group_name, key],
                (err, results) => {
                    if(err) {
                        logger.error("Error: ", err);
                        return reject(err);
                    }
                    return resolve(sonarqube_project_group_name);
                }
            );
        });
    },
    findByUserName: (userName) => {
        logger.debug("Fetching user by username");
        return new Promise((resolve, reject) => {
          connection.query(
            `select user_id as userId, user_name as userName, email_address as emailAddress, role_id as roleId, mobile_number as mobileNumber,
            full_name as fullName, user_type as userType, active_status as activeStatus from users where user_name = ?`,
            userName, (error, results) => {
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
    addUserToSonarqubeUsers: (body) => {
        const sonarqubeUserId = uuidv4();
        logger.debug("Adding users to sonarqube user table");
        return new Promise((resolve,reject) => {
            return connection.query(
                "INSERT INTO sonarqube_users (sonarqube_users_id, sonarqube_project_id, sonarqube_user_login_id, sonarqube_user_password, sonarqube_user_name, sonarqube_user_email) VALUES(?, ?, ?, ?, ?, ?)",
                [sonarqubeUserId, body.sonarqubeProjectId, body.sonarqubeUserLoginId, body.sonarqubeUserPassword
                , body.sonarqubeUserName, body.sonarqubeUserEmail],
                (err,results) => {
                    if(err) {
                        logger.error("Error: ", err);
                        return reject(err);
                    }
                    return resolve(sonarqubeUserId);
                }
            )
        })
    },
    addUserToUsersTable: (body) => {
        const userId = uuidv4();
        logger.debug("Adding sonarqube_users to USERS TABLE");
        return new Promise((resolve,reject) => {
            return connection.query(
                "INSERT INTO users (user_id, user_name, email_address, role_id, mobile_number, full_name, user_type, active_status) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
                [userId, body.userName, body.emailAddress, body.roleId, body.mobileNumber, body.fullName,
                body.userType,body.activeStatus],
                (err,results) => {
                    if(err) {
                        logger.error("Error: ", err);
                        return reject(err);
                    }
                    return resolve(userId);
                }
            )
        })
    },
    checkUsersInSonarqubeUsers: (userName) => {
        logger.debug("Checking user by username");
        return new Promise((resolve, reject) => {
          connection.query(
            `select sonarqube_users_id as sonarqubeUserId, sonarqube_project_id as sonarqubeProjectId, sonarqube_user_login_id as sonarqubeUserLoginId, sonarqube_user_password as sonarqubeUserPassword, sonarqube_user_name as sonarqubeUserName ,
            sonarqube_user_email as sonarqubeUserEmail  from sonarqube_users where  sonarqube_user_login_id = ?`,
            userName, (error, results) => {
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
    bulkAddUsersToSonarqubeProject: (sonarUsersGroup) => {
      logger.debug("Adding users to a sonarqube project");
      return new Promise((resolve, reject) => {
        return connection.query(
          "INSERT INTO sonarqube_users (sonarqube_users_id, sonarqube_project_id, sonarqube_user_login_id, sonarqube_user_password, sonarqube_user_name, sonarqube_user_email) VALUES ? ",
          [sonarUsersGroup],
          (err, results) => {
            if (err) {
              logger.error("Error: ", err);
              return reject(err);
            }
            return resolve({ sonarUsersGroup });
          }
        );
      });
    },
}
module.exports = sonarqube; 
