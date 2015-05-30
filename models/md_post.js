'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var fields = {
	title: { type: String },
	excerpt: { type: String },
	content: { type: String },
	active: { type: Boolean },
	created: { type: Date , default: Date.now },
	user: {
		type: ObjectId,
		ref: 'User'
	},
	comments: {
		type: ObjectId,
		ref: 'Comment'
	}
};

var postSchema = new Schema(fields);

module.exports = mongoose.model('Post', postSchema);