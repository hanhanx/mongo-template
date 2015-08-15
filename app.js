'use strict';
// dependencies
var express = require('express'),
  path = require('path'),
  fs = require('fs'),
  methodOverride = require('method-override'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  errorhandler = require('errorhandler'),

  session = require('express-session'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

var logger = require('tracer').console({level:'debug'});


logger.debug(process.env);

// local variable setup
var app = module.exports = exports.app = express();
app.locals.siteName = "Mongo template";
app.locals.restAPI = [];

// Connect to database
require('./config/dev.db');

// environment setup
var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    require('./config/dev.db');
    app.use(morgan('dev'));
    app.use(errorhandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.set('view options', {
        pretty: true
    });
}
if ('test' == env) {
    app.use(morgan('test'));
    app.set('view options', {
        pretty: true
    });
    app.use(errorhandler({
        dumpExceptions: true,
        showStack: true
    }));
}
if ('production' == env) {
    app.use(morgan());
     app.use(errorhandler({
        dumpExceptions: false,
        showStack: false
    }));
}


var user = { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' };
// passport setup
function localCallback(username, password, done) {
  if(username === 'bob') {
    done(null, user);
  }
  else {
    done(null, false);
  }
};

function localSerializer(user, done) {
  logger.debug(user);
  done(null, 1234);
};

function localDeserializer(id, done) {
  logger.debug(id);
  done(null, user);
};
passport.use(new LocalStrategy(localCallback));
passport.serializeUser(localSerializer);
passport.deserializeUser(localDeserializer);


// app middleware setup
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(session({name: 'AUTH',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false}));

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// Bootstrap models
var modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
  logger.info(modelsPath + '/' + file);
  require(modelsPath + '/' + file);
});

// Bootstrap routes
//var routesPath = path.join(__dirname, 'routes');
//fs.readdirSync(routesPath).forEach(function(file) {
//  logger.info(routesPath + '/' + file);
  //var router = require(routesPath + '/' + file);
  //if(router && router.stack) {
  //  app.use('/', router);
  //}
//});

function ensureAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  if(req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/login.html');
  }
}

// Bootstrap api
app.all('/api/*', ensureAuthenticated);
app.get('/api', ensureAuthenticated, function(req, res) {
  res.status(200).json(app.locals.restAPI);
});
var apiPath = path.join(__dirname, 'api');
fs.readdirSync(apiPath).forEach(function(file) {
  var api = require(apiPath + '/' + file);
  if(api.router && api.router.stack) {
    logger.info(apiPath + '/' + file);
    app.use('/', api.router);

    var apiObj = {uri: api.uri, description:api.description};
    app.locals.restAPI.push(apiObj);
  }
});



//authentication redirect
app.post('/auth',
    passport.authenticate('local',
      {failureRedirect: '/login.html', successRedirect: '/api'})
);

// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});
