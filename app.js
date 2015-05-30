'use strict';

// Module dependencies.
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler');

var app = module.exports = exports.app = express();
app.locals.siteName = "Mongo template";
app.locals.restAPI = {uri:[]};

// Connect to database
var db = require('./config/db');
var util = require('./util/x_util');

// app.use(express.static(__dirname + '/public'));

var env = process.env.NODE_ENV || 'development';

if ('development' == env) {
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

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Bootstrap models
var modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
  console.log('bootstrap models: ' + modelsPath + '/' + file);  
  require(modelsPath + '/' + file);
});

// Bootstrap routes
// var routesPath = path.join(__dirname, 'routes');
// fs.readdirSync(routesPath).forEach(function(file) {
//   console.log('bootstrap routes: ' + routesPath + '/' + file);  
//   app.use('/', require(routesPath + '/' + file));
// });

// Bootstrap api
var apiPath = path.join(__dirname, 'api');
fs.readdirSync(apiPath).forEach(function(file) {
  console.log('bootstrap api: ' + apiPath + '/' + file);  
  var apRouter = require(apiPath + '/' + file);
  app.use('/api', apRouter);
  app.locals.restAPI.uri.push('/api' + apRouter.apiPath);
    
});


app.get('/', function(req, res) {
  res.redirect(301, '/api');
});

app.get('/api', function(req, res) {
  res.status(200).json(app.locals.restAPI);
});


// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});
