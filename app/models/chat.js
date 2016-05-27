var mongoose = require('mongoose');

var chatSchema = mongoose.Schema({
	created: String,
	content: String,
	name: String,
	room: String
});

var Chat = mongoose.model('Chat', chatSchema)