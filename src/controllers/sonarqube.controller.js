const asyncHandler = require('express-async-handler');
const sonarqube = require("../models/sonarqube");
const uuidv4 = require("uuid/v4");
const logger = require("../common/logger");
const generator = require('generate-password');
const CONSTS = require('../config/constants');
const password = generator.generate({
    length: 10,
    numbers: true
});
const {
    createSonarProject,
    getSonarProjects,
    createSonarGroup,
    checkSonarUsers,
    assignUsersToGroup,
    createSonarUsers,
    Permissions,
} = require('../services/sonarqube.service');

// get all sonarqube projects
exports.getSonarProject = asyncHandler( async (req,res,next) => {
    try {
        const result = await getSonarProjects();
        if(result) {
            res.json(result)
        }
    } catch (error) {
        next(error);
    }
    
});
exports.createNewSonarProject = asyncHandler(async (req, res, next) => {
    try {
        /*
            STEP 1
            CREATING NEW SONARQUBE PROJECT WITH SERVICE CALL
        */
        const project = {
            name: req.body.sonarqubeProjectName,
            key: req.body.sonarqubeProjectKey,
            visibility: req.body.sonarqubeProjectVisibility,
            organization: req.body.sonarqubeProjectOrganization ? req.body.sonarqubeProjectOrganization : 'default-organization',
        }
        let createSonarqubeProjectInDbSuccess;
        logger.debug('Creating New sonarqube Project');
        const createSonarqubeProjectSuccess = await createSonarProject(project)
            if (createSonarqubeProjectSuccess) {
                logger.debug("sonarqube project created in sonarqube");
                /*
                    Creating the sonarqube project in LOCal Db!! 
                */
                const body = {
                    sonarqubeProjectName: req.body.sonarqubeProjectName, 
                    sonarqubeProjectKey: req.body.sonarqubeProjectKey, 
                    sonarqubeProjectVisibility: req.body.sonarqubeProjectVisibility, 
                    sonarqubeProjectOrganization: req.body.sonarqubeProjectOrganization, 
                    sonarqubeProjectGroupName: req.body.sonarqubeProjectGroupName, 
                }
        logger.debug("Now,Creating the Sonarqube Project in Local db !");
            createSonarqubeProjectInDbSuccess = await sonarqube.createSonarProjectInDb(body);
                if (createSonarqubeProjectInDbSuccess) {
                    logger.debug("Created new Sonarqube Project in local DB!");
                    //Map sonarqube project with projects table in local db
                    logger.debug('Associating the sonarqube project with SSA group/Projects Table');
                    const addSonarqubeProjectInDbSuccess = await sonarqube.updateProjectForSonarqube(createSonarqubeProjectInDbSuccess, req.body.projectId);
                        if (addSonarqubeProjectInDbSuccess) {
                            logger.debug("sonarqube project created in LOCAL DB & sonarqube_project_id updated in projects table");
                        }
                }
            }
        /*
            STEP 2
            SONARQUBE SERVICE CALL FOR CREATING NEW GROUP
        */
        logger.debug('Creating New sonarqube Group');
        const sonarGroupSuccess = await createSonarGroup(req.body.sonarqubeProjectGroupName)
        if (sonarGroupSuccess) {
            logger.debug("Adding newly created groups to local db !");
        // UPDATING groupName IN SONARQUBE_PROJECT TABLE
        const addSonarqubeUserToDbSuccess = sonarqube.updateSonarqubeGroupInDb(req.body.sonarqubeProjectGroupName, req.body.sonarqubeProjectKey);
        if (addSonarqubeUserToDbSuccess) {
            logger.debug("success in updating sonarqube_project table");
        }
        }
        /*
            STEP 3
            GRANT PERMISSION TO THE GROUP
        */
        logger.debug("Granting permission to the group related to the sonarqube project");
        let permissionCounter = 0;
        const promise1 =  await Permissions(req.body.sonarqubeProjectGroupName, req.body.sonarqubeProjectKey, CONSTS.SONARQUBE.GROUP_PERMISSIONS[permissionCounter++]);
        const promise2 =  await Permissions(req.body.sonarqubeProjectGroupName, req.body.sonarqubeProjectKey, CONSTS.SONARQUBE.GROUP_PERMISSIONS[permissionCounter++]);
        const promise3 =  await Permissions(req.body.sonarqubeProjectGroupName, req.body.sonarqubeProjectKey, CONSTS.SONARQUBE.GROUP_PERMISSIONS[permissionCounter++])
        const promise4 =  await Permissions(req.body.sonarqubeProjectGroupName, req.body.sonarqubeProjectKey, CONSTS.SONARQUBE.GROUP_PERMISSIONS[permissionCounter++])
        const promise5 =  await Permissions(req.body.sonarqubeProjectGroupName, req.body.sonarqubeProjectKey, CONSTS.SONARQUBE.GROUP_PERMISSIONS[permissionCounter++])
        const promise6 =  await Permissions(req.body.sonarqubeProjectGroupName, req.body.sonarqubeProjectKey, CONSTS.SONARQUBE.GROUP_PERMISSIONS[permissionCounter++])
        const projectPermission =  Promise.all([promise1, promise2, promise3, promise4, promise5, promise6 ])
        if (projectPermission) {
            logger.debug("All six project level permission granted to the group");
        }
        /*
            STEP 4
            ADDING PROJECT CREATOR TO THE GROUP.
        */
        // Adding Project Creator to sonar-users group (default-group)
        logger.debug("Creating a new user in SONARQUBE through service call");
        const user = {
            sonarqubeProjectId :createSonarqubeProjectInDbSuccess,
            sonarqubeUserLoginId : req.body.projectCreatorLogin,
            sonarqubeUserPassword : password,
            sonarqubeUserName : req.body.projectCreatorName,
            sonarqubeUserEmail : req.body.projectCreatorEmail,
        }
        const CheckProjectCreatorPresence = await checkSonarUsers(req.body.projectCreatorLogin)
        if (CheckProjectCreatorPresence === null) {
            const addSonarUsersSuccess = await createSonarUsers(req.body.projectCreatorLogin, password, req.body.projectCreatorName, req.body.projectCreatorEmail);
            logger.debug("PROJECT CREATOR added to sonar-users group");
        }
        logger.debug("NOW,PROJECT CREATOR getting added to desired group from controller.js");
        const addUserToGroupSuccess =  await assignUsersToGroup(req.body.projectCreatorLogin, req.body.sonarqubeProjectGroupName);
            if (addUserToGroupSuccess) {
                logger.debug("user added to the desired group through service call");       
                logger.debug("adding project creator to local db");
                const addUserToSonarqubeUsersTableSuccess = await sonarqube.addUserToSonarqubeUsers(user)
                if (addUserToSonarqubeUsersTableSuccess) {
                    logger.debug("adding project creator to local db i.e(SONARQUBE_USERS TABLE )");
                    const sonarqubeData = {
                        sonarqubeProjectId: createSonarqubeProjectInDbSuccess, 
                        sonarqubeProjectName: req.body.sonarqubeProjectName, 
                        sonarqubeProjectGroupName: req.body.sonarqubeProjectGroupName,
                        sonarqubeProjectKey: req.body.sonarqubeProjectKey,
                        projectId: req.body.projectId
                    }
                    res.status(200).send(sonarqubeData);
                }
            }
            else {
                res.status(500).send(JSON.stringify("erorr:- failed in adding users to local db"));
            }                 
    } catch (error) {
        next(error);
    }
});
exports.addUserToSonarqube = asyncHandler(async (req, res, next) => {
    try {
        // Check if users already present in sonar-users
        const userNames = req.body.sonarUsers.map(selectedUser => selectedUser.login);
        logger.debug("Checking if users are present in sonarqube");
        const userChecksInSonarqube = await Promise.all(
            userNames.map(suserNames =>
                checkSonarUsers(suserNames)
            )
        )
        // ERROR MSG WHEN USER IS NOT THERE IN SONARQUBE .["Unknown user: ram"]
        let usersAddedToDesiredGroup = [];
        let usersAddedToSonarGroup =[];
        for (let i = 0; i < userChecksInSonarqube.length; i += 1) {
            if (userChecksInSonarqube[i] === null) {
                usersAddedToSonarGroup.push(req.body.sonarUsers[i]);
            }
            else {
                logger.debug("user present in sonarqube");
                logger.debug(`Now checking user presence in the ${ req.body.sonarqubeProjectGroupName } group!`)
                if (userChecksInSonarqube[i].length > 1) {
                    let isGroupPresent = false;
                    for (let j= 0 ;j < userChecksInSonarqube[i].length; j += 1) {
                        if (userChecksInSonarqube[i][j].name === req.body.sonarqubeProjectGroupName) {
                            logger.debug(`${ req.body.sonarUsers[i].login }  already present in the ${ req.body.sonarqubeProjectGroupName } group`);
                            isGroupPresent = true;
                        }
                    }
                    if (!isGroupPresent) {
                        usersAddedToDesiredGroup.push(req.body.sonarUsers[i]);
                    }
                }
                else {
                    usersAddedToDesiredGroup.push(req.body.sonarUsers[i]);
                }
            }
        }
        let addUserToSonarUsers = [];
        let sonarUserCreation;
        if (usersAddedToSonarGroup.length > 0) {
            logger.debug(`Adding  ${ usersAddedToSonarGroup.length } user initially to the default group i.e sonar-users`)
            sonarUserCreation = await Promise.all(
                usersAddedToSonarGroup.map( (userToAdd) => {
                    if (userToAdd !== null) {
                        addUserToSonarUsers =  createSonarUsers(userToAdd.login, password, userToAdd.fullName, userToAdd.emailAddress)
                        .catch((error) => {
                            logger.error(error.response.data.errorMessages);
                            throw new Error(JSON.stringify(error.response.data.errorMessages));
                        });
                    return addUserToSonarUsers;
                    }
                    return null;
                })
            )
        if (sonarUserCreation.length >0) { 
            logger.debug("New Sonar-user created");
            console.log("sonar-users",sonarUserCreation);
            //console.log("vala",addUserToSonarUsers);
            // pushing back the created user array in the array of users that is to be added to desired group
            usersAddedToDesiredGroup.push(...sonarUserCreation);
            console.log("All users",usersAddedToDesiredGroup);
        }
        }
        // Adding Users in desired group
        let usersAdded =[];
        if (usersAddedToDesiredGroup.length > 0) {
            logger.debug(`Adding ${usersAddedToDesiredGroup.length } users in desired Group of sonarqube`);
            usersAdded = await Promise.all(
                usersAddedToDesiredGroup.map( (userToAdd) => {
                    if (userToAdd !== null) {
                        const addUserToGroup = assignUsersToGroup(userToAdd.login, req.body.sonarqubeProjectGroupName)
                            .catch((error) => {
                                logger.error(error.response.data.errorMessages);
                                throw new Error(JSON.stringify(error.response.data.errorMessages));
                            });
                    return addUserToGroup;
                    }
                    return null;
                })
            );
        }
        let sonarqubeBulkAddUsersGroupInDB =[];
        if (usersAdded.length > 0) {
            logger.debug('Adding user in local db');
            const sonarUsersGroup = [];
            const passwords = generator.generateMultiple(usersAddedToDesiredGroup.length, {
                length: 10,
                uppercase: false
            });
            for (let i = 0; i < usersAddedToDesiredGroup.length; i += 1) {
                sonarUsersGroup.push([uuidv4(), req.body.sonarqubeProjectId, usersAddedToDesiredGroup[i].login, passwords[i], usersAddedToDesiredGroup[i].name,
                usersAddedToDesiredGroup[i].email,
                ]);       
                // console.log("abh",sonarUsersGroup);
            }
            sonarqubeBulkAddUsersGroupInDB = await sonarqube.bulkAddUsersToSonarqubeProject(sonarUsersGroup);       
        }
        if (sonarqubeBulkAddUsersGroupInDB) {
            let responseValue =[];
            for (let i=0 ; i < usersAddedToDesiredGroup.length; i+=1) {
                    responseValue.push({
                    "sonarUsersGroupLogin" : usersAddedToDesiredGroup[i].login,
                }) 
            }
            res.status(200).send({"sonarqubeProjectGroupName": req.body.sonarqubeProjectGroupName,responseValue});
        }
    }
    catch (error) {
        next(error);
    }
})