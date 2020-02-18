const axios = require('axios');
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default;
const tough = require('tough-cookie');
const CONSTS = require('../config/constants');
const logger = require("../common/logger");

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

const baseUrlV1 = CONSTS.EXTERNAL.BASE_URL_V1;
const baseUrlV2 = CONSTS.EXTERNAL.BASE_URL_V2;

const instance = axios.create({
  jar: cookieJar,
  auth: {
    username: CONSTS.EXTERNAL.AUTH.userName,
    password: CONSTS.EXTERNAL.AUTH.password,
  },
});

const api = {};

// CSRF Token Request
api.fetchCSRFToken = () => instance
  .get(baseUrlV2, {
    headers: {
      'X-CSRF-Token': 'fetch',
    },
  })
  .then((response) => {
    return response.headers['x-csrf-token'];
  })
  .catch((error) => {
    logger.error("Error: ", error);
    throw error;
  });

// Check for duplicate user
api.checkDuplicateUser = (email) => {
  const token = api.fetchCSRFToken();
  return token.then((tokenValue) => {
    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': tokenValue,
      },
      params: {
        $filter: `SV_MX_MAIL_PRIMARY eq '${email}'`,
      },
    };
    return instance
      .get(`${baseUrlV2}/ET_MX_PERSON`, config)
      .then(response => response.data.d.results[0])
      .catch((error) => {
        logger.error("Error: ", error);
        throw error;
      });
  });
};

api.addExternalUser = (body, callback) => {
  api.fetchCSRFToken().then((tokenValue) => {
    const params = {
      MX_FIRSTNAME: body.fName,
      MX_LASTNAME: body.lName,
      MX_MAIL_PRIMARY: body.email,
      BASF_IDEN_OTP_MESSAGETYPE: 'SMS',
      BASF_IDEN_OTP_EMAILADDRESS: body.email,
      BASF_IDEN_OTP_MOBILE: body.mobileNumber,
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': tokenValue,
      },
      withCredentials: true,
      params,
    };
    instance
      .post(
        `${baseUrlV1}/entries/0/tasks/22EF2258-BAED-4482-9660-ACFA0FC6247B`,
        null,
        config,
      )
      .then((response) => {
        // console.log('in response!');
        callback(null, response.data);
      })
      .catch((error) => {
        logger.error("Error: ", error);
        callback(error);
      });
  });
};

module.exports = api;
