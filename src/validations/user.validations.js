const Joi = require('joi');

const user = {
  userName: Joi.string().required().label('User Name is required'),
  emailAddress: Joi.string().email().required().label('Email Address is required'),
  fullName: Joi.string().required().label('Full Name is required'),
  userType: Joi.string().length(1).required(),
}

const newUser = {
  users: Joi.array().items(user),
  projectId: Joi.string().required(),
  projectName: Joi.string().required(),
};

const externalUser = {
  fName: Joi.string().required(),
  lName: Joi.string().required(),
  email: Joi.string().email().required(),
  mobileNumber: Joi.string().alphanum().required(),
  projectId: Joi.string().required(),
  projectName: Joi.string().required(),
}
module.exports = {
 newUser,
 externalUser,
};
