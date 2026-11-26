// =========================================================================
// LANDING VIEW: editorial minimal (kaca, krem, arang, aksen tanah)
// =========================================================================
const ED_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4';
const ED_FEATURES = [
  { title: 'Refleksi Harian', icon: '📝', tone: 'linear-gradient(135deg,#e2cfb2,#b98e5f)', desc: 'Catat suasana hati dan tantanganmu, lalu pahami pola perasaanmu dari hari ke hari.' },
  { title: 'Jelajah Strategi', icon: '🧭', tone: 'linear-gradient(135deg,#d3d9cb,#8f9f86)', desc: 'Teknik belajar seperti Pomodoro dan strategi praktis yang disusun konselor BK.' },
  { title: 'Kuis Interaktif', icon: '✨', tone: 'linear-gradient(135deg,#ddd3e3,#9c8bb0)', desc: 'Kenali minat, kebiasaan belajar, dan kekuatanmu lewat kuis singkat yang seru.' },
  { title: 'Tantangan Harian', icon: '🎯', tone: 'linear-gradient(135deg,#ecd0c4,#c1806a)', desc: 'Misi kecil setiap hari untuk membangun kebiasaan baik dan menjaga streak-mu.' },
  { title: 'Tips Konselor', icon: '💡', tone: 'linear-gradient(135deg,#ebe2bd,#c2ad63)', desc: 'Saran singkat yang mudah dipraktikkan seputar belajar, stres, dan masa depan.' }
];
const EI = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>',
  heart: '<path d="M12 20.5s-8-5-8-10.700A4.600 4.600 0 0 1 12 7a4.600 4.600 0 0 1 8 2.800c0 5.700-8 10.700-8 10.700z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  ur: '<path d="M7 17L17 7M8 7h9v9"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.500"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.500c.7.7 1 1.500 1 2.500h6c0-1 .3-1.800 1-2.500A6 6 0 0 0 12 3z"/>'
};
const edIcon = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${EI[n]}</svg>`;
const ED_SCENE = `<svg class="ed-scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="edsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6ddd0"/><stop offset=".6" stop-color="#f2d8bb"/><stop offset="1" stop-color="#f7e8d4"/></linearGradient>
    <radialGradient id="edsun" cx=".72" cy=".5" r=".45"><stop offset="0" stop-color="#fff4d9" stop-opacity=".95"/><stop offset="1" stop-color="#fff4d9" stop-opacity="0"/></radialGradient>
    <linearGradient id="edlk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9cfae"/><stop offset="1" stop-color="#9c8a76"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#edsk)"/><rect width="1600" height="900" fill="url(#edsun)"/>
  <path d="M0 520L200 390 360 470 560 290 760 480 960 350 1180 500 1400 400 1600 520V900H0z" fill="#b9ad9c" opacity=".55"/>
  <path d="M0 600L170 520 340 590 560 440 780 590 1000 470 1240 600 1440 520 1600 610V900H0z" fill="#978a78" opacity=".8"/>
  <rect y="650" width="1600" height="250" fill="url(#edlk)"/><ellipse cx="1150" cy="700" rx="220" ry="14" fill="#fff4d9" opacity=".55"/>
  <path d="M0 700L260 640 520 690 800 650 1100 700 1400 660 1600 700V900H0z" fill="#6e6152"/>
  <g fill="#4d4439"><path d="M1380 640l26-90 26 90zM1430 650l22-78 22 78zM1340 650l20-66 20 66z"/><path d="M60 700l30-100 30 100zM120 710l24-84 24 84z"/></g>
