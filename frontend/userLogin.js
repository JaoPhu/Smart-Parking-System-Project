/* userLogin.js */
const API_BASE_URL = "http://localhost:5000/api/slots";
const token        = localStorage.getItem("token") || "";
const currentUser  = localStorage.getItem("username") || "";

/* ───────────────── helper ───────────────── */
function authHeader() {
  return { Authorization: `Bearer ${token}` };
}
function formatDateTime(dt) {
  return dt ? new Date(dt).toLocaleString("th-TH") : "-";
}

/* ───────────────── สร้างการ์ดช่อง ───────────────── */
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

  /* countdown */
  let cd = "";
  if (slot.isBooked && !slot.isOccupied && slot.bookedBy === currentUser) {
    cd = `<p class="text-sm text-red-800 mt-2" id="cd-${slot.slotNumber}">⏳ คงเหลือ: ...</p>`;
    startCountdown(slot.slotNumber, slot.bookedAt);
  }

  card.innerHTML = `
    <h5 class="mb-2">ช่องจอด ${slot.slotNumber}</h5>
    <p class="font-semibold">สถานะ: ${statusText}</p>
    ${cd}
    <div class="btn-group mt-3 flex justify-center space-x-2">
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'reserve')">จอง</button>
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'park')">จอด</button>
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'leave')">ออก</button>
    </div>
  `;
  return card;
}

/* ───────────────── countdown ───────────────── */
function startCountdown(slotNumber, bookedAt) {
  const el   = () => document.getElementById(`cd-${slotNumber}`);
  const exp  = new Date(bookedAt).getTime() + 15 * 60 * 1000;
  (function tick() {
    const node = el();
    if (!node) return;
    const diff = exp - Date.now();
    if (diff <= 0) return (node.textContent = "⏱️ หมดเวลาจองแล้ว");
    node.textContent =
      "⏳ คงเหลือ: " +
      Math.floor(diff / 60000) +
      " นาที " +
      Math.floor((diff % 60000) / 1000) +
      " วินาที";
    requestAnimationFrame(tick);
  })();
}

/* ───────────────── โหลดข้อมูล ───────────────── */
async function fetchAndRenderSlots() {
  const container = document.getElementById("slots-container");
  const history   = document.getElementById("history-container");
  const statusDiv = document.getElementById("status");

  container.innerHTML = "";
  history.innerHTML   = "";
  statusDiv.textContent = "กำลังโหลดข้อมูลช่องจอด...";
  statusDiv.className  = "mt-2 mb-4 text-center text-blue-600 font-medium";

  try {
    const res   = await fetch(API_BASE_URL, { headers: authHeader() });
    if (!res.ok) throw new Error(res.status);
    const slots = await res.json();

    /* render */
    const myHistory = [];
    slots.forEach((s) => {
      container.appendChild(createSlotCard(s));
      if (s.bookedBy === currentUser || s.parkedBy === currentUser) myHistory.push(s);
    });

    statusDiv.textContent = "โหลดข้อมูลช่องจอดสำเร็จ!";
    statusDiv.className   = "mt-2 mb-4 text-center text-green-600 font-medium";

    history.innerHTML = "<ul class='list-disc ml-4'>";
    myHistory.forEach((i) => {
      const fee =
        i.parkedAt && i.leftAt
          ? Math.ceil((new Date(i.leftAt) - new Date(i.parkedAt)) / 3600000) * 20
          : "-";
      history.innerHTML += `<li>🚗 ช่อง ${i.slotNumber} | จอง: ${formatDateTime(
        i.bookedAt
      )} | เข้า: ${formatDateTime(i.parkedAt)} | ออก: ${formatDateTime(
        i.leftAt
      )} | 💰 ${fee === "-" ? "ยังไม่ออก" : fee + " บาท"}</li>`;
    });
    history.innerHTML += "</ul>";
  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p class='text-danger text-center w-full'>❌ ไม่สามารถโหลดข้อมูลได้</p>";
    statusDiv.textContent = "โหลดข้อมูลล้มเหลว";
    statusDiv.className   = "mt-2 mb-4 text-center text-red-600 font-medium";
  }
}

/* ───────────────── updateSlot ───────────────── */
async function updateSlot(slotNumber, action) {
  try {
    const res = await fetch(`${API_BASE_URL}/${slotNumber}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader()
      },
      body: JSON.stringify({ action, username: currentUser })
    });
    const result = await res.json();
    alert(result.message || result.error || "ทำรายการสำเร็จ");
    fetchAndRenderSlots();
  } catch (e) {
    alert("เกิดข้อผิดพลาด โปรดลองใหม่");
    console.error(e);
  }
}

/* ───────────────── init ───────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("user-name").textContent = currentUser;
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
  fetchAndRenderSlots();
});
