'use strict';

// Module dependencies.
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler'),
    colors = require('colors');

var app = module.exports = exports.app = express();
app.locals.siteName = "Mongo template";
app.locals.restAPI = [];

// Connect to database
var db = require('./config/db');

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
  console.log(('bootstrap models: ' + modelsPath + '/' + file).yellow);
  require(modelsPath + '/' + file);
});

// Bootstrap routes
// var routesPath = path.join(__dirname, 'routes');
// fs.readdirSync(routesPath).forEach(function(file) {
//   console.log('bootstrap routes: ' + routesPath + '/' + file);  
//   app.use('/', require(routesPath + '/' + file));
// });

// Bootstrap api
//console.log('test logging'.red);
var apiPath = path.join(__dirname, 'api');
fs.readdirSync(apiPath).forEach(function(file) {
  var api = require(apiPath + '/' + file);
  if(api.router && api.router.stack) {
    console.log(('bootstrap api: ' + apiPath + '/' + file).green);
    app.use('', api.router);

    var apiObj = {uri: api.uri, description:api.description};
    app.locals.restAPI.push(apiObj);
  }
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
