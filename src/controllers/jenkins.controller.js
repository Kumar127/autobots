const asyncHandler = require('express-async-handler');
const uuidv4 = require("uuid/v4");
const jenkins = require("../models/jenkins");
const logger = require("../common/logger");

const {
    createProjectFolder,
    getAllRoles,
    getRole,
    createGlobalRole,
    createProjectRole,
    assignRoleToUser,
} = require('../services/jenkins.service');

// Get all roles
exports.getAllRoles = asyncHandler(async (req, res, next) => {
    try {
        const roles = await getAllRoles()
        if (roles) {
            res.json(roles);
        }
    } catch (error) {
        next(error);
    }
});

// Get required role with details
exports.getRole = asyncHandler(async (req, res, next) => {
    try {
        const roleDetails = await getRole(req.query.roleName)
        if (roleDetails) {
            res.json(roleDetails);
        }
    } catch (error) {
        next(error);
    }
});

exports.createGlobalRole = asyncHandler(async (req, res, next) => {
    try {
        const result = await createGlobalRole('developer', 'DEVELOPER')
        if (result) {
            res.json('SUCCESS');
        }
    } catch (error) {
        next(error);
    }
});

// Create a folder in jenkins shared instance
exports.createFolder = asyncHandler(async (req, res, next) => {
    try {
        const createProjectFolderSuccess = await createProjectFolder(req.body.jenkinsProjectName)
        if (createProjectFolderSuccess) {
            const projectRole = `(?i)${req.body.jenkinsProjectName}.*`;
            // creating a Project role for the folder
            const projectRoleResult = await createProjectRole(req.body.jenkinsProjectName, projectRole)
            if (projectRoleResult) {
                const body = {
                    jenkinsProjectName: req.body.jenkinsProjectName,
                    description: req.body.jenkinsProjectDescription,
                    url: req.body.url
                };
                // Creating a jenkins project in local database
                const createJenkinsProjectSuccess = await jenkins.createProject(body);

                if (createJenkinsProjectSuccess) {
                    // Updating project role name and pattern of the jenkins project
                    const updateJenkinsProjectRoleSuccess =
                        await jenkins.updateJenkinsProjectRole(projectRole, req.body.jenkinsProjectName, createJenkinsProjectSuccess);
                    if (updateJenkinsProjectRoleSuccess) {
                        const jenkinsProjectBody = {
                            jenkinsProjectId: createJenkinsProjectSuccess,
                            jenkinsProjectType: req.body.jenkinsProjectType,
                            projectId: req.body.projectId
                        }

                        // Update Jenkins Project ID in groups(project) table
                        const updateJenkinsProjectIdInGroupSuccess = await jenkins.addJenkinsProject(jenkinsProjectBody);

                        if (updateJenkinsProjectIdInGroupSuccess) {
                            res.json({ projectRole: req.body.jenkinsProjectName, jenkinsProjectId: createJenkinsProjectSuccess });
                        }
                    }
                }
            }
        }

    } catch (error) {
        next(error);
    }
});

exports.assignUsersToJenkinsProject = asyncHandler(async (req, res, next) => {
    try {
        const userIds = req.body.users;
        const usersAddedToJenkinsProjectRole = await Promise.all(
            userIds.map((userId) =>
                assignRoleToUser(req.body.jenkinsRoleType, req.body.jenkinsProjectRole, userId)
            )
        );
        if (usersAddedToJenkinsProjectRole) {
            
            // Adding users to jenkins project in local database
            const usersJenkinsRoles = [];
            for (let i = 0; i < req.body.users.length; i += 1) {
                usersJenkinsRoles.push([uuidv4(), req.body.jenkinsProjectId, req.body.users[i]]);
            }
            const assignUsersToJenkinsProjectSuccess = await jenkins.bulkAddUsersToJenkinsProject(usersJenkinsRoles);
            if (assignUsersToJenkinsProjectSuccess) {
                const response = [];
                for (let j = 0; j < assignUsersToJenkinsProjectSuccess.jenkinsUsersRole.length; j += 1) {
                    response.push({
                        "jenkinsUsersRoleId": assignUsersToJenkinsProjectSuccess.jenkinsUsersRole[j][0],
                        "jenkinsRole": req.body.jenkinsProjectRole,
                        "userId": assignUsersToJenkinsProjectSuccess.jenkinsUsersRole[j][2]
                    });
                }    
                res.json(response);
            }
        }
    } catch (error) {
        next(error);
    }
});