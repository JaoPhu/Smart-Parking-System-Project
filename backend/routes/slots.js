const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const { requireAdmin } = require('../middleware/auth');

// GET: ดูช่องจอดทั้งหมด
router.get('/', async (req, res) => {
    try {
        const slots = await Slot.find().sort({ slotNumber: 1 });
        res.json(slots);
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
    }
});

// POST: เพิ่มช่องจอดใหม่
router.post('/', async (req, res) => {
    try {
        const { slotNumber } = req.body;
        const existing = await Slot.findOne({ slotNumber });
        if (existing) return res.status(400).json({ error: 'slot นี้มีอยู่แล้ว' });
        const newSlot = new Slot({ slotNumber });
        await newSlot.save();
        res.status(201).json(newSlot);
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถเพิ่มช่องจอดได้' });
    }
});

// PUT: จอง / เข้าจอด / ออกจากช่อง
router.put('/:slotNumber', async (req, res) => {
    try {
        const { slotNumber } = req.params;
        const { action } = req.body;
        const slot = await Slot.findOne({ slotNumber: parseInt(slotNumber) });
        if (!slot) return res.status(404).json({ error: 'ไม่พบ slot นี้' });

        const now = new Date();

        if (action === 'reserve') {
            slot.isBooked = true;
            slot.isOccupied = false;
            slot.bookedAt = now;
            slot.bookedBy = req.body.username || "unknown";
            slot.parkedAt = null;
            slot.leftAt = null;
            await slot.save();
            return res.json(slot);
        }

        if (action === 'park') {
            if (!slot.isBooked) {
                return res.status(400).json({ error: 'ช่องนี้ยังไม่ได้จอง' });
            }

            const diffMin = (now - slot.bookedAt) / (1000 * 60);
            if (diffMin > 15) {
                return res.status(400).json({ error: 'หมดเวลาจอง 15 นาที' });
            }

            slot.isOccupied = true;
            slot.parkedAt = now;
            slot.parkedBy = req.body.username || slot.bookedBy || "unknown";
            await slot.save();
            return res.json(slot);
        }

        if (action === 'leave') {
            if (!slot.parkedAt) {
                return res.status(400).json({ error: 'ไม่สามารถคิดค่าจอดได้: ไม่มีเวลาเข้า (parkedAt)' });
            }

            const diffSeconds = Math.floor((now - slot.parkedAt) / 1000);
            const fee = diffSeconds; // คิดวินาทีละ 1 บาท

            slot.leftAt = now;
            slot.isOccupied = false;
            slot.isBooked = false;

            // ✅ เพิ่มการรีเซตเวลาหลังจอด
            slot.parkedAt = null;
            slot.bookedAt = null;

            await slot.save();

            return res.json({
                message: `รถออกแล้ว ค่าจอด ${fee} บาท (จอด ${diffSeconds} วินาที)`,
                slot
            });
        }


        return res.status(400).json({ error: 'action ไม่ถูกต้อง' });
    } catch (err) {
        console.error('❌ PUT Error:', err);
        res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลได้' });
    }
});

// POST: รีเซตช่องจอดทั้งหมด
router.post('/reset', requireAdmin, async (req, res) => {
    try {
        await Slot.updateMany({}, {
            isBooked: false,
            isOccupied: false,
            bookedAt: null,
            parkedAt: null,
            leftAt: null
        });
        console.log('🧼 [RESET] ล้างข้อมูลช่องจอดทั้งหมดแล้ว');
        res.json({ message: 'รีเซตช่องจอดทั้งหมดเรียบร้อยแล้ว ✅' });
    } catch (err) {
        console.error('❌ Reset Error:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการรีเซตช่องจอด' });
    }
});

module.exports = router;