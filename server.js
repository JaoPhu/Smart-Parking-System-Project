const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const slotsRoute = require('./backend/routes/slots'); 
const authRoutes = require('./backend/routes/auth');

// โหลดไฟล์ .env
dotenv.config();

// สร้างแอป Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // สำคัญ! เพื่อให้ Express อ่าน req.body ได้

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB connected');

    // เริ่มต้น server หลังเชื่อม MongoDB สำเร็จ
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// เส้นทาง API
app.use('/api/slots', slotsRoute);
app.use('/api/auth', authRoutes);
