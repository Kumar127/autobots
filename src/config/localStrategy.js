const LocalStrategy = require("passport-local").Strategy;
const logger = require("../common/logger");
const user = require("../models/user");

const local = async(loginId, password, cb) => {
  // logger.debug('login creds: %s %s', loginId, password);
  try {
    const findUserByUserNameSuccess = await user.findByUserName(loginId);
    console.log(findUserByUserNameSuccess);
    if (findUserByUserNameSuccess) {
      console.log(findUserByUserNameSuccess);
      if (findUserByUserNameSuccess && findUserByUserNameSuccess.length <= 0) {
        logger.error("No matching user found!");
        return cb(null, false, { message: "No matching user found!" });
      }
      logger.debug("query results: %s %s", findUserByUserNameSuccess.password, password);
      if (findUserByUserNameSuccess.password === password) {
        logger.debug("auth success!");
        return cb(null, findUserByUserNameSuccess);
      }
    }
    logger.debug("incorrect password!");
    return cb(null, false, { message: "incorrect password" });
  } catch(error) {
      logger.error(error, cb);
      return cb(error);
  }
};
module.exports = new LocalStrategy(local);
