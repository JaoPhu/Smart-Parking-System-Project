
const API_BASE_URL = "http://localhost:5000/api/slots";

function formatDateTime(datetimeStr) {
  if (!datetimeStr) return "-";
  const date = new Date(datetimeStr);
  return date.toLocaleString("th-TH");
}

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

  let countdownText = "";
  if (slot.isBooked && !slot.isOccupied && slot.bookedAt && slot.bookedBy === currentUser) {
    countdownText = `<p class="text-sm text-red-800 mt-2" id="cd-${slot.slotNumber}">⏳ คงเหลือ: กำลังโหลด...</p>`;
    startCountdown(slot.slotNumber, slot.bookedAt);
  }

  card.innerHTML = `
    <h5 class="mb-2">ช่องจอด ${slot.slotNumber}</h5>
    <p class="font-semibold">สถานะ: ${statusText}</p>
    ${countdownText}
    <div class="btn-group mt-3 flex justify-center space-x-2">
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'reserve')">จอง</button>
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'park')">จอด</button>
      <button class="btn btn-sm btn-outline-light" onclick="updateSlot(${slot.slotNumber}, 'leave')">ออก</button>
    </div>
  `;
  return card;
}

function startCountdown(slotNumber, bookedAt) {
  const countdownElement = document.getElementById(`cd-${slotNumber}`);
  const bookedTime = new Date(bookedAt).getTime();
  const expireTime = bookedTime + 15 * 60 * 1000;

  function updateCountdown() {
    const now = Date.now();
    const diff = expireTime - now;
    if (diff <= 0) {
      countdownElement.textContent = "⏱️ หมดเวลาจองแล้ว";
      return;
    }
    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    countdownElement.textContent = `⏳ คงเหลือ: ${min} นาที ${sec} วินาที`;
    requestAnimationFrame(updateCountdown);
  }

  updateCountdown();
}

const currentUser = localStorage.getItem("username") || "";

async function fetchAndRenderSlots() {
  const container = document.getElementById("slots-container");
  const history = document.getElementById("history-container");
  container.innerHTML = "";
  history.innerHTML = "";

  try {
    const res = await fetch(API_BASE_URL);
    const slots = await res.json();

    const myHistory = [];

    slots.forEach((slot) => {
      container.appendChild(createSlotCard(slot));
      if (slot.bookedBy === currentUser || slot.parkedBy === currentUser) {
        myHistory.push({
          slot: slot.slotNumber,
          bookedAt: slot.bookedAt,
          parkedAt: slot.parkedAt,
          leftAt: slot.leftAt
        });
      }
    });

    // ✅ แก้ตรงนี้: ย้ายออกมานอก forEach
    const statusDiv = document.getElementById("status");
    statusDiv.textContent = "โหลดข้อมูลช่องจอดสำเร็จ!";
    statusDiv.className = "mt-2 mb-4 text-center text-green-600 font-medium";

    history.innerHTML = "<ul class='list-disc ml-4'>";
    myHistory.forEach((item) => {
      const fee = item.parkedAt && item.leftAt
        ? Math.ceil((new Date(item.leftAt) - new Date(item.parkedAt)) / 3600000) * 20
        : "-";
      history.innerHTML += `<li>🚗 ช่อง ${item.slot} | จอง: ${formatDateTime(item.bookedAt)} | เข้า: ${formatDateTime(item.parkedAt)} | ออก: ${formatDateTime(item.leftAt)} | 💰 ค่าจอด: ${fee === "-" ? "ยังไม่ออก" : fee + " บาท"}</li>`;
    });
    history.innerHTML += "</ul>";
  } catch (err) {
    container.innerHTML = "<p>โหลดข้อมูลล้มเหลว</p>";
    console.error("โหลดข้อมูลผิดพลาด:", err);
  }
}

async function updateSlot(slotNumber, action) {
  const role = localStorage.getItem("role") || "user";
  try {
    const res = await fetch(`${API_BASE_URL}/${slotNumber}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-role": role
      },
      body: JSON.stringify({ action, username: currentUser }),
    });

    const result = await res.json();
    alert(result.message || `ช่องจอด ${slotNumber} อัปเดตสำเร็จ!`);
    fetchAndRenderSlots();
  } catch (error) {
    alert("เกิดข้อผิดพลาด โปรดลองใหม่");
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("user-name").textContent = currentUser;
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
  fetchAndRenderSlots();
});
