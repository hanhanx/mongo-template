var baseFactory = require('./base_ap.js');
var mongoose = require('mongoose');
var User = mongoose.models.User;

var extAPI = {
  
  add: function(req, res) {
    if(req.body.name === undefined || req.body.name.length === 0) {
      res.status(500).json({message: 'name is undefined'});
    }
    else {
      User.findOne({'name':req.body.name}, function(err, one) {
        if(err) {
          res.status(500).send(err);
        }
        else if(one) {
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

var userRouter = baseFactory(User, '/user', extAPI, "all user account");


module.exports = userRouter;