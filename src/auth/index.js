
const express = require('express');
const passport = require('passport');
const basicAuth = require('basic-auth');
const LdapStrategy = require('passport-ldapauth');
const auth = require('./auth.js');
const ldapOptions = {/* load from config */}; 

ldapOptions.credentialsLookup = basicAuth;

passport.use(new LdapStrategy(ldapOptions, (user, done) => {
  const extractor = /cn[=]([^,]+)/;  // extract cn and set user.groups
  const memberOf = user.memberOf || user.isMemberOf || [];
  user.groups = (Array.isArray(memberOf) ? memberOf : [memberOf]).map(dn => dn.match(extractor)[1]);
  done(null, user);
}));

const app = express();

app.use(passport.initialize());

// Configure Basic Authentication - LDAP (/login)
app.use(/^[/]login[/]?/, auth.basicLDAP(passport));

// Configure Bearer Authentication - Cached (not /login)
app.use(/^[/](?!login)/, auth.bearer(passport));