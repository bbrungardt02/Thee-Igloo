const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../../models/User');
const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');
const {authenticateJWT, createToken} = require('../auth');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

router.post('/token', (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = createToken(
      user.userId,
      process.env.ACCESS_TOKEN_SECRET,
      '45m',
    );

    res.json({accessToken});
  });
});

// endpoint for registering a new user

const registerSchema = Joi.object({
  name: Joi.string().max(255).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().required(),
  image: Joi.string().required(),
});

router.post('/register', async (req, res) => {
  const {name, email, password, image} = req.body;

  // Validate the request data
  const {error} = registerSchema.validate({name, email, password, image});
  if (error) {
    return res
      .status(400)
      .json({message: 'Invalid data', error: error.details});
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // create new User object
  const newUser = new User({name, email, password: hashedPassword, image});

  // save user to database
  try {
    await newUser.save();
    const accessToken = createToken(
      newUser._id,
      process.env.ACCESS_TOKEN_SECRET,
      '15m',
    );
    const refreshToken = createToken(
      newUser._id,
      process.env.REFRESH_TOKEN_SECRET,
      '7d',
    );
    res.status(200).json({
      message: 'Successfully registered user',
      accessToken,
      refreshToken,
      userId: newUser._id,
    });
  } catch (err) {
    console.log('Error registering user: ', err);
    res
      .status(500)
      .json({message: `Failed to register the user: ${err.message}`});
  }
});

// endpoint for logging in a user
router.post('/login', async (req, res) => {
  const {email, password, deviceToken} = req.body;

  // check if the email and password are provided
  if (!email || !password) {
    return res.status(400).json({message: 'Email and password are required!'});
  }
  // Convert the email to lowercase. This is done to ensure that the email is case-insensitive
  const lowerCaseEmail = email.toLowerCase();

  // check if the user exists in the database
  User.findOne({email: {$regex: new RegExp('^' + lowerCaseEmail + '$', 'i')}})
    .then(async user => {
      if (!user) {
        // user not found
        return res.status(404).json({message: 'User not found!'});
      }

      // compare the provided password with the password in the database
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({message: 'Incorrect password!'});
      }

      // Update the device token in the database
      if (deviceToken) {
        user.deviceTokens.addToSet(deviceToken);
        await user.save();
      }

      const accessToken = createToken(
        user._id,
        process.env.ACCESS_TOKEN_SECRET,
        '15m',
      );
      const refreshToken = createToken(
        user._id,
        process.env.REFRESH_TOKEN_SECRET,
        '7d',
      );
      res.status(200).json({accessToken, refreshToken, userId: user._id});
    })
    .catch(err => {
      console.log('Error logging in user: ', err);
      res.status(500).json({message: 'Failed to login the user!'});
    });
});

// Endpoint to log out

router.post('/logout', authenticateJWT, (req, res) => {
  const userId = req.user.userId;
  const {deviceToken} = req.body;

  // Remove the device token from the user's deviceTokens array in the database
  if (deviceToken) {
    User.updateOne({_id: userId}, {$pull: {deviceTokens: deviceToken}})
      .then(() => {
        res.sendStatus(204);
      })
      .catch(err => {
        console.log('Error logging out user: ', err);
        res.status(500).json({message: 'Failed to log out the user!'});
      });
  } else {
    res.sendStatus(204);
  }
});

router.get('/me', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({message: 'Error retrieving user', error});
  }
});

// Endpoint to update user details

const schema = Joi.object({
  name: Joi.string().max(255),
  email: Joi.string().email().max(255),
  image: Joi.string(),
});

router.put('/update/:userId', authenticateJWT, async (req, res) => {
  const userId = req.params.userId;
  const {name, email, image} = req.body;

  // Validate the request data
  const {error} = schema.validate({name, email, image});
  if (error) {
    return res
      .status(400)
      .json({message: 'Invalid data', error: error.details});
  }

  // Create an update object with only the provided fields
  const update = {};
  if (name) update.name = name;
  if (email) update.email = email;
  if (image) update.image = image;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {$set: update},
      {new: true, runValidators: true},
    );

    if (!updatedUser) {
      return res.status(404).json({message: 'User not found'});
    }

    res.json({message: 'User updated successfully', user: updatedUser});
  } catch (error) {
    res.status(500).json({message: 'Error updating user', error});
  }
});

// Endpoint to delete your account

router.delete('/delete/:userId', authenticateJWT, async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    await Message.deleteMany({userId: userId});

    await Conversation.updateMany(
      {},
      {$pull: {participants: userId, messages: {$in: user.messages}}},
    );

    await User.updateMany(
      {},
      {
        $pull: {
          friends: userId,
          sentFriendRequests: userId,
          friendRequests: userId,
        },
      },
    );

    await user.deleteOne();

    res.json({message: 'User deleted successfully'});
  } catch (error) {
    res.status(500).json({message: 'Error deleting user', error});
  }
});

// endpoint to access all the users except current friends

router.get('/:userId', authenticateJWT, async (req, res) => {
  const loggedInUserId = req.params.userId;

  try {
    // Fetch the logged-in user's document to get their friends array
    const loggedInUser = await User.findById(loggedInUserId);
    const friends = loggedInUser.friends.map(friend => friend.toString());

    // Find all users who are not friends with the logged-in user
    const users = await User.find({
      _id: {$nin: friends, $ne: loggedInUserId},
    });

    // Include the logged-in user in the response
    users.push(loggedInUser);

    res.status(200).json(users);
  } catch (err) {
    console.log('Error getting users: ', err);
    res.status(500).json({message: 'Failed to get users!'});
  }
});

// // endpoint to access all the users for testing purposes
// router.get("/users", async (req, res) => {
//   User.find()
//     .select("name") // find all the users and select only the 'name' field
//     .then((users) => {
//       res.json(users);
//     })
//     .catch((err) => {
//       console.log("Error getting users: ", err);
//       res.status(500).json({ message: "Failed to get users!" });
//     });
// });

module.exports = router;
