const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'smart-parking-secret';

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.split(' ')[1];          // "Bearer xxx"
  if (!token) return res.status(401).json({ error: 'token missing' });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'admin only' });
    }
    next();
  });
}

module.exports = { verifyToken, requireAdmin };
