const seed = document.getElementById('trip-data').textContent.replace(/\nlet day[\s\S]*/, '');
eval(`${seed};window.tripDays=D;`);
const D = window.tripDays;
const $ = (id) => document.getElementById(id);
let day = 0;
let selected = 0;
let map;

function directions(p) {
  return `https://www.google.com/maps/dir/?api=1&destination=${p[3]},${p[4]}&travelmode=driving`;
}

function grab(p) {
  return `https://grab.onelink.me/2695613898?pid=inappsharing&c=1000880&af_dp=grab%3A%2F%2Fopen%3FscreenType%3DBOOKING%26dropOffLatitude%3D${p[3]}%26dropOffLongitude%3D${p[4]}%26dropOffAddress%3D${encodeURIComponent(p[1])}`;
}

function selectDay(index) {
  day = index;
  selected = 0;
  render();
}

function selectStop(index) {
  selected = index;
  render();
  const p = D[day][6][selected];
  map.flyTo([p[3], p[4]], 15, { duration: 0.5 });
}

function draw(points) {
  if (map) map.remove();
  map = L.map('map', { zoomControl: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  const positions = points.map((p, i) => {
    const active = i === selected ? '#e46649' : '#fffdf8';
    const icon = L.divIcon({ className: '', html: `<div style="width:34px;height:34px;border-radius:50%;background:${active};border:3px solid #17372f;color:#17372f;display:grid;place-items:center;font-weight:bold">${i + 1}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] });
    L.marker([p[3], p[4]], { icon }).addTo(map).on('click', () => selectStop(i));
    return [p[3], p[4]];
  });
  L.polyline(positions, { color: '#e46649', weight: 4, dashArray: '8 10' }).addTo(map);
  map.fitBounds(positions, { padding: [45, 45], maxZoom: 15 });
}

function render() {
  const d = D[day];
  const p = d[6][selected];
  $('days').innerHTML = D.map((x, i) => `<button class="${i === day ? 'active' : ''}" data-day="${i}"><small>DAY ${i + 1}</small><b>${x[0]} ${x[1]}</b><i>${x[2]}</i></button>`).join('');
  document.querySelectorAll('[data-day]').forEach((button) => button.onclick = () => selectDay(Number(button.dataset.day)));
  $('label').textContent = `DAY ${day + 1} · ${d[0]}`;
  $('title').textContent = d[2];
  $('stay').textContent = `${d[4] || '全天城市行程'} · 住宿：${d[5]}`;
  $('level').textContent = `${d[3]} · ${d[6].length} 个停靠点`;
  $('list').innerHTML = d[6].map((x, i) => `<button class="${i === selected ? 'active' : ''}" data-stop="${i}"><span class="num">${i + 1}</span><time>${x[0]}</time><span><b>${x[1]}</b><small>${x[2]}</small></span></button>`).join('');
  document.querySelectorAll('[data-stop]').forEach((button) => button.onclick = () => selectStop(Number(button.dataset.stop)));
  $('photo').style.backgroundImage = `linear-gradient(0deg,rgba(12,35,30,.35),transparent),url(${p[5]})`;
  $('pin').textContent = selected + 1;
  $('time').textContent = `${p[0]} · 行程亮点`;
  $('name').textContent = p[1];
  $('blurb').textContent = p[6];
  $('tip').textContent = p[7];
  $('tags').innerHTML = p[8].split('|').map((tag) => `<i>${tag}</i>`).join('');
  $('google').href = directions(p);
  $('grab').href = grab(p);
  draw(d[6]);
}

render();
