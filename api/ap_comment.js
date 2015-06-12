//var express = require('express');
//var router = express.Router();
//router.uri = '/comment';
//router.description = "comments form all users";
var baseFactory = require('./base_ap.js');
var mongoose = require('mongoose');
var Comment = mongoose.models.Comment;
var User = mongoose.models.User;

//var api = {
//	comments: function(req, res) {
//		Comment.find().populate('user').exec(function(err, comments) {
//			if(err) {
//				res.status(500).json(err);
//			}
//			else {
//				res.status(200).json(comments);
//			}
//		});
//	},
//	addComment: function(req, res) {
//		if(typeof req.body === 'undefined'
//			|| req.body.text === undefined ||
//			req.body.text.length === 0) {
//			return res.status(500).json({message: 'comment is undefined'});
//		}
//
//		if(req.body.userName === undefined) {
//			return res.status(500).json({message: 'user is undefined'});
//		}
//
//
//		User.findOne({name:req.body.userName}, function(err, user) {
//			if(err) {
//				return res.status(500).json(err);
//			}
//			else {
//				var comment = new Comment({text:req.body.text, user:user._id});
//
//				comment.save(function(err, data, numberAffected) {
//					if(!err) {
//						return res.status(201).json(data);
//					}
//					else {
//						return res.status(500).json(err);
//					}
//				});
//			}
//		});
//	}
//};

var extAPI = {

};

var commentRouter = baseFactory(Comment, '/comment', extAPI, 'comments from all users');

//router.get(router.uri, api.comments);
//router.post(router.uri, api.addComment);

//router.route(router.uri+'/:id')

module.exports = commentRouter;