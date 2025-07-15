const express = require('express');
const jwt     = require('jsonwebtoken');
const router  = express.Router();

const SECRET  = process.env.JWT_SECRET || 'smart-parking-secret';

// user Hard‑code
const USERS = [
  { username: 'admin', password: '1234', role: 'admin' },
  { username: 'user1', password: '1234', role: 'user' },
  { username: 'user2', password: '1234', role: 'user' },
  { username: 'user3', password: '1234', role: 'user' }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) { return res.status(401).json({ error: 'invalid credentials' }); }

  // ออก token 2 ชั่วโมง
  const token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET,
    { expiresIn: '2h' }
  );

  res.json({ token, username: user.username, role: user.role });
});

module.exports = router;
