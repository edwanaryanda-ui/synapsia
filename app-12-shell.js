// =========================================================================
// SHELL APLIKASI (setelah masuk): bingkai krem, kapsul navigasi, dock ikon
// Bahasa visualnya sama dengan beranda (landing) supaya terasa satu produk.
// =========================================================================
Object.assign(EI, {
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 .900-1 1.700"/><path d="M12 17h.01"/>',
  users: '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c.8-3.500 3.300-5.500 6.500-5.500s5.700 2 6.500 5.500"/><path d="M16 4.500a3.500 3.500 0 0 1 0 7M18 14.800c1.800.7 3 2.500 3.500 5.200"/>',
  logout: '<path d="M9 4H5v16h4"/><path d="M16 8l4 4-4 4M20 12H9"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/>',
  send: '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
  search: '<circle cx="11" cy="11" r="6.500"/><path d="M20 20l-4-4"/>'
});

const AP_TABS = {
  student: [
    { id: 'home', label: 'Beranda', ico: 'home' }, { id: 'reflection', label: 'Refleksi', ico: 'book' },
    { id: 'explore', label: 'Strategi', ico: 'compass' }, { id: 'quiz', label: 'Kuis', ico: 'help' },
    { id: 'challenges', label: 'Tantangan', ico: 'target' }, { id: 'tips', label: 'Tips', ico: 'bulb' },
    { id: 'messages', label: 'Pesan', ico: 'chat' }
  ],
  counselor: [
    { id: 'overview', label: 'Ringkasan', ico: 'grid' }, { id: 'students', label: 'Daftar Siswa', ico: 'users' },
    { id: 'messages', label: 'Pesan', ico: 'chat' }, { id: 'content', label: 'Kelola Materi', ico: 'layers' }
  ],
  admin: [
    { id: 'summary', label: 'Ringkasan', ico: 'grid' }, { id: 'tips', label: 'Tips', ico: 'bulb' },
    { id: 'account', label: 'Akun', ico: 'settings' }
  ]
};

const apEsc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Gambar sampul lama (palet jenuh) diredam lewat CSS supaya senada dengan tema krem-tanah
function apLegacyImg(src) {
  try { return /1CB0F6|89E219|FFC800|FF9600|58CC02|FFB84D|6CCBFA|FFDD55/i.test(decodeURIComponent(String(src || ''))); } catch (e) { return false; }
}
const apActiveTab = () => state.role === 'student' ? state.studentTab : state.role === 'counselor' ? state.counselorTab : (state.adminTab || 'summary');
const apKey = () => state.role + ':' + apActiveTab();
let apLastKey = '';

function apGo(id) {
  if (state.role === 'student') setStudentTab(id);
  else if (state.role === 'counselor') setCounselorTab(id);
  else setAdminTab(id);
}

// Tombol pesan di bilah atas. Admin otomatis berpindah ke mode konselor (di sana pesan ada).
function apOpenMessages() {
  if (state.role === 'admin') { state.counselorTab = 'messages'; switchRole('counselor'); return; }
  apGo('messages');
}

