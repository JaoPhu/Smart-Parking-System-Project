const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./backend/routes/auth');
const slotsRoutes = require('./backend/routes/slots');
const historyRoutes = require('./backend/routes/history');

// โหลด .env
dotenv.config();

// สร้าง Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');

  // เริ่ม server หลังเชื่อม MongoDB สำเร็จ
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// ใช้ routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/history', historyRoutes);

// Cron Job: ล้างการจองถ้าเกิน 15 นาที (ทุก 1 นาที)
const Slot = require('./backend/models/Slot');
const FIFTEEN_MIN = 15 * 60 * 1000;

setInterval(async () => {
  const expiredTime = new Date(Date.now() - FIFTEEN_MIN);
  const result = await Slot.updateMany(
    {
      isBooked: true,
      isOccupied: false,
      bookedAt: { $lt: expiredTime }
    },
    {
      isBooked: false,
      bookedAt: null,
      bookedBy: null
    }
  );
  if (result.modifiedCount > 0) {
    console.log(`⏰ ล้างการจองหมดอายุ: ${result.modifiedCount} ช่อง`);
  }
}, 60 * 1000);
