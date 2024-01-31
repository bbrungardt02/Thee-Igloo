const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// function to create a token for a user
const createToken = (userId, secret, expiresIn) => {
  // set the token payload
  const payload = {
    userId: userId,
  };

  // generate the token with a secret key and expiration time
  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  });
  return token;
};

module.exports = {authenticateJWT, createToken};
