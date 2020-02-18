const asyncHandler = require('express-async-handler');
const project = require("../models/project");
const logger = require("../common/logger");

// Get All Groups
exports.getAllProjects = asyncHandler(async (req, res, next) => {
    try {
        const projects = await project.getAllProjects(req.query.createdBy);
        if (projects) {
            res.json(projects);
        }
    } catch (error) {
        next(error);
    }
});

// Create New Group
exports.createProject = asyncHandler(async (req, res, next) => {
    try {
        const findProjectByName = await project.findByProjectName(req.body.name);
        if (findProjectByName) {
            throw new Error(`Group already exist with name ${req.body.name}`);
        } else {
            const newProject = await project.createProject(req.body, req.user.uid);
            if (newProject) {
                res.json(newProject);
            }
        }
    } catch (error) {
        next(new Error(error));
    };
});

// Create New Jira Project
exports.getAllProjectUsers = asyncHandler(async (req, res, next) => {
    try {

        const users = await project.getAllUsers(req.query.projectId);
        if (users) {
            res.json(users);
        }
    } catch (error) {
        next(error);
    }
});

// Edit Group Name
exports.editGroupName = asyncHandler(async (req, res, next) => {
    try {
        const newGroupName = await project.editGroupName(req.body);
        if (newGroupName) {
            res.json(newGroupName);
        }
    } catch (error) {
        next(error);
    }
});
