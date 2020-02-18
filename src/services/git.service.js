const axios = require('axios');
const https = require('https');
// Create Base Axios instance level which can connect to Git
const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  headers: {
    Authorization: 'Bearer 43f4a55ea77fa9c7055742d1887171c3135cfa19',
  },
});
const BASE_URL = 'https://git-test.cad.basf.net/api/v3';

const api = {};
// Make a request for a user with a given ID
/* instance.get(BASE_URL)
  .then( response => {
    console.log(response);
  })
  .catch( error => {
    console.error(error);
  });
 */
api.getOrganizations = () => instance.get(`${BASE_URL}/user/orgs`).then(response => response.data);

api.newUser = user => instance
  .post(`${BASE_URL}/admin/users`, user)
  .then(response => response.data);

/*  instance.post(`${BASE_URL}/admin/organizations`, {
    login: 'axios-test',
    admin: 'archans',
    profile_name: 'Automatically created organization'
  })
  .then( response => {
    console.log(response.data);
  })
  .catch( error => {
    console.error('Error: ', JSON.stringify(error.response.data,'','\t'));
  }); */

/* instance.post(`${BASE_URL}/admin/users`, {
    login: 'satish',
    email: 'satish-kumar.chaluvaraj@partners.basf.com'
  })
  .then( response => {
    console.log(response.data);
  })
  .catch( error => {
    console.error('Error: ', JSON.stringify(error.response.data,'','\t'));
  }); */

module.exports = api;
