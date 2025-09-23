// โหลดแผนที่ Leaflet โดยใช้รูปภาพ
const map = L.map('map', { 
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 4,
  preferCanvas: true // ใช้ canvas renderer
});


// โหลดภาพแผนที่ (แก้ path ตามไฟล์จริง)
const w = 4000;
const h = 4000;
const imageUrl = 'gta5map.jpg';
const imageBounds = [[0,0], [h,w]];

L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.fitBounds(imageBounds);

// กำหนด icon ปกติ และ icon แดง
const normalIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28]
});

const redIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  className: 'red-marker'
});

// CSS ให้ marker สีแดง
const style = document.createElement('style');
style.innerHTML = `
  .leaflet-marker-icon.red-marker {
    filter: hue-rotate(310deg) saturate(500%) brightness(90%);
  }
`;
document.head.appendChild(style);

// ฟังก์ชันช่วยแปลงวินาทีเป็น mm:ss
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// เก็บ marker + timer
let markers = [];

map.on('click', function(e) {
    // สร้าง Leaflet popup เล็ก ๆ
    const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(`
            <div style="display:flex; flex-direction:column; gap:4px;">
                <label>ตั้งเวลา (นาที):</label>
                <input type="number" min="1" id="timeInput" style="width:60px;" />
                <button id="startBtn">เริ่มนับถอยหลัง</button>
            </div>
        `)
        .openOn(map);

    // รอให้ DOM ของ popup โหลดก่อน
    setTimeout(() => {
        const startBtn = document.getElementById('startBtn');
        const timeInput = document.getElementById('timeInput');

        startBtn.addEventListener('click', () => {
            let minutes = parseInt(timeInput.value);
            if (isNaN(minutes) || minutes <= 0) return;

            let totalSeconds = minutes * 60;

            // สร้าง marker + tooltip
            const marker = L.marker(e.latlng, { icon: normalIcon }).addTo(map);
            marker.bindTooltip(`⏳ ${formatTime(totalSeconds)}`, { permanent: true, direction: "top", offset: [0, -30] }).openTooltip();

            // countdown
            let countdown = setInterval(() => {
                totalSeconds--;
                if (totalSeconds > 0) {
                    marker.setTooltipContent(`⏳ ${formatTime(totalSeconds)}`);
                } else {
                    clearInterval(countdown);
                    marker.setTooltipContent("✅ หมดเวลาแล้ว!");
                    marker.setIcon(redIcon);
                }
            }, 1000);

            // เก็บ marker + timer
            markers.push({ marker, timer: countdown });

            // คลิกขวาลบ marker
            marker.on("contextmenu", function() {
                clearInterval(countdown);
                map.removeLayer(marker);
                markers = markers.filter(m => m.marker !== marker);
            });

            // ปิด popup หลังกด start
            map.closePopup();
        });
    }, 50);
});
