var baseFactory = require('./base_ap.js');
var mongoose = require('mongoose');
var Comment = mongoose.models.Comment;
var User = mongoose.models.User;
var QueryBuilder = require('../common/QueryBuilder.js');

var extAPI = {
  add: function(req, res) {
 		if(typeof req.body === 'undefined'
			|| req.body.text === undefined ||
			req.body.text.length === 0) {
			return res.status(500).json({message: 'comment is undefined'});
		}

    if(req.body.userName === undefined) {
			return res.status(500).json({message: 'user is undefined'});
		}
    User.find({name:req.body.userName}).limit(1).exec(function(err, user) {
      if(err) {
        return res.status(500).json(err);
      }
      else {
        user = user[0];
        var comment = new Comment({text:req.body.text, user:user._id});
        comment.save(function(err, data, numberAffected) {
          if(!err) {
            return res.status(201).json(data);
          }
          else {
            return res.status(500).json(err);
          }
        })
      }
    });
  }
};




var qb = new QueryBuilder({
    model:Comment,
    population: 'user',
    afterQuery: function(query) {
      query.populate('user');
    },
    afterExec: function(data) {
      //var modelMap = {comment: Comment, user:User};
      return data;
    }
  });




var urlModelMap = {
  '/api/comment': Comment,
  '/api/user': User
};



var commentAPI = baseFactory(qb, '/api/comment', extAPI, 'comments from all users');
module.exports = commentAPI;