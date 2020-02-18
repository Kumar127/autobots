const express = require('express');
const validate = require('express-validation');
const sonarqubeController = require("../../controllers/sonarqube.controller");


const router = express.Router();
// New Project Creation
router.route('/project')
      .post(sonarqubeController.createNewSonarProject)
      .get(sonarqubeController.getSonarProject)

router.post('/project/user', sonarqubeController.addUserToSonarqube)

module.exports = router;
