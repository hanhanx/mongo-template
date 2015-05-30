'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var commentSchema = new Schema({
	text: String,
	created: { type: Date , default: Date.now },
	_userId: {
		type: ObjectId,
		ref: 'User'
	}
});

module.exports = mongoose.model('Comment', commentSchema);