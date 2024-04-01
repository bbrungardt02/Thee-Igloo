const express = require('express');
const router = express.Router();
const {authenticateJWT} = require('../auth');
const User = require('../../models/User');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');

require('dotenv').config();
const apn = require('apn');

// APNs settings
let apnOptions = {
  token: {
    key: process.env.APN_KEY_PATH,
    keyId: process.env.APN_KEY_ID,
    teamId: process.env.APN_TEAM_ID,
  },
  production: true,
};

let apnProvider = new apn.Provider(apnOptions);

// endpoint to send a request to a user

router.post('/request', authenticateJWT, async (req, res) => {
  const {currentUserId, selectedUserId} = req.body;

  try {
    // get the recipient's and sender's data
    const recipient = await User.findById(selectedUserId);
    const sender = await User.findById(currentUserId);

    // check if a friend request from the current user already exists
    if (recipient.friendRequests.includes(currentUserId)) {
      return res.status(400).json({message: 'Friend request already sent!'});
    }

    // update the recipient's friendRequests array
    await User.findByIdAndUpdate(
      selectedUserId,
      {
        $push: {
          friendRequests: currentUserId,
        },
      },
      {new: true},
    );

    // Emit a 'friendRequest' event to the recipient's socket
    req.io.to(selectedUserId).emit('friendRequest', {from: currentUserId});

    // Create a new notification
    let note = new apn.Notification();
    note.topic = 'org.reactjs.native.example.TheeIgloo';
    note.alert = {
      title: `${sender.name}`,
      body: 'Has sent a friend request!',
    };
    note.sound = 'default';

    // Send a notification to each device token of the recipient
    for (let deviceToken of recipient.deviceTokens) {
      apnProvider.send(note, deviceToken).then(result => {
        if (result.failed.length > 0) {
          console.log(result.failed);
        }
      });
    }

    // update the sender's sentFriendRequests array
    await User.findByIdAndUpdate(
      currentUserId,
      {
        $push: {
          sentFriendRequests: selectedUserId,
        },
      },
      {new: true},
    );

    res.status(200).json({message: 'Request sent successfully!'});
  } catch (err) {
    console.log('Error sending request: ', err);
    res.status(500).json({message: 'Failed to send request!'});
  }
});

// endpoint to show all the friend requests received of a particular user

router.get('/requests/:userId', authenticateJWT, async (req, res) => {
  try {
    const {userId} = req.params;

    // fetch the user document based on the UserId
    const user = await User.findById(userId)
      .populate('friendRequests', 'name email image')
      .lean();

    const friendRequests = user.friendRequests;
    res.json(friendRequests);
  } catch (error) {
    console.log('Error getting friend requests: ', error);
    res.status(500).json({message: 'Failed to get friend requests!'});
  }
});

// endpoint to show all the friend requests sent of a particular user //! not used in front end yet

router.get(
  '/sent-friend-requests/:userId',
  authenticateJWT,
  async (req, res) => {
    try {
      const {userId} = req.params;

      // fetch the user document based on the UserId
      const user = await User.findById(userId)
        .populate('sentFriendRequests', 'name email image')
        .lean();

      const sentFriendRequests = user.sentFriendRequests;
      res.json(sentFriendRequests);
    } catch (error) {
      console.log('Error getting sent friend requests: ', error);
      res.status(500).json({message: 'Failed to get sent friend requests!'});
    }
  },
);

// endpoint to accept a friend request

router.post('/accept', authenticateJWT, async (req, res) => {
  try {
    const {senderId, recipientId} = req.body;

    // retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    // update the friends list for both users
    sender.friends.push(recipientId);
    recipient.friends.push(senderId);

    recipient.friendRequests = recipient.friendRequests.filter(
      request => request.toString() !== senderId.toString(),
    );

    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      request => request.toString() !== recipientId.toString(),
    );

    await sender.save();
    await recipient.save();

    // Emit a 'friendRequestAccepted' event to the sender's socket
    req.io.to(senderId).emit('friendRequestAccepted', {from: recipientId});

    // Create a new notification
    let note = new apn.Notification();
    note.topic = 'org.reactjs.native.example.TheeIgloo';
    note.alert = {
      title: `${recipient.name}`,
      body: 'Accepted your friend request!',
    };
    note.sound = 'default';

    // Send a notification to each device token of the sender
    for (let deviceToken of sender.deviceTokens) {
      apnProvider.send(note, deviceToken).then(result => {
        if (result.failed.length > 0) {
          console.log(result.failed);
        }
      });
    }

    res.status(200).json({message: 'Friend request accepted successfully!'});
  } catch (error) {
    console.log('Error accepting friend request: ', error);
    res.status(500).json({message: 'Failed to accept request!'});
  }
});

