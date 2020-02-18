const ldap = require("ldapjs");
const uuidv4 = require("uuid/v4");
const connection = require("../config/dbConnection");
const logger = require("../common/logger");

const defaultUserRole = 'USER';

let ldapClient;

const createLDAPClient = () => {
  ldapClient = ldap.createClient({
    url: process.env.LDAP_URL,
    // reconnect: true,
    timeout: 20000,
    connectTimeout: 25000
  });
  ldapClient.on("error", err => {
    logger.error("LDAP Error: %s", err.message);
    ldapClient = null;
  });
};


const ldapConnect = (callback) => {
  createLDAPClient();
  // Credentials For Ldap
  logger.info("connecting to LDAP");
  if (callback) {
    ldapClient.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASS, (err) => {
      if (err) {
        logger.error(err);
      }
      callback();
    });
  } else {
    ldapClient.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASS, (err) => {
      if (err) {
        logger.error(err);
      }
    });
  }
};

ldapConnect();

const ldapSearch = (opts, results, callback) => {
  ldapClient.search('o=AUTH', opts, (err, res) => {
    if (err) {
      logger.error("LDAP Search error: ", err);
    }
    // logger.debug('LDAP Search Result: %o',res);
    res.on("searchEntry", entry => {
      results.push(entry.object);
    });
    res.on("error", err1 => {
      logger.error("LDAP Search result iteration error: ", err1.message);
      // throw err;
      // results.push({ error: true, errDetail: err1 });
      callback(results);
    });
    res.on("end", () => {
      // logger.debug('calling ldap search end..');
      callback(results);
    });
  });
}

const user = {
  /* getAllOnboardedUsers: () => {
    logger.debug("Fetching all onboarded users");
    return new Promise((resolve, reject) => {
      connection.query("Select * from users", 
      (error, rows) => {
        if (error) {
          logger.error("Error: ", error);
          reject(error);
        }
        else
          resolve(rows);
      });
    });
  }, */
  fetchUsersFromLdap: (searchText, callback) => {
    const results = [];
    const opts = {
      // filter: `(givenname=${searchText}*)`,
      filter: `(&(|(givenname=${searchText}*)(sn=${searchText}*))(mail=*))`,
      scope: "sub",
      attributes: ["sn", "cn", "givenname", "fullName", "uid", "mail"],
      sizeLimit: 50
    };
    if (!ldapClient) {
      ldapConnect(ldapSearch.bind(null, opts, results, callback));
    } else {
      ldapSearch(opts, results, callback)
    }
  },
  addUser: (body) => {
    logger.debug('Creating a new internal user in local db');
    const userId = uuidv4();
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO users (user_id, user_name, email_address, role_id, mobile_number, full_name, user_type, active_status)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, body.userName, body.emailAddress, defaultUserRole, body.mobileNumber, body.fullName, body.userType, 'Y'],
        (err, results) => {
          if (err) {
            logger.error("Error: ", err);
            return reject(err);
          }
          return resolve(userId);
        });
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
  findByEmailAddress: (emailAddress) => {
    logger.debug("Fetching user by email address");
    return new Promise((resolve, reject) => {
      connection.query(
        "Select user_id as userId from users where email_address = ?",
        emailAddress,
        (error, results) => {
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
  findByMultipleEmailAddress: (emailAddresses) => {
    logger.debug("Fetching users by email addresses");
    return new Promise((resolve, reject) => {
      connection.query(
        "Select email_address as emailAddress, user_id as userId from users where LOWER(email_address) IN (?)",
        [emailAddresses],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          logger.debug("DB results found: %d", results.length);
          if (results && results.length > 0) {
            return resolve(JSON.stringify(results));
          }
          logger.debug("no records found");
          return resolve(null);
        });
    });
  },
  findByProjectIdAndUserId: (projectId, userId) => {
    logger.debug("Fetching users by group id and user id");
    return new Promise((resolve, reject) => {
      connection.query(
        `Select user_id as userId from project_users where project_id = ? AND user_id = ?`,
        [projectId, userId], (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          logger.debug("DB results found: %d", results.length);
          if (results && results.length > 0) {
            return resolve(results[0].userId);
          }
          logger.debug("no records found");
          return resolve(null);
        });
    });
  },
  addUserToGroup: (projectId, userId) => {
    logger.debug("Adding user to group");
    const projectUsersId = uuidv4();
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO project_users (project_users_id, project_id, user_id) VALUES (?, ?, ?) ",
        [projectUsersId, projectId, userId], (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(results);
        });
    });
  },
  addMultipleUsers: (body) => {
    logger.debug("adding multiple users to local db");
    return new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO users (user_id, user_name, email_address, role_id, mobile_number, full_name, user_type, active_status) VALUES ? ",
        [body],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(body);
        });
    });
  },
  addMultipleUsersToGroup: (userAndProjectIds) => {
    logger.debug("Adding multiple user to group");
    return new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO project_users (project_users_id, project_id, user_id) VALUES ? ",
        [userAndProjectIds],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            reject(error);
          }
          return resolve(userAndProjectIds);
        });
    });
  },
  removeUsersFromGroup: (projectId, userIds) => {
    logger.debug("Removing users from group");
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM project_users
        WHERE project_id = ? 
        AND user_id IN (?)`,
        [projectId, userIds],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(results);
        });
    });
  },
  getAllProjectAdmins: () => {
    logger.debug("fetching all project admin with their projects");
    return new Promise((resolve, reject) => {
      connection.query(`select u.full_name as 'projectAdminName', u.user_name as 'projectAdminUserName', 
                        IFNULL(GROUP_CONCAT(p.project_name), '') as projects
                        from users u left outer join projects p on u.user_name = p.created_by
                        where u.role_id = 'PADM'
                        group by u.full_name, u.user_name `, 
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(results);
        });
    });
  },
  createNewProjectAdmins: (body) => {
    logger.debug("adding project admins to local db");
    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO users 
        (user_id, user_name, email_address, role_id, mobile_number, full_name, user_type, active_status) 
        VALUES ? `,
        [body],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(body);
        });
    });
  },
  removeUsersFromDB: (userId) => {
    logger.debug("Removing users from group");
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM project_users
        WHERE user_id = ?`,
        [userId],
        (error, results) => {
          if (error) {
            logger.error("Error: ", error);
            return reject(error);
          }
          return resolve(results);
        });
    });
  },
};

module.exports = user;
