// Socket.io code for real-time chat & remote notifications

require('dotenv').config();
const apn = require('apn');

// APNs settings
let apnOptions = {
  token: {
    key: process.env.APN_KEY_PATH,
    keyId: process.env.APN_KEY_ID,
    teamId: process.env.APN_TEAM_ID,
  },
  production: false,
};

let apnProvider = new apn.Provider(apnOptions);

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const users = {};
let conversationRooms = {};

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

    socket.on('joinConversation', ({conversationId, userId}) => {
      if (conversationId) {
        // Check if the socket is already in the room
        const rooms = Object.keys(socket.rooms);
        if (rooms.includes(conversationId)) {
          console.log(
            `Socket is already in conversation with ID: ${conversationId}`,
          );
          return;
        }

        // Add the user to the conversation room
        if (!conversationRooms[conversationId]) {
          conversationRooms[conversationId] = [];
        }
        if (!conversationRooms[conversationId].includes(userId)) {
          conversationRooms[conversationId].push(userId);
        } else {
          console.log(
            `User ${userId} is already in conversation ${conversationId}`,
          );
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

    socket.on('leaveConversation', ({conversationId, userId}) => {
      if (conversationId) {
        // Remove the user from the conversation room
        const index = conversationRooms[conversationId].indexOf(userId);
        if (index !== -1) {
          conversationRooms[conversationId].splice(index, 1);
        }

        // Log the users who are currently in the conversation room
        console.log(
          `Users in conversation ${conversationId} after user ${userId} left:`,
          conversationRooms[conversationId],
        );

        socket.leave(conversationId, error => {
          if (error) {
            console.error(
              `Failed to leave conversation with ID: ${conversationId}. Error: ${error}`,
            );
          } else {
            console.log(`Socket left conversation with ID: ${conversationId}`);
          }
        });
      } else {
        console.error('No conversationId provided for leaveConversation event');
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
        // Look up the conversation
        let conversation = await Conversation.findById(conversationId).populate(
          'participants',
        );

        // Send a push notification to each user in the conversation
        for (let user of conversation.participants) {
          // Ignore the sender
          if (user._id.toString() === newMessage.userId._id.toString()) {
            continue;
          }

          // Ignore users currently inside the conversation room
          console.log(
            `Users in conversation ${conversationId}:`,
            conversationRooms[conversationId],
          );
          if (conversationRooms[conversationId].includes(user._id.toString())) {
            continue;
          }

          let note = new apn.Notification();
          note.topic = 'org.reactjs.native.example.TheeIgloo';
          note.alert = {
            title: newMessage.userId.name,
            body: text,
          };
          note.sound = 'default';

          // Send a notification to each device token of the user
          for (let deviceToken of user.deviceTokens) {
            apnProvider.send(note, deviceToken).then(result => {
              if (result.failed.length > 0) {
                console.log(result.failed);
              }
            });
          }
        }
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
      // Remove the user from all conversation rooms
      for (let conversationId in conversationRooms) {
        const index = conversationRooms[conversationId].indexOf(userId);
        if (index !== -1) {
          conversationRooms[conversationId].splice(index, 1);
        }
      }
    });
  });
};
