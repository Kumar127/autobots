const express = require("express");
const projectRoutes = require("./project.routes");
const gitRoutes = require("./git.routes");
const jiraRoutes = require("./jira.routes");
const nexusRoutes = require("./nexus.routes");
const userRoutes = require("./user.routes");
const jenkinsRoutes = require("./jenkins.routes");
const sonarqubeRoutes = require("./sonarqube.routes");

const router = express.Router();

/**
 * GET v1/status
 */
router.get("/status", (req, res) => res.send("OK"));

router.use("/projects", projectRoutes);
router.use("/git", gitRoutes);
router.use("/jira", jiraRoutes);
router.use("/nexus", nexusRoutes);
router.use("/users", userRoutes);
router.use("/jenkins", jenkinsRoutes);
router.use("/sonarqube", sonarqubeRoutes);

module.exports = router;
