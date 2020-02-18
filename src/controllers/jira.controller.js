const asyncHandler = require('express-async-handler');
const uuidv4 = require("uuid/v4");
const jira = require("../models/jira");
const logger = require("../common/logger");
const emailUtil = require("../common/emailUtil");
const {
    newUser,
    getAllProjectRoles,
    addUserToProject,
    createProject,
    findUserByUserName,
    deleteUserFromProjectRole,
    getAllPermissionSchemes,
    getUserDetails,
} = require('../services/jira.service');

// Create New Jira User
exports.createUser = asyncHandler(async (req, res, next) => {
    const userCheck = await getUserDetails(req.body.name);
    console.log(userCheck);
    if (userCheck.length > 0) {
        res.send('User Already Present');
    } else {
        const results = await newUser(req.body);
        res.json(results);
    }
});

// Search Existing Jira User
exports.searchUser = asyncHandler(async (req, res) => {
    const userDetails = await getUserDetails(req.query.username)
        .catch((error) => {
            if (error.response) {
                logger.error(error.response.data);
                res.status(500).send(JSON.stringify(error.response.data.errors));
            } else {
                logger.error(error);
                res.status(500).send(JSON.stringify(error));
            }
        });
    if (userDetails) {
        res.json(userDetails);
    } else {
        res.send('No Such User.');
    }
});


// Get Jira Project Types
exports.getProjectTypes = asyncHandler(async (req, res, next) => {
    try {
        const projectTypes = await jira.getAllProjectTypes();
        if (projectTypes) {
            res.json(projectTypes);
        }
    } catch (error) {
        next(new Error("Error occured while fetching jira project types"));
    }
});

// Get Jira Project Templates
exports.getProjectTemplates = asyncHandler(async (req, res, next) => {
    try {
        const projectTemplates = await jira.getAllProjectTemplates(req.query.jiraProjectTypeId);
        if (projectTemplates) {
            res.json(projectTemplates);
        }
    } catch (error) {
        next(new Error("Error occured while fetching jira project templates"));
    };
});

// Create New Jira Project
exports.createJiraProject = asyncHandler(async (req, res, next) => {
    try {
        // Fetch BASF SQUAD permission scheme for new jira project
        const permissionSchemes = await getAllPermissionSchemes()
            .catch((error) => {
                if (error.response) {
                    logger.error(error.response.data);
                    throw (new Error(JSON.stringify(error.response.data.errors)));
                } else {
                    logger.error(error);
                    throw (new Error(JSON.stringify(error)));
                }
            });
        if (permissionSchemes) {
            let basfPermissionScheme = {};
            for (let i = 0; i < permissionSchemes.length; i += 1) {
                if (permissionSchemes[i].name === 'BASF Squad Permission Scheme') {
                    basfPermissionScheme = permissionSchemes[i];
                }
            }
            const project = {
                name: req.body.jiraProjectName,
                key: req.body.jiraProjectKey,
                lead: req.body.jiraProjectLead,
                projectTypeKey: req.body.jiraProjectTypeName,
                projectTemplateKey: req.body.jiraProjectTemplateKey,
                permissionScheme: basfPermissionScheme.id
            };

            // Create New Project in Jira
            logger.debug('Creating New Jira Project');
            const createJiraProjectSuccess = await createProject(project)
                .catch((error) => {
                    logger.error(error.response.data.errors);
                    throw (new Error(JSON.stringify(error.response.data.errors)));
                });
            if (createJiraProjectSuccess) {
                const body = {
                    jiraProjectId: createJiraProjectSuccess.id,
                    jiraProjectName: req.body.jiraProjectName,
                    jiraProjectKey: req.body.jiraProjectKey,
                    jiraProjectType: req.body.jiraProjectTypeName,
                    jiraProjectTemplate: req.body.jiraProjectTemplateKey,
                    jiraProjectLead: req.body.jiraProjectLead,
                    jiraProjectUrl: createJiraProjectSuccess.self,
                }

                // Create New jira project in local DB
                const createJiraProjectInDB = await jira.createProject(body);
                if (createJiraProjectInDB) {
                    const addJiraProjectBody = {
                        projectId: req.body.projectId,
                        jiraProjectId: createJiraProjectInDB,
                    };

                    // Map Jira project with group in local db
                    logger.debug('Associating the jira project with SSA group');
                    const addJiraProjectInDB = await jira.addJiraProject(addJiraProjectBody);
                    if (addJiraProjectInDB) {
                        res.json({
                            jiraProjectId: addJiraProjectBody.jiraProjectId,
                            projectId: req.body.projectId,
                            jiraProjectKey: req.body.jiraProjectKey,
                            jiraProjectUrl: body.jiraProjectUrl
                        });
                    }
                }
            }
        }
    } catch (error) {
        next(error);
    }
});

// Get all Jira Project roles
exports.getAllJiraProjectRoles = asyncHandler(async (req, res, next) => {
    try {
        const jiraRoles = await getAllProjectRoles();
        if (jiraRoles) {
            res.json(jiraRoles);
        }
    } catch (error) {
        next(JSON.stringify(error.response.data.errors));
    }
});

