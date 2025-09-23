// โหลด map
const map = L.map('map', { 
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 4,
  preferCanvas: true
});


// กำหนดขนาดภาพ
const w = 5329;
const h = 3745;
const imageUrl = 'gta5map.jpg';
const imageBounds = [[0,0], [h,w]];
// สร้าง audio object
const alertSound = new Audio('Tuturu sound effect.mp3'); // หรือ URL ของไฟล์


L.imageOverlay(imageUrl, imageBounds).addTo(map);

// map พอดีกับขนาดภาพ ไม่มีขอบ
map.fitBounds(imageBounds, { padding: [0, 0] });
map.setMaxBounds(imageBounds); // จำกัดไม่ให้เลื่อนออกนอกภาพ

window.addEventListener('resize', () => {
  map.invalidateSize();
});

// กำหนด icon
const normalIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32,32],
  iconAnchor: [16,32],
  popupAnchor: [0,-28]
});
const redIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32,32],
  iconAnchor: [16,32],
  popupAnchor: [0,-28],
  className: 'red-marker'
});

// CSS marker แดง
const style = document.createElement('style');
style.innerHTML = `
  .leaflet-marker-icon.red-marker {
    filter: hue-rotate(310deg) saturate(500%) brightness(90%);
  }
`;
document.head.appendChild(style);

// แปลงวินาทีเป็น mm:ss
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// เก็บ markers
let markers = [];
let updateTimer = null;

// ตำแหน่งเมาส์ล่าสุด
let lastMouseLatLng = null;
map.on('mousemove', e => { lastMouseLatLng = e.latlng; });

// Timer update รวม
function ensureUpdateTimer() {
  if (updateTimer) return;
  updateTimer = setInterval(() => {
    const now = Date.now();
    if (markers.length === 0) {
      clearInterval(updateTimer);
      updateTimer = null;
      return;
    }
    for (let i = markers.length-1; i>=0; i--) {
      const entry = markers[i];
      const remaining = Math.max(0, Math.ceil((entry.endTime - now)/1000));
      const el = entry.tooltipEl;
      if (!el) continue;
      if (remaining > 0) {
        el.textContent = `⏳ ${formatTime(remaining)}`;
      } else if (!entry.done) {
        entry.done = true;
        el.textContent = "✅ หมดเวลาแล้ว!";
        entry.marker.setIcon(redIcon);

        // 🔔 เล่นเสียงแจ้งเตือน
        alertSound.currentTime = 0;
        alertSound.play();
      }
    }
  }, 1000);
}


// ฟังก์ชันวาง marker + popup ตั้งเวลา
function placeMarkerWithPopup(latlng) {
  if (!latlng) return;

  const popup = L.popup()
    .setLatLng(latlng)
    .setContent(`
      <div style="display:flex; flex-direction:column; gap:4px;">
        <label>ตั้งเวลา (นาที):</label>
        <input type="number" min="0.01" step="0.01" id="timeInput" style="width:60px;" />
        <button id="startBtn">เริ่มนับถอยหลัง</button>
      </div>
    `)
    .openOn(map);

  // ให้ DOM ของ popup โหลดก่อน
  setTimeout(() => {
    const startBtn = document.getElementById('startBtn');
    const timeInput = document.getElementById('timeInput');

    // 🔹 focus input ทันที
    timeInput.focus();

    startBtn.addEventListener('click', () => {
      let minutes = parseFloat(timeInput.value);
      if (isNaN(minutes) || minutes <= 0) return;

      const totalSeconds = Math.round(minutes * 60);
      const endTime = Date.now() + totalSeconds * 1000;

      const marker = L.marker(latlng, { icon: normalIcon }).addTo(map);
      marker.bindTooltip(`⏳ ${formatTime(totalSeconds)}`, { permanent: true, direction:"top", offset:[0,-30] }).openTooltip();

      const tooltipEl = marker.getTooltip().getElement();
      markers.push({ marker, endTime, done:false, tooltipEl });
      ensureUpdateTimer();

      marker.on('contextmenu', () => {
        map.removeLayer(marker);
        markers = markers.filter(m => m.marker !== marker);
      });

      map.closePopup();
    });
  }, 50);
}


// ฟังก์ชันลบ marker ใกล้เมาส์
function removeMarkerAtMouse(latlng, maxDistance=50) { // px
  if (!latlng || markers.length===0) return;

  let closest = null;
  let minDist = Infinity;

  markers.forEach(entry => {
    const pos = map.latLngToContainerPoint(entry.marker.getLatLng());
    const mousePos = map.latLngToContainerPoint(latlng);
    const dist = pos.distanceTo(mousePos);
    if (dist < minDist && dist <= maxDistance) {
      minDist = dist;
      closest = entry;
    }
  });

  if (closest) {
    map.removeLayer(closest.marker);
    markers = markers.filter(m=> m!==closest);
  }
}

// ฟังชั่น keydown
document.addEventListener('keydown', e => {
  if (!lastMouseLatLng) return;
  if (e.key === 'e' || e.key==='E') {
    placeMarkerWithPopup(lastMouseLatLng);
  } else if (e.key === 'q' || e.key==='Q') {
    removeMarkerAtMouse(lastMouseLatLng);
  }
});
