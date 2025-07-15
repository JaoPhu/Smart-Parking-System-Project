document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault(); // ป้องกันการโหลดหน้าซ้ำเมื่อกด submit

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginStatusDiv = document.getElementById("login-status");
  const loginButton = this.querySelector('button[type="submit"]'); // เลือกปุ่ม submit

  // ล้างข้อความสถานะเดิมและปิดการใช้งานปุ่มก่อนส่งข้อมูล
  loginStatusDiv.textContent = "";
  loginStatusDiv.classList.remove("text-red-500", "text-green-500"); // ลบคลาสสีเก่า
  loginButton.disabled = true; // ปิดการใช้งานปุ่ม
  loginButton.textContent = "กำลังเข้าสู่ระบบ..."; // เปลี่ยนข้อความปุ่ม

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await res.json(); // อ่าน response ก่อนตรวจสอบ res.ok

    if (res.ok) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", result.role);

      loginStatusDiv.textContent = "เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนหน้า...";
      loginStatusDiv.classList.add("text-green-500"); // แสดงข้อความสำเร็จสีเขียว

      // หน่วงเวลาเล็กน้อยเพื่อให้ผู้ใช้เห็นข้อความสำเร็จก่อนเปลี่ยนหน้า
      setTimeout(() => {
        if (result.role === "admin") {
          window.location.href = "dashboard.html"; // เปลี่ยนเป็น dashboard.html สำหรับ admin
        } else {
          window.location.href = "user.html"; // เปลี่ยนเป็น user.html สำหรับผู้ใช้ทั่วไป
        }
      }, 500); // หน่วง 0.5 วินาที
      
    } else {
      // กรณี Login ไม่สำเร็จ
      const errorMessage = result.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
      loginStatusDiv.textContent = errorMessage;
      loginStatusDiv.classList.add("text-red-500"); // แสดงข้อความข้อผิดพลาดสีแดง
    }
  } catch (err) {
    // กรณีเกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย
    console.error("Login error:", err);
    loginStatusDiv.textContent = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
    loginStatusDiv.classList.add("text-red-500"); // แสดงข้อความข้อผิดพลาดสีแดง
  } finally {
    // ไม่ว่าจะสำเร็จหรือล้มเหลว ให้เปิดการใช้งานปุ่มกลับคืน
    loginButton.disabled = false;
    loginButton.textContent = "เข้าสู่ระบบ"; // คืนข้อความปุ่มเดิม
  }
});