// Add users to Jira Project
exports.addUsersToJiraProjectRole = asyncHandler(async (req, res, next) => {
    try {

        // FIXME To Recheck Flow and Optimize Code
        // Populate existing Jira role ids to update them
        const usersJiraRolesIds = [];
        const existingUsersRoleToDelete = [];
        for (let i = 0; i < req.body.users.length; i += 1) {
            if (req.body.users[i].userJiraRoleId) {
                existingUsersRoleToDelete.push({
                    user: req.body.users[i].name,
                    role: req.body.users[i].oldRole,
                });
                usersJiraRolesIds.push(req.body.users[i].userJiraRoleId);
            }
        }

        // Check if users already present in Jira amd filter the original list
        logger.debug("Checking if users are present in jira");
        const userNames = req.body.users.map(selectedUser => selectedUser.name.toLowerCase());

        const userChecks = await Promise.all(
            userNames.map(userName =>
                findUserByUserName(userName)
            )
        );

        // Populate user to be added in Jira
        const usersToAdd = [];
        for (let i = 0; i < userChecks.length; i += 1) {
            if (userChecks[i] === null) {
                usersToAdd.push(req.body.users[i]);
            }
        }

        // Adding Users in Jira
        if (usersToAdd.length > 0) {
            logger.debug(`Adding ${usersToAdd.length} users in Jira`);
            const usersAdded = await Promise.all(
                usersToAdd.map((userToAdd) => {
                    if (userToAdd !== null) {
                        const newUserToAddInJira = {
                            name: userToAdd.name,
                            emailAddress: userToAdd.emailAddress,
                            displayName: userToAdd.displayName,
                        }
                        const results = newUser(newUserToAddInJira)
                            .then(result => result)
                            .catch((error) => {
                                logger.error(error.response.data.errorMessages);
                                throw new Error(JSON.stringify(error.response.data.errorMessages));
                            });
                        return results;
                    }
                    return null;
                })
            );
        }

        // Delete existing users from project roles in Jira
        if (existingUsersRoleToDelete.length > 0) {
            console.log(existingUsersRoleToDelete);
            const usersExistingRolesDeleted = await Promise.all(
                existingUsersRoleToDelete.map((existingUserRole) =>
                    deleteUserFromProjectRole(req.body.jiraProjectKey, existingUserRole.user, existingUserRole.role)
                )
            );
        }

        // Adding Users to Jira project role
        logger.debug(`Adding users to jira project role - ${req.body.roleName}`);
        const result = await addUserToProject(
            req.body.jiraProjectKey,
            req.body.role,
            userNames,
        ).catch((error) => {
            logger.error(error.response.data.errorMessages);
            throw new (Error(JSON.stringify(error.response.data.errorMessages)));
        });

        // Delete users from local DB if updated user roles
        if (usersJiraRolesIds.length > 0) {
            logger.debug('Deleting existing user roles from local db');
            const deleteUserFromJiraRole = await jira.deleteUserJiraRoles(usersJiraRolesIds);
        }

        // Batch Update Users Jira roles in local DB
        if (result) {
            logger.debug('Adding/Updating user roles in local db');
            const usersJiraRoles = [];
            for (let i = 0; i < req.body.users.length; i += 1) {
                usersJiraRoles.push([uuidv4(), req.body.jiraProjectId, req.body.users[i].userId, req.body.roleName, req.body.role]);
            }
            // Updating Jira Roles
            const jiraBulkUpdateUsersJiraRoleInDB = await jira.bulkUpdateUsersJiraRole(usersJiraRoles);
            if (jiraBulkUpdateUsersJiraRoleInDB) {
                const response = [];
                const mailList = [];
                let contextBody = {};
                const subject = `Added to Jira Project ${req.body.jiraProjectName}`;
                for (let j = 0; j < jiraBulkUpdateUsersJiraRoleInDB.length; j += 1) {
                    mailList.push({
                        userName: req.body.users[j].displayName,
                        isInternalUser: req.body.users[j].userType === 'Internal',
                        emailAddress: 'vijay-vishwas.dharap@partners.basf.com',
                    });
                    response.push({
                        'userJiraRoleId': jiraBulkUpdateUsersJiraRoleInDB[j][0],
                        'userId': jiraBulkUpdateUsersJiraRoleInDB[j][2],
                        'roleName': jiraBulkUpdateUsersJiraRoleInDB[j][3],
                        'role': jiraBulkUpdateUsersJiraRoleInDB[j][4],
                    });
                }

                contextBody = {
                    jiraProjectUrl: req.body.jiraProjectUrl,
                    jiraProjectName: req.body.jiraProjectName
                }

                // Emailing users to notify about new Jira Project Role
                emailUtil.sendMultipleEmail(mailList, subject, 'addUserInJira', contextBody, (error2, results2) => {
                    if (results2) {
                        res.json({ response });
                    } else {
                        throw new Error('Error while sending email');
                    }
                });
            }
        }
    } catch (error) {
        next(error);
    }
});

// Remove user from Jira Project
exports.deleteUserFromJiraProjectRole = asyncHandler(async (req, res, next) => {
    try {
        // Remove user from project role in Jira
        const result = await deleteUserFromProjectRole(req.body.jiraProjectKey, req.body.userName, req.body.jiraRoleId)
            .catch((error) => {
                throw new Error(JSON.stringify(error.response.data.errors));
            });
        if (result) {

            // Deleting user to jira role mapping in local DB
            const deleteUserJiraRoleInDB = jira.deleteUserJiraRoles([req.body.userJiraRoleId]);
            if (deleteUserJiraRoleInDB) {
                const subject = `Revoked Access From Jira Team ${req.body.jiraProjectName}`;

                // Email to notify user jira access revoked for the project
                emailUtil.sendEmail('vijay-vishwas.dharap@partners.basf.com', subject, 'removeUserFromJira',
                    { projectName: req.body.jiraProjectName, userName: req.body.fullName }, (error1, results1) => {
                        if (results1) {
                            res.status(200).send(`Removed user ${req.body.fullName} from Jira Project ${req.body.jiraProjectName}`);
                        } else {
                            throw new Error('Error while sending email');
                        }
                    });
            }
        }
    } catch (error) {
        next(error);
    }
});