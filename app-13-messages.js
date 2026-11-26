// =========================================================================
// PESAN: umpan balik dua arah antara siswa dan konselor (BK)
// Siswa melihat satu percakapan dengan "Guru BK". Konselor/admin melihat
// daftar percakapan semua siswa dan membalas. Data dimuat ulang berkala (polling).
// =========================================================================
const MSG = { threads: [], active: null, list: [], q: '', onlyUnread: false, timer: null, sig: '', fails: 0, err: '', busy: false };
const msgStaff = () => !!apiUser && apiUser.role !== 'siswa';
const MSG_CHIPS_STUDENT = ['Aku butuh teman bicara', 'Aku ingin konsultasi soal belajar', 'Aku sedang merasa stres', 'Aku ingin jadwal sesi konseling'];
const MSG_CHIPS_STAFF = [
  'Terima kasih sudah bercerita. Aku di sini mendengarkanmu.',
  'Bagaimana kabarmu hari ini? Ceritakan pelan-pelan ya.',
  'Hebat, kamu sudah konsisten! Terus pertahankan kebiasaan baikmu.',
  'Yuk jadwalkan sesi konseling. Kapan waktu yang nyaman untukmu?'
];

const msgSame = (a, b) => a.toDateString() === b.toDateString();
function msgClock(iso) { return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'); }
function msgDay(iso) {
  const d = new Date(iso), t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
  if (msgSame(d, t)) return 'Hari ini';
  if (msgSame(d, y)) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', ...(d.getFullYear() === t.getFullYear() ? {} : { year: 'numeric' }) });
}
function msgShort(iso) {
  if (!iso) return '';
  const d = new Date(iso), t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
  if (msgSame(d, t)) return msgClock(iso);
  if (msgSame(d, y)) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
const msgInitials = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

// ---------------------------------------------------------------- tampilan
function renderMessagesView() { return msgStaff() ? renderMsgStaff() : renderMsgStudent(); }

function msgHead(eyebrow, title, lead) {
  return `<div class="ap-head"><div><p class="ap-eyebrow">${eyebrow}</p><h1 class="ap-h1">${title}</h1>${lead ? `<p class="ap-lead">${lead}</p>` : ''}</div></div>`;
}

function renderMsgStudent() {
  MSG.active = 'me';
  return `<section class="ap-page">
    ${msgHead('PESAN — KONSELING', 'Ruang <em>Bicara</em>', 'Sampaikan pertanyaan atau ceritamu. Guru BK akan membalas di sini.')}
    <div class="msg-card" id="msg-root">
      <div class="msg-head"><img src="logo-sm.png" alt="" width="42" height="42"><div><b>Guru BK Synapsia</b><small>Percakapan pribadi dengan konselor</small></div></div>
      ${msgPaneBody(MSG_CHIPS_STUDENT)}
    </div>
    <p class="msg-note">Percakapan ini hanya dapat dibaca oleh guru BK. Jika kamu merasa tidak aman atau dalam keadaan darurat, segera hubungi guru, orang tua, atau orang dewasa yang kamu percaya.</p>
  </section>`;
}

function msgPaneBody(chips) {
  return `
    <div class="msg-list" id="msg-list" aria-live="polite"><p class="msg-empty">Memuat pesan…</p></div>
    <div class="msg-chips" id="msg-chips">${chips.map((c, i) => `<button type="button" onclick="msgChip(${i})">${apEsc(c)}</button>`).join('')}</div>
    <form class="msg-comp" onsubmit="msgSend(event)">
      <textarea id="msg-input" rows="1" maxlength="1500" placeholder="Tulis pesan…" aria-label="Tulis pesan" onkeydown="msgKey(event)" oninput="msgGrow(this)"></textarea>
      <button class="msg-send" id="msg-send" aria-label="Kirim pesan">${edIcon('send', 18)}</button>
    </form>`;
}

function renderMsgStaff() {
  return `<section class="ap-page">
    ${msgHead('PESAN — UMPAN BALIK', 'Pesan <em>Siswa</em>', 'Balas pertanyaan siswa dan kirim umpan balik langsung. Pesan yang belum dibaca ditandai.')}
    <div class="msg-split ${MSG.active ? 'has-active' : ''}" id="msg-root">
      <aside class="msg-side">
        <div class="msg-search">
          <span>${edIcon('search', 16)}</span>
          <input id="msg-q" type="search" placeholder="Cari nama atau kelas…" value="${apEsc(MSG.q)}" oninput="msgFilter(this.value)" aria-label="Cari siswa">
        </div>
        <div class="msg-tabs"><button id="msg-f-all" class="${MSG.onlyUnread ? '' : 'on'}" onclick="msgSetUnread(false)">Semua</button><button id="msg-f-unread" class="${MSG.onlyUnread ? 'on' : ''}" onclick="msgSetUnread(true)">Belum dibaca</button></div>
        <div class="msg-threads" id="msg-threads"><p class="msg-empty">Memuat…</p></div>
      </aside>
      <div class="msg-pane" id="msg-pane">${MSG.active ? msgStaffPane() : msgStaffEmpty()}</div>
    </div>
  </section>`;
}

function msgStaffEmpty() {
  return `<div class="msg-blank"><span>${edIcon('chat', 34)}</span><b>Pilih percakapan</b><p>Pilih siswa di sebelah kiri untuk membaca dan membalas pesan.</p></div>`;
}

function msgStaffPane() {
  const t = MSG.threads.find(x => x.id === MSG.active) || { name: 'Siswa', kelas: '' };
  const st = (state.studentsData || []).find(x => x.id === MSG.active);
  const chip = st ? `<span class="msg-status s-${String(st.status).toLowerCase().replace(/\s+/g, '-')}">${apEsc(st.status)}</span>` : '';
  return `
    <div class="msg-head">
      <button class="msg-back" onclick="msgBack()" aria-label="Kembali ke daftar">${edIcon('left', 18)}</button>
      <img src="${initialsAvatar(t.name)}" alt="" width="42" height="42">
      <div><b>${apEsc(t.name)}</b><small>${apEsc(t.kelas)}</small></div>
      ${chip}
      <button class="msg-prof" onclick="openCounselorStudentModal('${apEsc(MSG.active)}')">Lihat profil</button>
    </div>
    ${msgPaneBody(MSG_CHIPS_STAFF)}`;
}

// ---------------------------------------------------------------- daftar percakapan (staf)
function msgPaintThreads() {
  const box = document.getElementById('msg-threads');
  if (!box) return;
  const q = MSG.q.trim().toLowerCase();
  let rows = MSG.threads.filter(t => (!q || (t.name + ' ' + t.kelas).toLowerCase().includes(q)) && (!MSG.onlyUnread || t.unread > 0));
  if (!rows.length) { box.innerHTML = `<p class="msg-empty">${MSG.onlyUnread ? 'Tidak ada pesan yang belum dibaca.' : q ? 'Tidak ada siswa yang cocok.' : 'Belum ada siswa terdaftar.'}</p>`; return; }
  box.innerHTML = rows.map(t => {
    const mine = t.last_role && t.last_role !== 'siswa';
    const prev = t.last_body ? (mine ? 'Kamu: ' : '') + t.last_body : 'Belum ada pesan';
    return `<button class="msg-th ${t.id === MSG.active ? 'on' : ''} ${t.unread ? 'unread' : ''}" onclick="msgOpen('${apEsc(t.id)}')">
      <img src="${initialsAvatar(t.name)}" alt="" width="40" height="40">
      <span class="msg-th-b"><span class="msg-th-t"><b>${apEsc(t.name)}</b><time>${msgShort(t.last_at)}</time></span>
        <span class="msg-th-p"><span>${apEsc(prev)}</span>${t.unread ? `<i class="ap-badge">${t.unread > 99 ? '99+' : t.unread}</i>` : ''}</span>
        <small>${apEsc(t.kelas)}</small></span></button>`;
  }).join('');
}

async function msgLoadThreads() {
  const rows = await api('GET', '/api/messages/threads');
  MSG.threads = Array.isArray(rows) ? rows.map(r => ({ ...r, unread: Number(r.unread) || 0 })) : [];
  msgPaintThreads();
}

// ---------------------------------------------------------------- isi percakapan
// Pesan milikku: siswa = pesan siswa; konselor/admin = pesan yang dikirim akunku sendiri
const msgOut = (m) => msgStaff() ? m.sender_id === apiUser.id : m.sender_role === 'siswa';

function msgBubble(m) {
  const out = msgOut(m);
  let who = '';
  if (!out && m.sender_role !== 'siswa') who = `<span class="msg-who">${apEsc(m.sender_name || 'Guru BK')}${msgStaff() ? '' : ' · Konselor'}</span>`;
  const seen = out ? (m.tmp ? ' · Mengirim…' : (m.read_at ? ' · Dibaca' : '')) : '';
  return `${who}<div class="msg-b">${apEsc(m.body)}</div><span class="msg-meta">${msgClock(m.created_at)}${seen}</span>`;
}

function msgPaintList(forceBottom) {
  const box = document.getElementById('msg-list');
  if (!box) return;
  const nearBottom = forceBottom || box.scrollHeight - box.scrollTop - box.clientHeight < 90;
  if (MSG.err) { box.innerHTML = `<p class="msg-empty">${apEsc(MSG.err)}<br><button class="msg-retry" onclick="msgInit()">Coba lagi</button></p>`; return; }
  if (!MSG.list.length) {
    box.innerHTML = `<p class="msg-empty">${msgStaff() ? 'Belum ada pesan dengan siswa ini. Kirim sapaan pertamamu.' : 'Belum ada pesan. Mulai percakapan dengan guru BK, atau pilih salah satu kalimat di bawah.'}</p>`;
  } else {
    let day = '', html = '';
    MSG.list.forEach(m => {
      const d = msgDay(m.created_at);
      if (d !== day) { day = d; html += `<div class="msg-day">${d}</div>`; }
      html += `<div class="msg-row ${msgOut(m) ? 'mine' : 'theirs'}">${msgBubble(m)}</div>`;
    });
    box.innerHTML = html;
  }
  if (nearBottom) box.scrollTop = box.scrollHeight;
  const chips = document.getElementById('msg-chips');
  if (chips) chips.hidden = MSG.list.length > 0 && !msgStaff();
}

async function msgLoadList(first) {
  if (!MSG.active) return;
  const id = MSG.active;
  const rows = await api('GET', '/api/messages/' + encodeURIComponent(id));
  if (id !== MSG.active) return;                       // percakapan sudah berganti selama memuat
  MSG.err = '';
  const sig = rows.map(m => m.id + (m.read_at ? 'r' : '')).join(',');
  if (sig !== MSG.sig || first) { MSG.sig = sig; MSG.list = rows; msgPaintList(first); }
  const incoming = rows.some(m => !m.read_at && (msgStaff() ? m.sender_role === 'siswa' : m.sender_role !== 'siswa'));
  if (incoming && !document.hidden) {
    try { await api('POST', '/api/messages/' + encodeURIComponent(id) + '/read'); } catch (e) { /* abaikan */ }
    if (msgStaff()) msgLoadThreads().catch(() => {});
    apPollUnread();
  }
}

// ---------------------------------------------------------------- siklus hidup
async function msgInit() {
  clearInterval(MSG.timer); MSG.timer = null;
  if (!document.getElementById('msg-root')) return;
  MSG.fails = 0; MSG.err = ''; MSG.sig = '';
  try {
    if (msgStaff()) { await msgLoadThreads(); if (MSG.active && !MSG.threads.some(t => t.id === MSG.active)) MSG.active = null; msgSwapPane(); }
    if (MSG.active) await msgLoadList(true);
  } catch (e) {
    MSG.err = /tidak ditemukan|schema cache|does not exist|relation/i.test(e.message || '')
      ? 'Fitur pesan belum aktif di database. Jalankan ulang schema.sql di Supabase, lalu muat ulang halaman.' : netErr(e);
    const th = document.getElementById('msg-threads'); if (th && msgStaff()) th.innerHTML = `<p class="msg-empty">${apEsc(MSG.err)}</p>`;
    msgPaintList(); return;
  }
  MSG.timer = setInterval(msgTick, 5000);
}

async function msgTick() {
  if (!document.getElementById('msg-root')) { clearInterval(MSG.timer); MSG.timer = null; return; }
  if (document.hidden || MSG.busy) return;
  try {
    if (msgStaff()) await msgLoadThreads();
    await msgLoadList(false);
    MSG.fails = 0;
  } catch (e) { if (++MSG.fails >= 3) { clearInterval(MSG.timer); MSG.timer = null; } }
}

function msgSwapPane() {
  const pane = document.getElementById('msg-pane'), root = document.getElementById('msg-root');
  if (!pane || !msgStaff()) return;
  pane.innerHTML = MSG.active ? msgStaffPane() : msgStaffEmpty();
  root.classList.toggle('has-active', !!MSG.active);
  if (window.lucide) window.lucide.createIcons();
}

function msgOpen(id) {
  playClickTone('pop');
  MSG.active = id; MSG.list = []; MSG.sig = ''; MSG.err = '';
  msgSwapPane(); msgPaintThreads();
  msgLoadList(true).catch(e => { MSG.err = netErr(e); msgPaintList(); });
  const inp = document.getElementById('msg-input'); if (inp && window.innerWidth > 900) inp.focus();
}
function msgBack() { MSG.active = null; msgSwapPane(); msgPaintThreads(); }
function msgFilter(v) { MSG.q = v; msgPaintThreads(); }
function msgSetUnread(on) {
  MSG.onlyUnread = on;
  document.getElementById('msg-f-all')?.classList.toggle('on', !on);
  document.getElementById('msg-f-unread')?.classList.toggle('on', on);
  msgPaintThreads();
}

// Dari modal profil siswa (konselor): langsung buka percakapannya
function openMessageWith(studentId) {
  MSG.active = studentId; MSG.list = []; MSG.sig = '';
  if (typeof closeModal === 'function') closeModal();
  if (state.role === 'counselor') setCounselorTab('messages');
}

// ---------------------------------------------------------------- kirim
function msgGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }
function msgKey(e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); e.target.form.requestSubmit(); } }
function msgChip(i) {
  const list = msgStaff() ? MSG_CHIPS_STAFF : MSG_CHIPS_STUDENT, inp = document.getElementById('msg-input');
  if (!inp) return;
  inp.value = list[i]; msgGrow(inp); inp.focus();
}

