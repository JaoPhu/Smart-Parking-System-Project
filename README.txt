# 🚗 ระบบจอดรถอัจฉริยะ (Smart Parking System)

โปรเจกต์นี้เป็นระบบจอดรถอัจฉริยะที่สามารถ **จอง ▶ จอด ▶ ออก** และคำนวณค่าจอดอัตโนมัติผ่านเว็บแอป  
**Hardware**: ESP32 + IR Sensors + Servo Motor **Backend**: Node/Express + MongoDB **Frontend**: HTML / Tailwind / Bootstrap

---

## 🔧 STACK & TOOLS
| Layer        | Tech | Note |
|--------------|------|------|
| Hardware     | ESP32, IR Sensor x5, Servo x2 | ตรวจรถ + ไม้กั้น |
| Backend      | **Node.js / Express** | JWT Auth, REST API |
| Database     | **MongoDB** (Atlas) | Collection: `slots` |
| Frontend     | HTML, Vanilla JS, TailwindCSS, Bootstrap | Responsive |
| Utilities    | Postman, Git + GitHub | ทดสอบ API / CI |

---

## 📂 STRUCTURE
Smart_Parking_System_Project/
├─ backend/
│ ├─ routes/ (auth.js, slots.js, history.js)
│ ├─ models/ (Slot.js)
│ └─ middleware/ (auth.js)
├─ frontend/
│ ├─ login.html (หน้า Login)
│ ├─ user.html (User Dashboard)
│ ├─ dashboard.html (Admin Dashboard)
│ ├─ script.js (shared logic)
│ └─ style.css
├─ server.js
└─ .env

---

## 👤 CREDENTIALS (Hard‑coded demo)

| Role  | Username | Password |
|-------|----------|----------|
| Admin | **admin** | **1234** |
| User  | **user1** | **1234** |

---

## 🚀 RUN BACKEND

npm install
nodemon server.js
ต้องมี .env

MONGODB_URI=<your Mongo URI>
JWT_SECRET=smart-parking-secret
PORT=5000

🌐 FLOW
Login → /api/auth/login → รับ token, role, username

Frontend เก็บใน localStorage
ทุก request ที่ต้องยืนยัน ส่ง header
Authorization: Bearer <token>
x-role: <user | admin>
User
ดูสถานะ GET /api/slots
จอง/จอด/ออก PUT /api/slots/:id
ประวัติส่วนตัว GET /api/history
Admin
Dashboard แสดงทุกช่อง
ประวัติทั้งหมด GET /api/history/admin
รีเซต POST /api/slots/reset

📌 FEATURES
🔑 JWT Authentication + header x-role
🅿️ จองล่วงหน้า 15 นาที (Auto‑expire Cron)
⏰ ค่าจอด ชั่วโมงละ 20 บาท (ปัดขึ้น)
🗂️ User History หน้า user.html
🗂️ All History หน้า dashboard.html (admin)
🧼 Reset Slots (admin only)
🔄 ESP32 พร้อมเชื่อม (ส่ง PUT action ไป API)

🛠️ API CHEAT‑SHEET
Method	Endpoint	          Header & Body	                        Description
POST    /api/auth/login	    { username, password }	              รับ token (JWT)
GET	    /api/slots	        Auth	                                รายชื่อช่องจอด
PUT	    /api/slots/:id	    Auth + x-role + { action, username }	reserve / park / leave
POST    /api/slots/reset	  Auth (admin)	                        รีเซตทุกช่อง
GET	    /api/history	    	Auth	                                ประวัติของตัวเอง
GET	    /api/history/admin	Auth (admin)	                        ประวัติทุกคน

👨‍💻 AUTHORS
นาย ธนภรณ์ วิเศษสังข์ 6630300351
นาย ศิรสิทธิ์ สงแพง 6630300807
(Embedded IoT Project – Kasetsart University Sriracha)