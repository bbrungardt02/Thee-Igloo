const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const fs = require('fs');
const {createReadStream} = require('fs');
const path = require('path');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const upload = async (file, folder, name) => {
  const filePath = __dirname + '/../public/' + file.filename;

  if (file.size < 1 * 1024 * 1024 * 1024) {
    const params = {
      Bucket: process.env.BUCKET,
      Body: createReadStream(filePath),
      Key: folder + '/' + name || path.basename(filePath),
      ContentType: file.mimetype,
    };

    try {
      const data = await s3Client.send(new PutObjectCommand(params));
      fs.unlink(filePath, () => {});

      // Construct the URL of the uploaded file
      const url = `https://${process.env.BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      // Return the URL along with the rest of the data
      return {...data, Location: url};
    } catch (err) {
      fs.unlink(filePath, () => {});
      throw err;
    }
  } else {
    fs.unlink(filePath, () => {});
    throw {status: 400, msg: 'File too big'};
  }
};

const remove = async filePath => {
  const params = {
    Bucket: process.env.BUCKET,
    Key: filePath,
  };

  try {
    const data = await s3Client.send(new DeleteObjectCommand(params));
    return data;
  } catch (err) {
    throw err;
  }
};

module.exports = {upload, remove};
