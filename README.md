# Autobots Manager Backend

## Features
* No transpilers, just vanilla javascript
* ES2017 latest features like Async/Await
* CORS enabled
* Express
* Docker support - pending
* Uses helmet to set some HTTP headers for security
* Load environment variables from .env files with dotenv
* Request validation with joi
* Gzip compression with compression
* Linting with eslint
* Logging with morgan
* Authentication and Authorization with passport
* Monitoring with pm2

## Project Structure
 Inspiration https://github.com/danielfsousa/express-rest-es2017-boilerplate

* Our REST Endpoints for each of the tool in `src/routes` folder.
* Actual backend calls to each tool's REST API are present in `src/services` folder.
* If we need to add validation for data being sent to our REST API, such validations are present in `src/validations` folder.
