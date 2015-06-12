var baseFactory = require('./base_ap.js');
var mongoose = require('mongoose');
var User = mongoose.models.User;

var extAPI = {
  validateAdd: function(req, res) {
    if(req.body.name === undefined) {
      res.status(500).json({message: 'user name is undefined'});
      return false;
    }
    return true;
  }
};

var userRouter = baseFactory(User, '/user', extAPI, "all user account");


module.exports = userRouter;