</svg>`;

let edIdx = 0;

function renderLanding() {
  const f = ED_FEATURES[edIdx], n = (k) => (state[k] || []).length;
  const stat = (ico, num, label) => `<div class="ed-stat">${edIcon(ico, 26)}<b>${num}</b><span>${label}</span></div>`;
  return `
  <div class="ed">
    <div class="ed-frame">
      <div class="ed-bg">${ED_SCENE}<video class="ed-vid" autoplay muted loop playsinline preload="metadata" src="${ED_VIDEO}"></video><div class="ed-ov"></div></div>

      <header class="ed-top">
        <button class="ed-brand" onclick="edGo('top')" aria-label="Beranda Synapsia"><img src="logo-sm.png" alt="" width="34" height="34"><span>SYNAPSIA</span></button>
        <nav class="ed-nav" aria-label="Navigasi utama">
          <button class="on" onclick="edGo('top')">Beranda</button><button onclick="edGo('fitur')">Fitur</button><button onclick="edGo('peran')">Peran</button><button onclick="edGo('tentang')">Tentang</button><button onclick="edGo('kontak')">Kontak</button>
        </nav>
        <div class="ed-top-r">
          <button class="ed-round" aria-label="Masuk" title="Masuk" onclick="openLoginModal()">${edIcon('user', 18)}</button>
          <button class="ed-cta" onclick="openLoginModal()">Mulai Sekarang<span>${edIcon('arrow', 18)}</span></button>
        </div>
      </header>

      <aside class="ed-dock" aria-label="Pintasan">
        <button class="on" title="Beranda" aria-label="Beranda" onclick="edGo('top')">${edIcon('home')}</button>
        <button title="Fitur" aria-label="Fitur" onclick="edGo('fitur')">${edIcon('grid')}</button>
        <button title="Tentang" aria-label="Tentang" onclick="edGo('tentang')">${edIcon('doc')}</button>
        <button title="Peran" aria-label="Peran" onclick="edGo('peran')">${edIcon('heart')}</button>
        <a data-wa title="Chat WhatsApp BK" aria-label="Chat WhatsApp BK" target="_blank" rel="noopener" onclick="if(!this.href)edGo('kontak')">${edIcon('chat')}</a>
        <img src="logo-sm.png" alt="" class="ed-dock-av">
        <button class="ed-intro" onclick="openIntro()" aria-label="Lihat intro"><span>${edIcon('play', 16)}</span>Lihat<br>Intro</button>
      </aside>

      <section class="ed-hero">
        <p class="ed-eyebrow ed-rise">REFLEKSI — KONSELING — PERTUMBUHAN</p>
        <h1 class="ed-rise" style="--d:.08s">Pelan-pelan,<br>Terima <em>Dirimu</em></h1>
        <p class="ed-lead ed-rise" style="--d:.16s">Ruang refleksi dan bimbingan konseling interaktif untuk mengenal diri, mengelola stres belajar, dan merancang masa depanmu.</p>
        <div class="ed-actions ed-rise" style="--d:.24s">
          <button class="ed-btn dark" onclick="edGo('fitur')">Jelajahi Fitur ${edIcon('arrow', 18)}</button>
          <button class="ed-btn ghost" onclick="openIntro()"><span class="ed-play">${edIcon('play', 14)}</span>Lihat Intro</button>
        </div>
      </section>

      <ul class="ed-tags" aria-hidden="true"><li>PERSONAL</li><li>TERARAH</li><li>INTERAKTIF</li><li>AMAN</li></ul>

      <div class="ed-cards">
        <article class="ed-card ed-feat" aria-live="polite">
          <div class="ed-thumb" id="ed-thumb" style="background:${f.tone}"><span id="ed-ico">${f.icon}</span><div class="ed-av"><i>A</i><i>R</i><button onclick="openLoginModal()" aria-label="Coba fitur">+</button></div></div>
          <div class="ed-feat-b">
            <div class="ed-feat-h"><small>FITUR UNGGULAN</small><small id="ed-count">01 / ${String(ED_FEATURES.length).padStart(2, '0')}</small></div>
            <h3 id="ed-title">${f.title}</h3><p id="ed-desc">${f.desc}</p>
            <button class="ed-link" onclick="openLoginModal()">Coba fitur ini ${edIcon('arrow', 14)}</button>
            <div class="ed-feat-f"><span class="ed-dots" id="ed-dots">${ED_FEATURES.map((_, i) => `<i class="${i === edIdx ? 'on' : ''}"></i>`).join('')}</span>
              <span class="ed-arrows"><button onclick="edStep(-1)" aria-label="Fitur sebelumnya">${edIcon('left', 16)}</button><button class="dark" onclick="edStep(1)" aria-label="Fitur berikutnya">${edIcon('arrow', 16)}</button></span></div>
          </div>
        </article>
        <article class="ed-card ed-stats">${stat('layers', n('strategies'), 'Strategi Belajar')}${stat('target', n('challenges'), 'Tantangan Harian')}${stat('bulb', n('tipsList'), 'Tips Konselor')}</article>
        <article class="ed-card ed-dark">
          <div class="ed-dark-t"><img src="logo-sm.png" alt="" width="46" height="46"><button onclick="openLoginModal()" aria-label="Mulai">${edIcon('ur', 18)}</button></div>
          <h3>Mulai Perjalanan Refleksimu</h3><p>Daftar gratis. Catatan pribadimu hanya bisa dibaca olehmu.</p>
        </article>
      </div>
    </div>

    <section class="ed-sec" id="ed-tentang"><div class="ed-wrap ed-about">
      <p class="ed-eyebrow">TENTANG SYNAPSIA</p>
      <h2>Ruang aman untuk <em>mengenal diri</em>, kapan pun kamu butuh.</h2>
      <p class="ed-lead">Synapsia menggabungkan refleksi harian, strategi belajar, dan pendampingan konselor BK dalam satu platform. Catatan pribadimu hanya bisa dibaca olehmu; konselor hanya melihat ringkasan progres dan suasana hati.</p>
    </div></section>

    <section class="ed-sec tint" id="ed-fitur"><div class="ed-wrap">
      <p class="ed-eyebrow">FITUR</p><h2>Semua yang kamu perlukan, <em>sederhana</em>.</h2>
      <div class="ed-grid5">${ED_FEATURES.map((x, i) => `<article class="ed-fcard"><span>${String(i + 1).padStart(2, '0')}</span><div class="ed-fico">${x.icon}</div><h3>${x.title}</h3><p>${x.desc}</p></article>`).join('')}</div>
    </div></section>

    <section class="ed-sec" id="ed-peran"><div class="ed-wrap">
      <p class="ed-eyebrow">PERAN</p><h2>Satu platform, <em>tiga peran</em>.</h2>
      <div class="ed-grid3">
        <article class="ed-role"><h3>Siswa</h3><p>Refleksi, kuis, tantangan, dan tips untuk tumbuh setiap hari.</p><button class="ed-btn dark" onclick="openLoginModal('siswa')">Masuk sebagai Siswa ${edIcon('arrow', 16)}</button></article>
        <article class="ed-role"><h3>Konselor</h3><p>Pantau ringkasan siswa, beri umpan balik, dan kelola strategi belajar.</p><button class="ed-btn dark" onclick="openLoginModal('konselor')">Masuk sebagai Konselor ${edIcon('arrow', 16)}</button></article>
        <article class="ed-role"><h3>Admin</h3><p>Kelola akun, tips, kode registrasi, dan pengaturan website.</p><button class="ed-btn dark" onclick="openLoginModal('admin')">Masuk sebagai Admin ${edIcon('arrow', 16)}</button></article>
      </div>
    </div></section>

    <footer class="ed-foot" id="ed-kontak"><div class="ed-wrap">
      <h2>Butuh bicara <em>langsung</em>?</h2>
      <p>Hubungi konselor BK melalui WhatsApp untuk jadwal konsultasi.</p>
      <a class="ed-btn light" data-wa target="_blank" rel="noopener" hidden>Chat WhatsApp BK ${edIcon('arrow', 16)}</a>
      <small>© 2026 Synapsia. Media edukasi dan refleksi diri, bukan pengganti layanan konseling profesional.</small>
    </div></footer>
  </div>`;
}

function edGo(id) {
  if (id === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' });
  const el = document.getElementById('ed-' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function edStep(dir) {
  edIdx = (edIdx + dir + ED_FEATURES.length) % ED_FEATURES.length;
  const f = ED_FEATURES[edIdx], card = document.querySelector('.ed-feat-b'), th = document.getElementById('ed-thumb');
  if (!card || !th) return;
  card.classList.add('swap'); th.classList.add('swap');
  setTimeout(() => {
    document.getElementById('ed-title').textContent = f.title;
    document.getElementById('ed-desc').textContent = f.desc;
    document.getElementById('ed-count').textContent = String(edIdx + 1).padStart(2, '0') + ' / ' + String(ED_FEATURES.length).padStart(2, '0');
    document.getElementById('ed-ico').textContent = f.icon;
    th.style.background = f.tone;
    document.querySelectorAll('#ed-dots i').forEach((d, i) => d.classList.toggle('on', i === edIdx));
    card.classList.remove('swap'); th.classList.remove('swap');
  }, 180);
  if (typeof playClickTone === 'function') playClickTone('pop');
}

function openIntro() {
  document.getElementById('modal-content').innerHTML = `
    <button onclick="closeModal()" aria-label="Tutup" class="sr-x">✕</button>
    <h3 class="sr-h" style="margin-bottom:.8rem">Kenalan dengan Synapsia</h3>
    <video controls autoplay playsinline src="${ED_VIDEO}" style="width:100%;border-radius:16px;background:#000"></video>`;
  showModal();
}

function syncWaLinks() {
  const ok = typeof WA_NUMBER === 'string' && WA_NUMBER.length >= 9;
  document.querySelectorAll('[data-wa]').forEach(a => {
    if (ok) { a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Halo Kak, saya ingin berkonsultasi lewat Synapsia.'); a.hidden = false; }
    else { a.removeAttribute('href'); if (a.classList.contains('ed-btn')) a.hidden = true; }
  });
}

function initLanding() {
  if (!document.querySelector('.ed')) return;
  syncWaLinks();
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.ed-sec .ed-wrap > *, .ed-fcard, .ed-role').forEach(el => { el.classList.add('ed-reveal'); io.observe(el); });
}
