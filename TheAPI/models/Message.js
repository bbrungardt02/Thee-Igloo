const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: mongoose.Types.ObjectId,
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  text: String,
  images: [String], // Array of image URLs or paths
  videos: [String], // Array of video URLs or paths
  audios: [String], // Array of audio URLs or paths
  timestamp: {type: Date, default: Date.now},
  readBy: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
