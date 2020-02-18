const express = require('express');
const asyncHandler = require('express-async-handler');
const validate = require('express-validation');

const router = express.Router();
const { getOrganizations, newUser } = require('../../services/git.service');
const validations = require('../../validations/git.validations');

// define the home page route
router.get('/', (req, res) => {
  res.send('Git home page');
});
// define the about route
router.get('/about', asyncHandler(async (req, res, next) => {
  const results = await getOrganizations();
  res.json(results);
}));

router.post('/user', validate(validations.newUser), asyncHandler(async (req, res, next) => {
  const results = await newUser(req.body);
  res.json(results);
}));


module.exports = router;
