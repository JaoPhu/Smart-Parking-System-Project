# 🚗 ระบบจอดรถอัจฉริยะ (Smart Parking System)

โปรเจกต์นี้เป็นระบบจอดรถอัจฉริยะที่สามารถจอง จอด และคำนวณค่าจอดอัตโนมัติผ่านเว็บแอปพลิเคชัน  
ใช้เซ็นเซอร์ตรวจจับรถ (IR Sensor), ไม้กั้น (Servo Motor), ESP32 และเชื่อมต่อกับ Web Server

## 🔧 เทคโนโลยีที่ใช้

- ESP32 สำหรับควบคุมฮาร์ดแวร์
- Node.js + Express.js สำหรับ Backend API
- MongoDB สำหรับเก็บข้อมูลช่องจอดและประวัติการใช้งาน
- HTML + CSS + JavaScript (Vanilla JS) สำหรับหน้าเว็บ
- TailwindCSS + Bootstrap สำหรับตกแต่ง UI
- Postman สำหรับทดสอบ API
- Git + GitHub สำหรับจัดการซอร์สโค้ด

## 📂 โฟลเดอร์โปรเจกต์

📦 Smart_Parking_System_Project
├── backend/
│ ├── routes/
│ ├── models/
│ └── middleware/
├── frontend/
│ ├── index.html (หน้า login)
│ ├── user.html (หน้า user)
│ ├── dashboard.html (หน้า admin)
│ └── script.js, style.css
├── .env
├── server.js
└── README.md

## 👤 การเข้าสู่ระบบ (Hardcoded)

| บทบาท | Username | Password |
|--------|----------|----------|
| ผู้ดูแลระบบ | admin    | 1234     |
| ผู้ใช้งานทั่วไป | user1, user2, ... | 1234     |

## 📌 ฟีเจอร์

- 🔒 ระบบ Login แยกระหว่าง Admin และ User
- 🅿️ จองช่องจอดรถ (ภายใน 15 นาที)
- 🚘 เข้าจอดและเก็บเวลาจอดอัตโนมัติ
- ⏰ คำนวณค่าจอด (ชั่วโมงละ 20 บาท)
- 🕓 แสดงประวัติการจอดรถแบบรายบุคคล
- 🧼 Admin สามารถ Reset ฐานข้อมูลได้
- 📶 เชื่อมต่อกับ ESP32 สำหรับเซ็นเซอร์ไม้กั้น (อนาคต)

## 🖼️ ตัวอย่างหน้าจอ

> แนบภาพหน้าจอ เช่น user.html / dashboard.html หรือ demo วิดีโอ (ถ้ามี)

## 🚀 วิธีรัน Backend

```bash
npm install
nodemon server.js

🌐 การใช้งาน
เปิด login.html
เลือก login แบบผู้ใช้หรือผู้ดูแล
สำหรับผู้ใช้: ดูสถานะช่องจอด, จอง/จอด/ออก และดูประวัติ
สำหรับผู้ดูแล: เข้าสู่ dashboard และรีเซตระบบ

📬 ผู้พัฒนา
พัฒนาโดย
1.นายธนภรณ์ วิเศษสังข์ 6630300351
2.นายศิรสิทธิ์ สงแพง 6630300807
ภายใต้โปรเจกต์ฝึก Embedded IoT วิชา [Embedded System / Kasetsart University Sriracha Campus]