// endpoint to reject a friend request

router.post('/reject', authenticateJWT, async (req, res) => {
  try {
    const {senderId, recipientId} = req.body;

    // retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    // remove the sender's ID from the recipient's friendRequests array
    recipient.friendRequests = recipient.friendRequests.filter(
      request => request.toString() !== senderId.toString(),
    );

    // remove the recipient's ID from the sender's sentFriendRequests array
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      request => request.toString() !== recipientId.toString(),
    );

    await sender.save();
    await recipient.save();

    // Emit a 'friendRequestRejected' event to the sender's socket
    req.io.to(senderId).emit('friendRequestRejected', {from: recipientId});

    // Create a new notification
    let note = new apn.Notification();
    note.topic = 'org.reactjs.native.example.TheeIgloo';
    note.alert = {
      title: `${recipient.name}`,
      body: 'Rejected your friend request 😱',
    };
    note.sound = 'default';

    // Send a notification to each device token of the sender
    for (let deviceToken of sender.deviceTokens) {
      apnProvider.send(note, deviceToken).then(result => {
        if (result.failed.length > 0) {
          console.log(result.failed);
        }
      });
    }

    res.status(200).json({message: 'Friend request rejected successfully!'});
  } catch (error) {
    console.log('Error rejecting friend request: ', error);
    res.status(500).json({message: 'Failed to reject request!'});
  }
});

// endpoint to access all the friends of the logged in user

router.get('/:userId', authenticateJWT, async (req, res) => {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId)
      .populate('friends', 'name email image')
      .lean();

    const friends = user.friends;
    res.json(friends);
  } catch (error) {
    console.log('Error getting friends: ', error);
    res.status(500).json({message: 'Failed to get friends!'});
  }
});

// endpoint to remove a friend

router.delete('/:userId/:friendId', authenticateJWT, async (req, res) => {
  const {userId, friendId} = req.params;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({message: 'User or friend not found!'});
    }

    // Find all conversations where both users are participants
    const conversations = await Conversation.find({
      participants: {$all: [userId, friendId]},
    });

    for (let conversation of conversations) {
      // Find all messages in the conversation sent by the user or the friend
      const messagesToDelete = await Message.find({
        _id: {$in: conversation.messages},
        userId: {$in: [userId, friendId]},
      });

      // Delete these messages
      await Message.deleteMany({
        _id: {$in: messagesToDelete.map(message => message._id)},
      });

      // Update the messages array of the conversation to remove the IDs of the deleted messages
      conversation.messages = conversation.messages.filter(
        messageId =>
          !messagesToDelete.find(message => message._id.equals(messageId)),
      );

      // Update the participants array of the conversation to remove the IDs of the user and the friend
      conversation.participants = conversation.participants.filter(
        participantId => ![userId, friendId].includes(participantId.toString()),
      );

      await Conversation.findByIdAndUpdate(conversation._id, {
        messages: conversation.messages,
        participants: conversation.participants,
      });
    }

    // Remove friend from user's friends list
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await User.findByIdAndUpdate(userId, {friends: user.friends});

    // Remove user from friend's friends list
    friend.friends = friend.friends.filter(id => id.toString() !== userId);
    await User.findByIdAndUpdate(friendId, {friends: friend.friends});

    res.status(200).json({message: 'Friend removed successfully!'});
  } catch (error) {
    console.log('Error removing friend: ', error);
    res.status(500).json({message: 'Failed to remove friend!'});
  }
});

module.exports = router;
