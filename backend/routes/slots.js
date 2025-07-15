const express = require('express');
const router  = express.Router();
const Slot    = require('../models/Slot');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET : ดูช่องจอดทั้งหมด (ทุกผู้ใช้ต้อง login)
router.get('/', verifyToken, async (req, res) => {
  const slots = await Slot.find().sort({ slotNumber: 1 });
  res.json(slots);
});

// POST : เพิ่มช่องจอด (admin เท่านั้น – ใช้ครั้งเดียวตอน seed)
router.post('/', requireAdmin, async (req, res) => {
  const { slotNumber } = req.body;
  if (await Slot.findOne({ slotNumber }))
    return res.status(400).json({ error: 'slot นี้มีอยู่แล้ว' });

  const newSlot = await Slot.create({ slotNumber });
  res.status(201).json(newSlot);
});

// PUT : reserve / park / leave (ทุกผู้ใช้ต้อง login)
router.put('/:slotNumber', verifyToken, async (req, res) => {
  const { slotNumber } = req.params;
  const { action, username } = req.body;
  const slot = await Slot.findOne({ slotNumber });

  if (!slot) return res.status(404).json({ error: 'ไม่พบ slot นี้' });

  const now = new Date();

  if (action === 'reserve') {
    slot.isBooked  = true;
    slot.isOccupied = false;
    slot.bookedAt  = now;
    slot.bookedBy  = username;
    slot.parkedAt  = slot.parkedBy = slot.leftAt = null;
  }

  if (action === 'park') {
    if (!slot.isBooked) return res.status(400).json({ error: 'ช่องยังไม่ได้จอง' });
    if ((now - slot.bookedAt) > 15*60*1000)
      return res.status(400).json({ error: 'หมดเวลาจอง 15 นาที' });

    slot.isOccupied = true;
    slot.parkedAt   = now;
    slot.parkedBy   = username || slot.bookedBy;
  }

  if (action === 'leave') {
    if (!slot.parkedAt) return res.status(400).json({ error: 'ไม่มีเวลาที่จอด' });

    const diffSec = Math.floor((now - slot.parkedAt) / 1000);
    const hours   = Math.ceil(diffSec / 3600);   // ปัดขึ้น
    const fee     = hours * 20;                  // ชั่วโมงละ 20 บาท

    slot.leftAt     = now;
    slot.isOccupied = false;
    slot.isBooked   = false;
    slot.bookedAt = slot.parkedAt = slot.bookedBy = slot.parkedBy = null;

    await slot.save();
    return res.json({ message: `ค่าจอด ${fee} บาท (เวลา ${hours} ชม.)`, slot });
  }

  await slot.save();
  res.json(slot);
});

// POST : รีเซตทั้งหมด (admin เท่านั้น)
router.post('/reset', requireAdmin, async (req, res) => {
  await Slot.updateMany({}, {
    isBooked:false,isOccupied:false,
    bookedAt:null,parkedAt:null,leftAt:null,
    bookedBy:null,parkedBy:null
  });
  res.json({ message:'รีเซตเรียบร้อย ✅' });
});

module.exports = router;
