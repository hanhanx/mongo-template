var express = require('express');
var router = express.Router();
router.apiPath = '/comment';

var mongoose = require('mongoose');
var Comment = mongoose.models.Comment;
var api = {
	comments: function(req, res) {
		Comment.find(function(err, users) {
			if(err) {
				res.status(500).json(err);
			}
			else {
				res.status(200).json(users);
			}
		});
	},
	addComment: function(req, res) {
		if(typeof req.body === 'undefined' || req.body.text === undefined || req.body.text.length === 0) {
			return res.status(500).json({message: 'comment is undefined'});
		}

		var comment = new Comment(req.body);
		comment.save(function(err, data, numberAffected) {
			if(!err) {
				return res.status(201).json(data);
			}	
			else {
				return res.status(500).json(err);
			}
		});
	}
};

router.get(router.apiPath, api.comments);
router.post(router.apiPath, api.addComment);


module.exports = router;