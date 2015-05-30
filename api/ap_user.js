var express = require('express');
var router = express.Router();
router.apiPath = '/user';

var mongoose = require('mongoose');
var User = mongoose.models.User;
var api = {
	users: function(req, res) {
		User.find(function(err, users) {
			if(err) {
				res.status(500).json(err);
			}
			else {
				res.status(200).json(users);
			}
		});
	},
	addUser: function(req, res) {
		if(typeof req.body === 'undefined' || req.body.name === undefined) {
			return res.status(500).json({message: 'user/name is undefined'});
		}

		var user = new User(req.body);
		user.save(function(err, data, numberAffected) {
			if(!err) {
				return res.status(201).json(data);
			}	
			else {
				return res.status(500).json(err);
			}
		});
	}
};

router.get(router.apiPath, api.users);
router.post(router.apiPath, api.addUser);

module.exports = router;