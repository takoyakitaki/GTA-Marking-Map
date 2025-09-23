document.addEventListener('DOMContentLoaded', () => {

  // --- 🔑 ตั้งรหัสผ่านที่ต้องการตรงนี้ 🔑 ---
  const CORRECT_PASSWORD = '112';
  // ------------------------------------

  const passwordInput = document.getElementById('passwordInput');
  const submitBtn = document.getElementById('submitBtn');

  function attemptLogin() {
    // ตรวจสอบรหัส
    if (passwordInput.value === CORRECT_PASSWORD) {
      // ❗ ถ้ารหัสถูก ให้ไปที่หน้าหลักทันที ❗
      window.location.href = 'map.html';
    } else {
      alert('รหัสผ่านไม่ถูกต้อง!');
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  // ทำให้ปุ่ม Enter และการคลิกทำงานได้
  submitBtn.addEventListener('click', attemptLogin);
  passwordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      attemptLogin();
    }
  });
});