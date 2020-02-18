const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const basicAuth = require('basic-auth');
const LdapStrategy = require('passport-ldapauth');

const routes = require("./routes/v1");
const { logs } = require("./vars");
const error = require("./middlewares/error");
const auth = require('./auth/auth-jwt');

const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

const ldapOptions = {
  server: {
    url: process.env.LDAP_URL,
    bindDN: process.env.LDAP_BIND_DN,
    bindCredentials: process.env.LDAP_BIND_PASS,
    searchBase: 'o=AUTH',
    searchFilter: '(cn={{username}})'
  },
  credentialsLookup: basicAuth
};

passport.use(new LdapStrategy(ldapOptions, (user, done) => {
  const extractor = /cn[=]([^,]+)/;  // extract cn and set user.groups
  const memberOf = user.memberOf || user.isMemberOf || [];
  const userLocal = user;
  userLocal.groups = (Array.isArray(memberOf) ? memberOf : [memberOf]).map(dn => dn.match(extractor)[1]);
  done(null, user);
}));
// enable authentication
app.use(passport.initialize());

// Configure Basic Authentication - LDAP (/login)
app.use(/^[/]login[/]?/, auth.basicLDAP(passport));

// mount api v1 routes
app.use("/v1", auth.bearer(passport), routes);

/* Error Handling
app.use((request, response, next) => {
  const error = new Error('Not Found');
  error.status('404');
  next(error);
});

app.use((error, request, response, next) => {
  response.status(error.status || 500);
  response.json({
      error: {
          message: error.message
      }
  });
}); */

app.get("/", (req, res) => {
  res.json({
    status: "My API is alive!"
  });
});

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

app.listen(3000, () => {
  console.log("My API is running on HTTP port 3000...");
});

/* HTTPS
const credentials = {
  key: fs.readFileSync('certs/nexus-test.cad.basf.net.key', 'utf8'),
  cert: fs.readFileSync('certs/nexus-test.cad.basf.net.pem', 'utf8'),
};

https
  .createServer(credentials, app)
  .listen(3000, () => {
    console.log('My API is running on HTTPS...');
  }); */

module.exports = app;
