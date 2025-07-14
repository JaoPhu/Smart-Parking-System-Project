// backend/middleware/auth.js

module.exports = {
    requireLogin: (req, res, next) => {
        const role = req.headers['x-role'];
        if (!role) {
            return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน (ไม่มี role)' });
        }
        req.role = role; // เก็บ role ไว้ใช้ใน route
        next();
    },

    requireAdmin: (req, res, next) => {
        const role = req.headers['x-role'];
        if (role !== 'admin') {
            return res.status(403).json({ error: 'จำกัดเฉพาะผู้ดูแลระบบเท่านั้น (admin)' });
        }
        next();
    }
};