// โหลดแผนที่ Leaflet โดยใช้รูปภาพ
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 4
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

// เก็บ marker + timer
let markers = [];

// เมื่อคลิกบนแผนที่
map.on('click', function(e) {
  Swal.fire({
    title: 'ตั้งเวลา (วินาที)',
    input: 'number',
    inputAttributes: { min: 1 },
    showCancelButton: true,
    confirmButtonText: 'เริ่มนับถอยหลัง'
  }).then((timeResult) => {
    if (!timeResult.isConfirmed) return;

    let seconds = parseInt(timeResult.value);
    if (isNaN(seconds) || seconds <= 0) return;

    // สร้าง marker + tooltip (แสดงตลอด)
    const marker = L.marker(e.latlng, { icon: normalIcon }).addTo(map);
    marker.bindTooltip(`⏳ ${seconds}s`, { permanent: true, direction: "top", offset: [0, -30] }).openTooltip();

    // countdown
    let timer = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        marker.setTooltipContent(`⏳ ${seconds}s`);
      } else {
        clearInterval(timer);
        marker.setTooltipContent("✅ หมดเวลาแล้ว!");
        marker.setIcon(redIcon);
      }
    }, 1000);

    // เก็บ marker + timer ไว้
    markers.push({ marker, timer });

    // คลิกขวาลบ marker
    marker.on("contextmenu", function() {
      clearInterval(timer);
      map.removeLayer(marker);
      markers = markers.filter(m => m.marker !== marker);
    });
  });
});
