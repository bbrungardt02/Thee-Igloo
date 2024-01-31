const express = require('express');
const router = express.Router();

router.use('/users', require('./endpoints/users'));
router.use('/friends', require('./endpoints/friends'));
router.use('/chats', require('./endpoints/chats'));

module.exports = router;
