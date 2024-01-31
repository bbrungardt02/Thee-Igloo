// Socket.io code for real-time chat

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const users = {};

module.exports = function (io) {
  io.on('connection', socket => {
    console.log('a user connected');

    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
      if (!users[userId]) {
        users[userId] = {id: userId, count: 1};
      } else {
        users[userId].count++;
      }
      socket.emit('userOnline', userId);
    }

    socket.on('joinConversation', conversationId => {
      if (conversationId) {
        // Check if the socket is already in the room
        const rooms = Object.keys(socket.rooms);
        if (rooms.includes(conversationId)) {
          console.log(
            `Socket is already in conversation with ID: ${conversationId}`,
          );
          return;
        }

        socket.join(conversationId, error => {
          if (error) {
            console.error(
              `Failed to join conversation with ID: ${conversationId}. Error: ${error}`,
            );
          } else {
            console.log(
              `Socket joined conversation with ID: ${conversationId}`,
            );
          }
        });
      } else {
        console.error('No conversationId provided for joinConversation event');
      }
    });

    socket.on('message', async message => {
      try {
        const {conversationId, userId, text} = message;

        let images = [];
        let videos = [];
        let audios = [];

        const newMessage = new Message({
          conversationId: conversationId,
          userId: userId,
          text: text,
          timestamp: new Date(),
          images,
          videos,
          audios,
          readBy: [userId],
        });

        await newMessage.save();

        await Conversation.findByIdAndUpdate(conversationId, {
          $push: {messages: newMessage._id},
          lastMessage: newMessage._id,
        });

        await newMessage.populate({
          path: 'userId',
          model: 'User',
          select: 'name _id',
        });

        io.to(conversationId).emit('message', newMessage);
      } catch (error) {
        console.log('Error sending message: ', error);
      }
    });

    socket.on('createChat', data => {
      // Emit the newChat event to the conversation room
      io.to(data.conversationId).emit('newChat', data);
    });

    socket.on('isRecipientOnline', recipientId => {
      io.to(userId).emit('isRecipientOnline', !!users[recipientId]);
    });

    socket.on('offline', userId => {
      if (users[userId]) {
        users[userId].count--;
        if (users[userId].count === 0) {
          delete users[userId];
        }
      }
      io.emit('userOffline', userId);
    });

    socket.on('online', userId => {
      if (!users[userId]) {
        users[userId] = {id: userId, count: 1};
      } else {
        users[userId].count++;
      }
      io.emit('userOnline', userId);
    });

    // socket.on('userTyping', status => {
    //   socket.broadcast.to(conversationId).emit('userTyping', status);
    // });

    socket.on('disconnect', () => {
      console.log('user disconnected');
      if (users[userId]) {
        users[userId].count--;
        if (users[userId].count === 0) {
          delete users[userId];
        }
      }
    });
  });
};
