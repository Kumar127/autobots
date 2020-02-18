const asyncHandler = require('express-async-handler');
const uuidv4 = require("uuid/v4");
const user = require("../models/user");
const logger = require("../common/logger");
const emailUtil = require("../common/emailUtil");
const { addExternalUser, checkDuplicateUser } = require("../services/externalUser.service");

// Add Internal Users to group
exports.addInternalUsersToGroup = asyncHandler(async (req, res, next) => {
    try {
        /*
            Adding internal users to the project and db
        */
        logger.debug('Adding users in local db');
        const emailAddresses = req.body.users.map(newUser => newUser.emailAddress.toLowerCase());
        const findUsersByMultipleEmailAddressesSuccess = await user.findByMultipleEmailAddress(emailAddresses);
        let usersToAdd = [];
        const usersPresent = JSON.parse(findUsersByMultipleEmailAddressesSuccess);
        if (findUsersByMultipleEmailAddressesSuccess) {
            if (usersPresent.length > 0) {
                for (let i = 0; i < req.body.users.length; i += 1) {
                    let flag = true;
                    for (let j = 0; j < usersPresent.length; j += 1) {
                        if (req.body.users[i].emailAddress.toLowerCase() === usersPresent[j].emailAddress.toLowerCase()) {
                            flag = false;
                        }
                    }
                    if (flag) {
                        usersToAdd.push(req.body.users[i]);
                    }
                }
            } else {
                usersToAdd = req.body.users;
            }
        } else {
            usersToAdd = req.body.users;
        }

        if (usersToAdd.length > 0) {
            const usersToBeAdded = [];
            for (let i = 0; i < usersToAdd.length; i += 1) {
                usersToBeAdded.push([uuidv4(), usersToAdd[i].userName, usersToAdd[i].emailAddress.toLowerCase(),
                    'USER', usersToAdd[i].mobileNumber, usersToAdd[i].fullName, usersToAdd[i].userType, 'Y']);
            }
            const addMultipleUsersToDB = await user.addMultipleUsers(usersToBeAdded)

            if (addMultipleUsersToDB) {
                const userAndProjectIds = [];
                for (let i = 0; i < usersToAdd.length; i += 1) {
                    userAndProjectIds.push([uuidv4(), req.body.projectId, usersToBeAdded[i][0]])
                }

                const addMultipleUsersToGroupSuccess = await user.addMultipleUsersToGroup(userAndProjectIds)

                if (addMultipleUsersToGroupSuccess) {
                    logger.debug('Adding user to project');
                    const response = [];
                    for (let j = 0; j < addMultipleUsersToGroupSuccess.length; j += 1) {
                        response.push({
                            userId: addMultipleUsersToGroupSuccess[j][2],
                            userName: usersToBeAdded[j][5],
                        });
                    }
                    res.status(200).send(response);
                }
            }
        } else {
            const usersToAddInProject = [];
            for (let i = 0; i < req.body.users.length; i += 1) {
                for (let j = 0; j < usersPresent.length; j += 1) {
                    if (req.body.users[i].emailAddress.toLowerCase() ===
                        usersPresent[j].emailAddress.toLowerCase()) {
                        usersToAddInProject.push({
                            userId: usersPresent[j].userId,
                            userName: req.body.users[i].userName,
                            emailAddress: req.body.users[i].emailAddress,
                            fullName: req.body.users[i].fullName,
                            userType: req.body.users[i].userType,
                        });
                    }
                }
            }
            const userAndProjectIds = [];
            for (let i = 0; i < req.body.users.length; i += 1) {
                userAndProjectIds.push([uuidv4(), req.body.projectId, usersToAddInProject[i].userId])
            }

            const addMultipleUsersToGroupSuccess = await user.addMultipleUsersToGroup(userAndProjectIds);

            if (addMultipleUsersToGroupSuccess) {
                logger.debug('Adding user to project');
                const response = [];
                for (let j = 0; j < addMultipleUsersToGroupSuccess.length; j += 1) {
                    response.push({
                        userId: addMultipleUsersToGroupSuccess[j][2],
                        userName: usersToAddInProject[j].fullName,
                    });
                }
                res.status(200).send(response);
            }
        }
    } catch (error) {
        next(error);
    }
});


// Delete Users From Group
exports.removeUsersFromGroup = asyncHandler(async (req, res, next) => {
    try {
        const userIds = [];
        const mailList = [];
        const subject = `Revoked Access From Team ${req.body.projectName}`;
        for (let i = 0; i < req.body.users.length; i += 1) {

            mailList.push({
                userName: req.body.users[i].name,
                emailAddress: 'vijay-vishwas.dharap@partners.basf.com',
            });

            userIds.push(req.body.users[i].userId);
        }
        const removeUsersFromProjectSuccess = await user.removeUsersFromGroup(req.body.projectId, userIds);
        if (removeUsersFromProjectSuccess) {
            emailUtil.sendMultipleEmail(mailList, subject, 'removeUserFromTeam', { teamName: req.body.projectName }, 
                (error1, results1) => {
                    if (results1) {
                        res.status(200).send(`Removed users from team`);
                    } else {
                        console.log(error1);
                        throw new Error('Email while sending email');
                    }
                });
            res.status(200).send("Removed users from team");
        }
    } catch (error) {
        next(error);
    }
});