async function msgSend(e) {
  e.preventDefault();
  const inp = document.getElementById('msg-input');
  const text = (inp?.value || '').trim();
  if (!text || MSG.busy || !MSG.active) return;
  MSG.busy = true;
  const tmp = { id: 'tmp' + Date.now(), sender_id: apiUser.id, sender_role: apiUser.role === 'siswa' ? 'siswa' : 'konselor', sender_name: apiUser.name, body: text, created_at: new Date().toISOString(), read_at: null, tmp: true };
  MSG.list = [...MSG.list, tmp]; msgPaintList(true);
  inp.value = ''; msgGrow(inp);
  try {
    await api('POST', '/api/messages/' + encodeURIComponent(MSG.active), { body: text });
    playClickTone('success');
    MSG.sig = '';
    await msgLoadList(true);
    if (msgStaff()) msgLoadThreads().catch(() => {});
  } catch (err) {
    MSG.list = MSG.list.filter(m => m !== tmp); msgPaintList(true);
    inp.value = text; msgGrow(inp);
    showToast(/tidak ditemukan|schema cache|does not exist|relation/i.test(err.message || '') ? 'Fitur pesan belum aktif di database (jalankan ulang schema.sql).' : netErr(err), 'red');
  } finally { MSG.busy = false; inp.focus(); }
}

// Kartu "umpan balik terbaru" di beranda siswa: pesan terakhir dari konselor
async function msgFillHomeCard() {
  const box = document.getElementById('home-feedback');
  if (!box || !apiUser || apiUser.role !== 'siswa') return;
  try {
    const rows = await api('GET', '/api/messages/me');
    const last = rows.filter(m => m.sender_role !== 'siswa').pop();
    if (!last) return;
    box.innerHTML = `<div class="flex items-center justify-between mb-3"><span class="ap-chip">${apEsc(last.sender_name || 'Guru BK')}</span><span class="text-[12px] font-semibold text-[rgb(107,102,93)]">${msgDay(last.created_at)}, ${msgClock(last.created_at)}</span></div>
      <p class="ap-quote">${apEsc(last.body)}</p>
      <button class="ed-link mt-4" onclick="setStudentTab('messages')">Balas pesan ${edIcon('arrow', 14)}</button>`;
  } catch (e) { /* tetap tampilkan teks bawaan */ }
}
