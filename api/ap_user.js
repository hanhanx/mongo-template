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
	user: function(req, res) {
		var id = req.params.id;
		User.findOne({'_id': id}, function(err, user) {
			if(err) {
				res.status(404).json(err);
			}
			else {
				res.status(200).json(user);
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
				console.log(err);
				return res.status(500).json(err);
			}
		});
	},
	editUser: function(req, res) {
		res.sendStatus(404);
	},
	deleteUser: function(req, res) {
		var id = req.params.id;
		User.findById(id, function(err, user) {
			return user.remove(function(err) {
				if(!err) {
					return res.status(204).send();
				}
				else {
					return res.status(500).json(err);
				}
			});
		});
	}
};

router.get(router.apiPath, api.users);
router.post(router.apiPath, api.addUser);
router.route(router.apiPath + '/:id')
	.get(api.user)
	.put(api.editUser)
	.delete(api.deleteUser);

module.exports = router;