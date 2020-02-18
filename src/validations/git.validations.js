const Joi = require('joi');

module.exports = {
  // POST /v1/users
  newUser: {
    body: {
      login: Joi.string().required(),
      email: Joi.string().email().required(),
    },
  },
};
