const path = require('path');
const multer = require('multer');
const mime = require('mime-types');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public');
  },
  filename: async function (req, file, cb) {
    const name = req.params.id;
    cb(null, name + (path.extname(file.originalname) || '.png'));
  },
});

// 1GB in bytes
const MAX_SIZE = 1 * 1024 * 1024 * 1024;

exports.upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
  },
});

exports.getImageName = (file, name) =>
  (name || getRandomString()) + '.' + mime.extension(file.mimetype);

function getRandomString(length = 20) {
  const randomChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++)
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length),
    );
  return result;
}
