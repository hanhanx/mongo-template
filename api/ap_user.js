var baseFactory = require('./base_ap.js');
var mongoose = require('mongoose');
var User = mongoose.models.User;
var QueryBuilder = require('../common/QueryBuilder.js');
var apiModelMap = require('./api_model_map.js');

var extAPI = {
  add: function(req, res) {
    if(req.body.name === undefined || req.body.name.length === 0) {
      res.status(500).json({message: 'name is undefined'});
    }
    else {
      User.find({'name':req.body.name}).limit(1).exec(function(err, data) {
        if(err) {
          res.status(500).send(err);
        }
        else if(data.length > 0) {
          res.status(500).json({message: 'user ' + req.body.name + ' already exists.'});
        }
        else {
          var user = new User(req.body);
          user.save(function(err, data, numberAffected) {
            if(err) {
              res.status(500).send(err);
            }
            else {
              res.status(201).json(data);
            }
          });
        }
      });
    }
  }
};

var qb = new QueryBuilder({
  model:User
});

var userRouter = baseFactory(qb, apiModelMap.User, extAPI, "all user account");
module.exports = userRouter;