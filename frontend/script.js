// =====================
//   script.js (FULL)
// =====================

// URL พื้นฐานของ API
const API_BASE_URL = "http://localhost:5000/api/slots";
const HISTORY_URL  = "http://localhost:5000/api/history";

// ------------------  UTIL  ------------------
function authHeader() {
  const token = localStorage.getItem("token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function roleHeader() {
  return { "x-role": localStorage.getItem("role") || "user" };
}
function formatDateTime(dt) {
  return dt ? new Date(dt).toLocaleString("th-TH") : "-";
}

// ----------------  SLOT CARD  ---------------
function createSlotCard(slot) {
  const card = document.createElement("div");
  card.className =
    "card shadow p-3 rounded text-center w-full max-w-xs " +
    (slot.isOccupied
      ? "bg-danger text-white"
      : slot.isBooked
      ? "bg-warning"
      : "bg-success text-white");

  const statusText = slot.isOccupied
    ? "ไม่ว่าง 🔴"
    : slot.isBooked
    ? "จองแล้ว 🟡"
    : "ว่าง 🟢";

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

// ---------------  FETCH SLOTS  --------------
async function fetchAndRenderSlots() {
  const container = document.getElementById("slots-container");
  const statusDiv = document.getElementById("status");

  container.innerHTML = "";
  statusDiv.textContent = "กำลังโหลดข้อมูลช่องจอด...";
  statusDiv.className = "mt-6 text-center text-lg font-medium text-blue-600";

  try {
    const res = await fetch(API_BASE_URL, { headers: authHeader() });
    if (!res.ok) throw new Error(res.status);

    const slots = await res.json();
    if (slots.length === 0) {
      statusDiv.textContent = "ไม่พบช่องจอดรถ";
      statusDiv.className = "mt-6 text-center text-lg font-medium text-gray-600";
      return;
    }

    slots.forEach((slot) => container.appendChild(createSlotCard(slot)));

    statusDiv.textContent = "โหลดข้อมูลช่องจอดสำเร็จ!";
    statusDiv.className = "mt-6 text-center text-lg font-medium text-green-600";
  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p class='text-danger text-center w-full'>❌ ไม่สามารถโหลดข้อมูลได้</p>";
    statusDiv.textContent = "โหลดข้อมูลช่องจอดล้มเหลว";
    statusDiv.className = "mt-6 text-center text-lg font-medium text-red-600";
  }
}

// ---------------  UPDATE SLOT  --------------
async function updateSlot(slotNumber, action) {
  const username = localStorage.getItem("username") || "unknown";

  try {
    const res = await fetch(`${API_BASE_URL}/${slotNumber}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
        ...roleHeader()
      },
      body: JSON.stringify({ action, username })
    });

    const result = await res.json();
    alert(result.message || result.error || "ทำรายการสำเร็จ");
    fetchAndRenderSlots();
    fetchUserHistory();
  } catch (err) {
    console.error(err);
    alert("❌ เกิดข้อผิดพลาด โปรดลองใหม่");
  }
}

// ---------------  HISTORY USER  -------------
async function fetchUserHistory() {
  const historyDiv = document.getElementById("history-container");
  if (!historyDiv) return; // หน้า admin ไม่มี div นี้

  historyDiv.innerHTML = "⏳ กำลังโหลดประวัติ...";
  try {
    const res = await fetch(`${HISTORY_URL}/${localStorage.getItem("username")}`, {
      headers: { ...authHeader(), ...roleHeader() }
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Fetch history failed");

    if (data.length === 0) {
      historyDiv.innerHTML = "<p class='text-center text-gray-500'>ไม่มีประวัติการใช้งาน</p>";
      return;
    }

    let html = "<ul class='list-disc ml-4'>";
    data.forEach((h) => {
      const fee =
        h.parkedAt && h.leftAt
          ? Math.ceil((new Date(h.leftAt) - new Date(h.parkedAt)) / 3600000) * 20 + " บาท"
          : "-";
      html += `<li>ช่อง ${h.slotNumber} | เข้า: ${formatDateTime(h.parkedAt)} | ออก: ${formatDateTime(
        h.leftAt
      )} | 💰 ${fee}</li>`;
    });
    html += "</ul>";
    historyDiv.innerHTML = html;
  } catch (err) {
    console.error(err);
    historyDiv.innerHTML = "<p class='text-red-600'>❌ ดึงประวัติไม่สำเร็จ</p>";
  }
}

// ---------------   INIT PAGE   --------------
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderSlots();
  fetchUserHistory(); // หน้า admin จะข้ามเพราะไม่มี div
});
