const jwt = require('jsonwebtoken');
const vars = require('../vars');
const users = require('../models/user');

const secret = vars.jwtSecret;
const ttl = vars.jwtExpirationInterval;

const encrypt = (text, done) => {
  jwt.sign({
    token: text,
  }, secret, {
    expiresIn: `${ttl}d`,
  }, (err, token) => {
    if (err) {
      done(err);
    } else {
      done(undefined, token);
    }
  });
};

const decrypt = (text, done) => {
  jwt.verify(text, secret, (err, decoded) => {
    if (err) {
      done(err);
    } else {
      done(undefined, decoded);
    }
  });
};

/**
 * Process the authorization: Basic header
 */
module.exports.basicLDAP = function basicLDAP(passport) {
  const send401 = (msg, req, res, next) => {
    res.set('WWW-Authenticate', 'Basic').status(401).json(msg || {});
    next();
  };

  return (req, res, next) => {
    const authorization = req.get('Authorization');

    if (!authorization) {
      // Send the request for Basic Authentication and exit
      return send401({
        message: 'Missing header',
      }, req, res, next);
    }

    // Do the authentication
    return passport.authenticate('ldapauth', (err, user, info) => {
      // console.log(err, user, info);
      if (err) {
        return next(err);
      }

      if (!user) {
        // Authentication failed
        return send401(info, req, res, next);
      }

      // Authentication succeeded so login the user
      req.user = user; // req.logIn() is not called because no session is needed

      // Encrypt the header because it contains the password
      return encrypt(authorization, async (error, basic) => {
        if (error) {
          next(error);
        } else {
          // Create the bearer token
          const base64 = Buffer.from(basic).toString('base64');

          // Put the token in the response and send
          const reply = info || {};
          reply.token = base64;

          // Put user details in response from local db
          const findByUserNameSuccess = await users.findByUserName(user.uid);
          if (findByUserNameSuccess) {
            reply.userDetails = findByUserNameSuccess;
            res.status(200).json(reply);
          } else {
            return send401({
              message: 'You are not onboarded to SSA, please contact SSA Admin.',
            }, req, res, next);
          }
        }
      });
    })(req, res, next);
  };
};

/**
 * Process the authorization: Bearer header
 */
module.exports.bearer = function bearer(passport) {
  const send401 = (req, res, next) => {
    res.set('WWW-Authenticate', 'Bearer').status(401).json({
      message: 'Login to get a new bearer token',
    });
    return send401;
  };

  return (req, res, next) => {
    const authorization = req.get('Authorization');
    const key = authorization ? authorization.match(/bearer\s+([\S]+)$/i) || [] : [];
    // console.log(authorization, key);
    if (!authorization) {
      return send401(req, res, next);
      // return res.redirect('/login');
      // return next();
    }

    if (!key[1]) {
      // Invalid bearer authentication
      return send401(req, res, next);
    }

    // Validate token is still valid and decrypt the basic authorization header
    const token = Buffer.from(key[1], 'base64').toString('UTF-8');
    return decrypt(token, (err, basic) => {
      if (err) {
        console.error(err);
        return (err.name === 'TokenExpiredError') ? send401(req, res, next) : next(err);
      }

      // Override the authorization header
      req.headers.authorization = basic.token;

      // Do the authentication with the overridden header
      return passport.authenticate('ldapauth', (error, user) => {
        if (error) {
          next(error);
        } else if (!user) {
          // Authentication failed
          res.redirect('/login');
        } else {
          // Authentication succeeded so login the user
          req.user = user; // req.logIn() is not called because no session is needed
          next();
        }
      })(req, res, next);
    });
  };
};
