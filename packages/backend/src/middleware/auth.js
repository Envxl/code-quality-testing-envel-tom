const jwt = require('jsonwebtoken');

const auth = (request, res, next) => {
  const token = request.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
        token.split(' ', 2)[1],
        'your-super-secret-key-that-should-not-be-hardcoded'
    );

    request.user = decoded;
    next();
  } catch(error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Failed to authenticate token' });
  }
};

module.exports = auth;