exports.addExternalUserToGroup = asyncHandler(async (req, res, next) => {
    try {
        /*
            Adding external user to the project and db
            - Check if the user is present in local database, if not then add user to 3iam and then to local db
            - Else check if the user is present in project, if not then add in project
            - Else return user already present in project message
        */
        logger.debug('Checking if user present in local db');
        let userId = null;

        const findUserByEmailAddressSuccess = await user.findByEmailAddress(req.body.email);

        if (findUserByEmailAddressSuccess) {
            logger.debug('User found in local db');
            ({ userId } = findUserByEmailAddressSuccess);

            const findUserByProjectIdAndUserIdSuccess = await user.findByProjectIdAndUserId(req.body.projectId, userId);

            if (findUserByProjectIdAndUserIdSuccess) {
                logger.debug('User already present in group');
                res.status(201).send(userId);
            } else {
                const addUserToGroupSuccess = await user.addUserToGroup(req.body.projectId, userId);

                if (addUserToGroupSuccess) {
                    logger.debug('Adding user to group');
                    res.status(200).send(userId);
                }
            }
        } else {
            // Adding User to Database
            logger.debug('Adding external user in 3iam');
            addExternalUser(req.body, (error3, results3) => {
                const { projectId } = req.body;
                const addUserBody = {
                    userName: req.body.email,
                    emailAddress: req.body.email,
                    mobileNumber: req.body.mobileNumber,
                    fullName: `${req.body.fName} ${req.body.lName}`,
                    userType: req.body.userType,
                };
                if (error3) {
                    logger.error(error3);
                    if (error3.response.data.MX_REST_MSG.includes('duplicate')) {
                        logger.debug('User Already Present in 3iam');
                        logger.debug('Adding external user in local db');

                        const addUserToGroupSuccess = addUserToGroup(addUserBody, projectId);
                        if (addUserToGroupSuccess) {
                            res.status(200).send(addUserToGroupSuccess);
                        }
                    } else {
                        logger.error(error3.response.data.MX_REST_MSG);
                        throw new Error("Failed to add External User");
                    }
                } else {
                    logger.debug('Adding external user in local db')
                    const addUserToGroupSuccess = addUserToGroup(addUserBody, projectId);
                    if (addUserToGroupSuccess) {
                        res.status(200).send(addUserToGroupSuccess);
                    }
                }
            });
        }
    } catch (error) {
        next(error);
    }
});

const addUserToGroup = async (body, projectId) => {
    return new Promise((resolve, reject) => {
        let userId = null;
        const addUserToDBSuccess = user.addUser(body);
        if (addUserToDBSuccess) {
            logger.debug('Added user to db');
            userId = addUserToDBSuccess;
            const addUserToGroupSuccess = user.addUserToGroup(projectId);

            if (addUserToGroupSuccess) {
                logger.debug('Adding user to group');
                resolve(userId);
            }
        }
        reject(new Error());
    });
}

exports.checkDuplicateExternalUser = asyncHandler(async (req, res, next) => {
    try {
        const result = await checkDuplicateUser(req.query.emailAddress);
        if (result) {
            res.json({ firstName: result.SV_MX_FIRSTNAME, lastName: result.SV_MX_LASTNAME, emailAddress: result.SV_MX_MAIL_PRIMARY });
        } else {
            throw new Error('No user found');
        }
    } catch (error) {
        next(error);
    }
})

exports.getAllProjectAdmins = asyncHandler(async (req, res, next)=>{
    try{
        logger.debug("fetching all group admins here")
        const projectAdminsSuccess = await user.getAllProjectAdmins();
        if(projectAdminsSuccess){
            res.json(projectAdminsSuccess)
        }
    } catch(error){
        next(error);
    }
})

exports.addProjectAdmins = asyncHandler(async(req, res, next) => {
try {
    /*
        Adding users as group Admin
    */
    logger.debug('Adding group admins in local db');
    const emailAddresses = req.body.users.map(newUser => newUser.emailAddress.toLowerCase());
    const findUsersByMultipleEmailAddressesSuccess = await user.findByMultipleEmailAddress(emailAddresses);
    let usersToAdd = [];
    if (findUsersByMultipleEmailAddressesSuccess) {
        const usersPresent = JSON.parse(findUsersByMultipleEmailAddressesSuccess);
        if (usersPresent.length > 0) {
            for (let i = 0; i < req.body.users.length; i += 1) {
                let flag = true;
                for (let j = 0; j < usersPresent.length; j += 1) {
                    if (req.body.users[i].emailAddress.toLowerCase() === usersPresent[j].emailAddress.toLowerCase()) {
                        flag = false;
                    }
                }
                    if (flag) {
                        usersToAdd.push(req.body.users[i]);
                    }
                }
            } else {
                usersToAdd = req.body.users;
            }
            } else {
                usersToAdd =req.body.users
            }

    if (usersToAdd.length > 0) {
        logger.debug('adding the group admins selected in local db and sending response from here')
        const usersToBeAdded = [];
        for (let i = 0; i < usersToAdd.length; i += 1) {
            usersToBeAdded.push([uuidv4(), usersToAdd[i].userName, usersToAdd[i].emailAddress.toLowerCase(),
                usersToAdd[i].role_id, usersToAdd[i].mobileNumber, usersToAdd[i].fullName, usersToAdd[i].userType, 'Y']);
        }
        const addMultipleUsersToDB = await user.createNewProjectAdmins(usersToBeAdded)

        if (addMultipleUsersToDB) {
            res.status(200).send('group admin added');
        }
    } else {
        throw new Error("Users already present in database");
    }
} catch (error) {
    next(error);
}
    
});