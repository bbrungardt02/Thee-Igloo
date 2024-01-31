const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
  lastMessage: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'},
  timestamp: {type: Date, default: Date.now},
  name: {type: String},
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