function renderAppShell(inner) {
  const tabs = AP_TABS[state.role] || [];
  const active = apActiveTab();
  const isStudent = state.role === 'student';
  const first = String(apiUser.name || '').trim().split(/\s+/).slice(0, isStudent ? 1 : 2).join(' ') || 'Pengguna';
  const av = (isStudent && state.currentStudent.avatar) ? state.currentStudent.avatar : initialsAvatar(apiUser.name);
  const roleLbl = isStudent ? ('Siswa' + (apiUser.kelas ? ' · ' + apEsc(apiUser.kelas) : '')) : state.role === 'admin' ? 'Admin' : 'Guru BK';
  const portal = isStudent ? 'PORTAL SISWA' : state.role === 'admin' ? 'PANEL ADMIN' : 'PORTAL KONSELOR';

  const pills = tabs.map(t => `<button class="${t.id === active ? 'on' : ''}" onclick="apGo('${t.id}')">${t.label}${t.id === 'messages' ? '<i class="ap-badge" data-msg-badge hidden></i>' : ''}</button>`).join('');
  const dock = tabs.map(t => `<button class="${t.id === active ? 'on' : ''}" onclick="apGo('${t.id}')" title="${t.label}" aria-label="${t.label}">${edIcon(t.ico, 20)}${t.id === 'messages' ? '<i class="ap-badge" data-msg-badge hidden></i>' : ''}</button>`).join('');

  let modeBtn = '';
  if (state.role === 'admin') modeBtn = `<button class="ed-btn light ap-mode" onclick="switchRole('counselor')">Mode Konselor</button>`;
  else if (state.role === 'counselor' && apiUser.role === 'admin') modeBtn = `<button class="ed-btn light ap-mode" onclick="switchRole('admin')">Panel Admin</button>`;

  return `
  <div class="ed ap">
    <div class="ap-frame">
      <div class="ap-bg" aria-hidden="true">${ED_SCENE.replace('class="ed-scene"', 'class="ap-scene"').replace(/id="ed(sk|sun|lk)"/g, 'id="ap$1"').replace(/url\(#ed(sk|sun|lk)\)/g, 'url(#ap$1)')}<div class="ap-ov"></div></div>

      <header class="ap-top">
        <button class="ed-brand" onclick="apOpenHome()" aria-label="Beranda Synapsia"><img src="logo-sm.png" alt="" width="34" height="34"><span>SYNAPSIA</span></button>
        <nav class="ed-nav ap-nav" aria-label="Navigasi ${portal.toLowerCase()}">${pills}</nav>
        <div class="ed-top-r">
          ${isStudent ? `<span class="ap-streak" title="Streak aktif">🔥 <b>${state.currentStudent.streak || 0}</b></span>` : ''}
          ${modeBtn}
          <button class="ed-round ap-msgbtn" onclick="apOpenMessages()" aria-label="Pesan" title="Pesan">${edIcon('chat', 18)}<i class="ap-badge" data-msg-badge hidden></i></button>
          <div class="ap-user" title="${apEsc(apiUser.name)}"><img src="${av}" alt=""><span><b>${apEsc(first)}</b><small>${roleLbl}</small></span></div>
          <button class="ed-cta ap-out" onclick="logout()"><em>Keluar</em><span>${edIcon('logout', 17)}</span></button>
        </div>
      </header>

      <aside class="ap-dock" aria-label="Menu">${dock}<i class="ap-dock-sp"></i>
        <button onclick="logout()" title="Keluar" aria-label="Keluar" class="ap-dock-out">${edIcon('logout', 20)}</button>
      </aside>

      <main class="ap-main" id="ap-main">${inner}</main>
    </div>
  </div>`;
}

// Logo: kembali ke tab pertama dashboard (bukan ke beranda publik)
function apOpenHome() { apGo(AP_TABS[state.role][0].id); }

// ---- Badge pesan belum dibaca (disegarkan berkala selama masuk) ----
let apUnread = 0, apUnreadTimer = null, apUnreadFails = 0;
function apSetUnread(n) {
  apUnread = n;
  document.querySelectorAll('[data-msg-badge]').forEach(el => { el.textContent = n > 99 ? '99+' : String(n); el.hidden = !n; });
  document.querySelectorAll('[data-msg-count]').forEach(el => { el.textContent = String(n); });
}
async function apPollUnread() {
  if (!apiUser || restoring) return;
  try {
    const r = await api('GET', '/api/messages/unread');
    apUnreadFails = 0;
    const n = r.count || 0;
    const onMsgTab = !!document.getElementById('msg-root');
    if (n > apUnread && !onMsgTab) showToast('Ada pesan baru untukmu', 'dark');
    apSetUnread(n);
  } catch (e) {
    if (++apUnreadFails >= 3) apStopPolling(false);   // fitur pesan belum aktif di database: berhenti mencoba
  }
}
function apStartPolling() {
  if (apUnreadTimer) return;
  apUnreadFails = 0;
  apPollUnread();
  apUnreadTimer = setInterval(() => { if (!document.hidden) apPollUnread(); }, 20000);
}
function apStopPolling(reset = true) {
  clearInterval(apUnreadTimer); apUnreadTimer = null;
  if (reset) apSetUnread(0);
}
