const express = require('express');
const router = express.Router();
const {authenticateJWT} = require('../auth');
const User = require('../../models/User');
const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');

// endpoint to create a new chat room in the conversation collection

router.post('/conversation', authenticateJWT, async (req, res) => {
  try {
    const {senderId, recipientIds, name} = req.body; // recipientIds should be an array

    // create a new conversation with all participants
    const newConversation = new Conversation({
      participants: [senderId, ...recipientIds],
      name: name,
    });

    req.io.emit('new conversation', {conversationId: newConversation._id});
    await newConversation.save();
    res.status(200).json({conversation: newConversation});
  } catch (error) {
    console.log('Error creating conversation: ', error);
    res.status(500).json({message: 'Failed to create conversation!'});
  }
});

// endpoint for user to leave a particular conversation

router.delete(
  '/conversations/:conversationId/users/:userId',
  authenticateJWT,
  async (req, res) => {
    const {conversationId, userId} = req.params;

    try {
      const conversation = await Conversation.findById(conversationId);
      console.log('Conversation:', conversation); // Log the conversation details

      if (!conversation) {
        return res.status(404).json({message: 'Conversation not found'});
      }

      const userIndex = conversation.participants.findIndex(
        id => id.toString() === userId,
      );
      console.log('User Index:', userIndex); // Log the user index

      if (userIndex === -1) {
        return res
          .status(404)
          .json({message: 'User not found in this conversation'});
      }

      conversation.participants.splice(userIndex, 1);

      if (conversation.participants.length === 0) {
        // If no participants left, delete the conversation
        await Conversation.findByIdAndDelete(conversationId);
        res.json({message: 'Conversation deleted successfully'});
      } else {
        // Otherwise, save the updated conversation
        await conversation.save();

        // Emit a real-time event to notify other users that this user has left the conversation
        req.io.to(conversationId).emit('userLeft', userId);
        res.json({message: 'User left the conversation successfully'});
      }
    } catch (error) {
      console.error('Error:', error); // Log the error details
      res.status(500).json({message: 'Error leaving the conversation', error});
    }
  },
);

// endpoint to get all the conversations of a particular user

router.get('/users/:userId', authenticateJWT, async (req, res) => {
  try {
    const {userId} = req.params;

    // fetch the conversations of the user
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email image')
      .populate('messages', 'text timestamp readBy')
      .populate('lastMessage')
      .lean();

    // Sort the conversations by the timestamp of the lastMessage
    conversations.sort((a, b) => {
      if (
        a.lastMessage &&
        a.lastMessage.timestamp &&
        b.lastMessage &&
        b.lastMessage.timestamp
      ) {
        return (
          new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
        );
      } else {
        return 0;
      }
    });

    res.json(conversations);
  } catch (error) {
    console.log('Error getting conversations: ', error);
    res.status(500).json({message: 'Failed to get conversations!'});
  }
});

// endpoint to get the recipients' details to design the chat room header

router.get(
  '/conversation/:conversationId',
  authenticateJWT,
  async (req, res) => {
    try {
      const {conversationId} = req.params;

      // fetch the conversation data from the conversation ID
      const conversation = await Conversation.findById(conversationId).populate(
        'participants',
      );

      // Include the name of the conversation in the response
      res.json({
        participants: conversation.participants,
        name: conversation.name,
      });
    } catch (error) {
      console.log('Error getting conversation details: ', error);
      res.status(500).json({message: 'Failed to get conversation details!'});
    }
  },
);

// S3 Bucket needed for this feature

// // Configure multer for handling file uploads //! not used in front end yet

// const path = require("path");
// const multer = require("multer");
// const mime = require("mime-types");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public");
//   },
//   filename: function (req, file, cb) {
//     const name = req.params.id;
//     cb(null, name + (path.extname(file.originalname) || ".png"));
//   },
// });

// const upload = multer({ storage });

// function getRandomString(length = 20) {
//   const randomChars =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let result = "";
//   for (let i = 0; i < length; i++)
//     result += randomChars.charAt(
//       Math.floor(Math.random() * randomChars.length)
//     );
//   return result;
// }

// endpoint to fetch the messages of the conversation

router.get('/messages/:conversationId', authenticateJWT, async (req, res) => {
  try {
    const {userId} = req.user; // Assuming the user ID is stored in req.user

    // fetch the conversation and populate the messages
    const conversation = await Conversation.findById(
      req.params.conversationId,
    ).populate({
      path: 'messages',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'name _id', // Only include the name and _id fields
      },
    });

    if (!conversation) {
      return res.status(404).json({message: 'Conversation not found'});
    }

    // Mark all unread messages as read by the current user
    for (let message of conversation.messages) {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        await message.save();
      }
    }

    res.json(conversation.messages);
  } catch (error) {
    console.log('Error getting messages: ', error);
    res
      .status(500)
      .json({message: `Failed to get messages! Error: ${error.message}`});
  }
});

// Endpoint to delete a particular message from a conversation //! not used in front end yet

router.delete(
  '/conversations/:conversationId/messages/:messageId',
  authenticateJWT,
  async (req, res) => {
    const {conversationId, messageId} = req.params;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({message: 'Conversation not found'});
      }

      const messageIndex = conversation.messages.findIndex(
        id => id.toString() === messageId,
      );
      if (messageIndex === -1) {
        return res
          .status(404)
          .json({message: 'Message not found in this conversation'});
      }

      conversation.messages.splice(messageIndex, 1);
      await conversation.save();

      const message = await Message.findById(messageId);
      if (message) {
        await message.remove();
      }

      res.json({message: 'Message deleted successfully'});
    } catch (error) {
      res.status(500).json({message: 'Error deleting message', error});
    }
  },
);

// endpoint to delete all messages in conversation

router.delete(
  '/messages/:conversationId',
  authenticateJWT,
  async (req, res) => {
    try {
      const {conversationId} = req.params;
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({message: 'Conversation not found'});
      }

      await Message.deleteMany({conversationId: conversationId});
      res.status(200).json({message: 'Messages deleted successfully!'});
    } catch (error) {
      console.log('Error deleting messages: ', error);
      res.status(500).json({message: 'Failed to delete messages!'});
    }
  },
);

module.exports = router;
