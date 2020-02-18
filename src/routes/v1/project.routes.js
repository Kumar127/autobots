const express = require("express");
const validate = require("express-validation");
const projectController = require("../../controllers/project.controller");
const validations = require("../../validations/project.validations");

const router = express.Router();

// Fetching all SSA Projects
router.route("/")
      .get(projectController.getAllProjects)
      .post(validate(validations.newProject), projectController.createProject)
      .put(projectController.editGroupName);

// Fetching all Project Users
router.get("/users?:projectId", projectController.getAllProjectUsers);

module.exports = router;
