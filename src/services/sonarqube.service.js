const axios = require('axios');
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default;
const tough = require('tough-cookie');
const https = require('https');
const logger = require("../common/logger");

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

const instance = axios.create({
  httpsAgent: new https.Agent({
  }),
  auth: {
    username: process.env.SONARQUBE_TEST_AUTH_TOKEN,
  },
  jar: cookieJar,
});
const BASE_URL = process.env.SONARQUBE_TEST_BASE_URL;

const api = {};

//geting all sonarqube projects
api.getSonarProjects = () => {
  logger.debug("fetching all sonarqube projects through SONARQUBE API")
    return instance
        .get(`${BASE_URL}/projects/search`)
        .then(response => response.data)
        .catch((err) => {
            logger.error("erorr :" , err)
            //throw err;
            throw new Error(error.response.data.errors[0].msg);
        });
};
// creating new sonarqube Project
api.createSonarProject = (project) => {
    logger.debug("Creating new SONARQUBE project through SONARQUBE API");
    const config = {
        headers: {
          Accept: 'application/json', 
          'Content-Type': 'application/json', 
        }, 
        params: {
            name: project.name, 
            key: project.key, 
            visibility: project.visibility, 
            organization: project.organization,
        }, 
      };
    return instance
      .post(`${BASE_URL}/projects/create`, null, config)
      .then(response => response.data )
      .catch((error) => {
         console.error("Error: ", JSON.stringify(error.response.data.errors[0].msg));    
        throw new Error(error.response.data.errors[0].msg);
      });
  };

// creating groups in sonarqube
  api.createSonarGroup = (groupName) => {
      logger.debug("creating new group through SONARQUBE API");
      const config = {
        headers: {
          Accept: 'application/json', 
          'Content-Type': 'application/json', 
        }, 
        params : {
           name:groupName
          }
      };
      return instance 
       .post(`${BASE_URL}/user_groups/create`, null, config)
       .then(response => response.data)
       .catch((error) => {
        //    logger.error("Error: ", error);
            console.error("Error: ", JSON.stringify(error.response.data.errors));
            console.error("Error: ", error.request);
            throw new Error(error.response.data.errors[0].msg);
       });
  };
  //checking project creator present in the Sonarqube or not ?
  api.checkSonarUsers = (login_id) => {
    logger.debug("checking sonar users in sonarqube from service file");
    const config = {
        headers: {
          Accept: 'application/json', 
          'Content-Type': 'application/json', 
        }, 
        params : {
            login: login_id
          }                                       
      };
      return instance
      .get(`${BASE_URL}/users/groups`, config)
      .then(response => {
        // console.log("res",response.data.groups)
        return response.data.groups})
      .catch((error)=>{
          // console.error("Error: ", JSON.stringify(error.response.data.errors[0].msg));
          return null;
          //return JSON.stringify(error.response.data.errors[0].msg) ;
         
      })
  }
  // creating new Sonar users
  api.createSonarUsers = (login, password, name, email) => {
    logger.debug("creating new sonar users in SONARQUBE");
    const config = {
      headers: {
        Accept: 'application/json',  
        'Content-Type': 'application/json',  
      },   
      params : {
          login, 
          password, 
          name, 
          email
    }
    };
    return instance
    .post(`${BASE_URL}/users/create`,null,config)
    .then(response => response.data.user)
    .catch((error) => {
      console.error("Error: ", JSON.stringify(error.response.data.errors));
      //console.error("Error: ", error.request);
      return;
      //throw new Error(error.response.data.errors[0].msg);
    })
  }
// Adding users or may be project creator (if not there) to the group
   api.assignUsersToGroup = (login_id, groupName) => {
      logger.debug("Adding users to the groups from service file");
      const config = {
        headers: {
          Accept: 'application/json', 
          'Content-Type': 'application/json', 
        }, 
        params : {
            login : login_id, 
            name : groupName, 
      }
      };
      return instance
      .post(`${BASE_URL}/user_groups/add_user`, null, config)
      .then(response => response.config.params)
      .catch((error) => {
        console.error("Error: ", JSON.stringify(error.response.data.errors));
        console.error("Error: ", error.request);
          throw new Error(error.response.data.errors[0].msg);
      })
  }
//                                  assigning permissions to the groups   ( 6 API CALLS )                               //
//                          GLOBAL_PERMISSION: [admin, gateadmin, profileadmin, provisioning, scan]
  api.Permissions = (groupName, key, permission) => {
    logger.debug(`getting ${permission} permission`);
    const config = {
      headers: {
        Accept: 'application/json', 
        'Content-Type': 'application/json', 
      }, 
      params : {
        groupName, 
        permission, 
        projectKey : key
        
    }
    };
      return instance
      .post(`${BASE_URL}/permissions/add_group`, null, config)
      .then(response =>  response.config.params)
      .catch((error) => {
        console.error("Error: ", JSON.stringify(error.response.data.errors));
        console.error("Error: ", error.request);
        throw new Error(error.response.data.errors[0].msg);
      })
  }
module.exports = api;
  