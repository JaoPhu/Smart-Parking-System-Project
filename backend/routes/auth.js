const express = require('express');
const router = express.Router();

const users = [
  { username: 'admin', password: '1234', role: 'admin' },
  { username: 'user1', password: '1111', role: 'user' }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

  res.json({ message: 'เข้าสู่ระบบสำเร็จ', role: user.role, username: user.username });
});

module.exports = router;
