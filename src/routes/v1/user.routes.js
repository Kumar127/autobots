const express = require("express");
const validate = require("express-validation");
const user = require("../../models/user");
const validations = require("../../validations/user.validations");
const userController = require("../../controllers/user.controller");

const router = express.Router();
/*
router.get("/", (req, res) => {
  user.getAllOnboardedUsers((err, results) => {
    if (err) {
      logger.error(err);
    }
    res.json(results);
  });
}); */

router.get("/fetchFromLdap?:searchParam", (req, res) => {
  user.fetchUsersFromLdap(req.query.searchParam, (results) => {
    // console.log("results", results);
    if (results && results.length === 0) {
      res.status(500).send({ error: "LDAP Search Error" });
    } else {
      res.json(results);
    }
  });
});

router.post("/", validate(validations.newUser), userController.addInternalUsersToGroup)
      .delete("/", userController.removeUsersFromGroup);

router.post("/addExternalUser", validate(validations.externalUser), userController.addExternalUserToGroup);

router.get("/externalUser?:emailAddress", userController.checkDuplicateExternalUser);

router.route('/projectAdmins')
      .get(userController.getAllProjectAdmins)
      .post(validate(validations.newUser), userController.addProjectAdmins)
module.exports = router;
