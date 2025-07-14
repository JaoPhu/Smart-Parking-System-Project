// URL พื้นฐานของ API
const API_BASE_URL = "http://localhost:5000/api/slots";

// ฟังก์ชันช่วยในการสร้างองค์ประกอบการ์ดช่องจอด
function createSlotCard(slot) {
    const card = document.createElement("div");
    card.className =
        // ปรับ w-full เพื่อให้กว้างเต็มคอลัมน์บนมือถือ, max-w-xs เพื่อจำกัดความกว้างสูงสุดของการ์ด
        "card shadow p-3 rounded text-center w-full max-w-xs " + // ลบ m-2 ออก
        (slot.isOccupied
            ? "bg-danger text-white" // คลาส Bootstrap สำหรับช่องที่ไม่ว่าง
            : slot.isBooked
                ? "bg-warning" // คลาส Bootstrap สำหรับช่องที่จองแล้ว (สีเหลือง)
                : "bg-success text-white"); // คลาส Bootstrap สำหรับช่องที่ว่าง (สีเขียว)

    const statusText = slot.isOccupied ? "ไม่ว่าง 🔴" : slot.isBooked ? "จองแล้ว 🟡" : "ว่าง 🟢";

    card.innerHTML = `
    <h5 class="mb-2">ช่องจอด ${slot.slotNumber}</h5>
    <p class="font-semibold">สถานะ: ${statusText}</p>
    <div class="btn-group mt-3 flex justify-center space-x-2">
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'reserve')">จอง</button>
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'park')">จอด</button>
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'leave')">ออก</button>
    </div>
  `;
    return card;
}

// ฟังก์ชันสำหรับเรียกข้อมูลและแสดงผลช่องจอดทั้งหมด
async function fetchAndRenderSlots() {
    const container = document.getElementById("slots-container");
    const statusDiv = document.getElementById("status");

    container.innerHTML = ""; // ล้างช่องจอดที่มีอยู่
    statusDiv.textContent = "กำลังโหลดข้อมูลช่องจอด...";
    statusDiv.className = "mt-6 text-center text-lg font-medium text-blue-600";

    try {
        const res = await fetch(API_BASE_URL);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const slots = await res.json();

        if (slots.length === 0) {
            statusDiv.textContent = "ไม่พบช่องจอดรถ";
            statusDiv.className = "mt-6 text-center text-lg font-medium text-gray-600";
            return;
        }

        slots.forEach((slot) => {
            container.appendChild(createSlotCard(slot));
        });
        statusDiv.textContent = "โหลดข้อมูลช่องจอดสำเร็จ!";
        statusDiv.className = "mt-6 text-center text-lg font-medium text-green-600";
    } catch (error) {
        container.innerHTML = `<p class="text-danger text-center w-full">❌ ไม่สามารถโหลดข้อมูลได้ โปรดตรวจสอบเครือข่ายหรือเซิร์ฟเวอร์ของคุณ</p>`;
        statusDiv.textContent = "โหลดข้อมูลช่องจอดล้มเหลว";
        statusDiv.className = "mt-6 text-center text-lg font-medium text-red-600";
        console.error("โหลดข้อมูลไม่สำเร็จ:", error);
    }
}

// ฟังก์ชันสำหรับอัปเดตสถานะช่องจอดเดียว
async function updateSlot(slotNumber, action) {
    try {
        const role = localStorage.getItem("role") || "user"; // อ่าน role จาก localStorage (ถ้าไม่มีให้เป็น user)

        const res = await fetch(`${API_BASE_URL}/${slotNumber}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-role": role // ✅ ส่ง role ใน header
            },
            body: JSON.stringify({ action }),
        });


        const result = await res.json();

        if (res.ok) {
            alert(result.message || `ช่องจอด ${slotNumber} อัปเดตสำเร็จ! ✅`);
        } else {
            const errorMsg = result?.error || result?.message || 'ข้อผิดพลาดที่ไม่รู้จัก';
            alert(`ข้อผิดพลาดในการอัปเดตช่องจอด ${slotNumber}: ${errorMsg}`);
        }

        fetchAndRenderSlots(); // เรียกข้อมูลและแสดงผลใหม่เพื่ออัปเดตสถานะแทนการ reload หน้า
    } catch (error) {
        alert("❌ เกิดข้อผิดพลาดในระหว่างการอัปเดต โปรดลองอีกครั้ง");
        console.error("ข้อผิดพลาดในการอัปเดตช่องจอด:", error);
    }
}

// โหลดครั้งแรกเมื่อ DOM โหลดเสร็จสมบูรณ์
document.addEventListener("DOMContentLoaded", fetchAndRenderSlots);