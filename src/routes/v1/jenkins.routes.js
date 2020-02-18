const express = require('express');
const jenkinsController = require("../../controllers/jenkins.controller");

const router = express.Router();


// Fetching all roles
router.get('/roles', jenkinsController.getAllRoles);

// Fetching role details
router.get("/role?:roleName", jenkinsController.getRole);

// Creating a global role
router.post("/role/global", jenkinsController.createGlobalRole);

// Creating a project folder
router.post("/createFolder", jenkinsController.createFolder);

// Adding user to jenkins
router.post("/users", jenkinsController.assignUsersToJenkinsProject);

module.exports = router;
