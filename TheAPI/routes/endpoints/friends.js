const express = require('express');
const router = express.Router();
const {authenticateJWT} = require('../auth');
const User = require('../../models/User');

// endpoint to send a request to a user

router.post('/request', authenticateJWT, async (req, res) => {
  const {currentUserId, selectedUserId} = req.body;

  try {
    // get the recipient's data
    const recipient = await User.findById(selectedUserId);

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

    res.status(200).json({message: 'Friend request accepted successfully!'});
  } catch (error) {
    console.log('Error accepting friend request: ', error);
    res.status(500).json({message: 'Failed to accept request!'});
  }
});

// endpoint to reject a friend request //! not used in front end yet

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

module.exports = router;
