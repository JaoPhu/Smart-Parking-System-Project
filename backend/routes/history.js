const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const { verifyToken } = require('../middleware/auth');

// ดูประวัติของตัวเอง → /api/history
router.get('/', verifyToken, async (req, res) => {
    try {
        const username = req.user.username;
        const history = await Slot.find({
            $or: [{ bookedBy: username }, { parkedBy: username }],
        }).sort({ leftAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ไม่สามารถดึงประวัติได้' });
    }
});

// ดูประวัติของคนอื่น หรือทั้งหมด (เฉพาะ admin เท่านั้น) → /api/history/:user
router.get('/:user', verifyToken, async (req, res) => {
    const { user } = req.params;

    let filter;
    if (user === 'admin' && req.user.role === 'admin') {
        filter = {}; // admin ดูทั้งหมด
    } else if (req.user.role !== 'admin' && req.user.username !== user) {
        return res.status(403).json({ error: 'forbidden' });
    } else {
        filter = { $or: [{ bookedBy: user }, { parkedBy: user }] };
    }

    try {
        const history = await Slot.find(filter).sort({ leftAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ไม่สามารถดึงประวัติได้' });
    }
});

module.exports = router;