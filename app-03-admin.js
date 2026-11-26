
    // =========================================================================
    // ADMIN, WHATSAPP, MOTION
    // =========================================================================
    const admEsc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    let WA_NUMBER = '';
    async function loadConfig() {
      try { WA_NUMBER = (await api('GET', '/api/config')).whatsapp || ''; updateWa(); } catch (e) {}
    }
    function updateWa() {
      if (typeof syncWaLinks === 'function') syncWaLinks();
      const a = document.getElementById('wa-fab'); if (!a) return;
      const show = WA_NUMBER.length >= 9 && (state.role === 'student' || state.role === 'landing');
      a.style.display = show ? 'inline-flex' : 'none';
      if (show) a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Halo Kak, saya siswa pengguna Synapsia dan ingin berkonsultasi.');
    }
    let rvObs = null;
    function initMotion() {
      if (!('IntersectionObserver' in window)) return;
      rvObs = rvObs || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rvObs.unobserve(e.target); } }), { rootMargin: '0px 0px -60px 0px' });
      document.querySelectorAll('#app-root .duo-card:not(.rv)').forEach(el => { el.classList.add('rv'); rvObs.observe(el); });
    }

    function renderNavbar() {
      renderNavbarBase();
      const act = document.getElementById('navbar-action-area');
      if (state.role === 'admin') {
        document.getElementById('navbar-role-badge').textContent = 'ADMIN';
        document.getElementById('mobile-nav-bar').classList.remove('hidden');
        const tabs = [{ id: 'summary', label: 'Ringkasan' }, { id: 'tips', label: 'Tips' }, { id: 'account', label: 'Akun' }];
        const btns = tabs.map(t => `<button onclick="setAdminTab('${t.id}')" class="px-3.5 py-2 rounded-xl text-[13px] font-bold uppercase tracking-[0.5px] transition-colors ${(state.adminTab || 'summary') === t.id ? 'text-[rgb(140,98,57)] bg-[rgb(140,98,57)]/[.12]' : 'text-[rgb(107,102,93)] hover:text-[rgb(140,98,57)]'}">${t.label}</button>`).join('');
        document.getElementById('navbar-links').innerHTML = btns;
        document.getElementById('mobile-nav-links').innerHTML = btns;
        act.innerHTML = `<button onclick="switchRole('counselor')" class="hidden sm:inline-flex duo-btn duo-btn-secondary duo-btn-sm">MODE KONSELOR</button><button onclick="adminLogout()" class="duo-btn duo-btn-ghost duo-btn-sm">KELUAR</button>`;
      } else if (state.role === 'counselor' && apiUser && apiUser.role === 'admin') {
        act.insertAdjacentHTML('afterbegin', `<button onclick="switchRole('admin')" class="hidden sm:inline-flex duo-btn duo-btn-primary duo-btn-sm">PANEL ADMIN</button>`);
      }
    }
    function setAdminTab(t) { state.adminTab = t; saveState(); renderApp(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    function adminLogout() { return logout(); }
    function requestAdminAccess() { switchRole('admin'); }
    function requestCounselorAccess() { switchRole('counselor'); }
    async function adminRefresh() {
      const [sts, users] = await Promise.all([api('GET', '/api/students'), api('GET', '/api/admin/users')]);
      state.studentsData = sts.map(fixStudent); state.adminUsers = users;
    }
    async function adminDeleteUser(id) {
      if (!confirm('Hapus akun ini beserta seluruh datanya? Tindakan ini tidak bisa dibatalkan.')) return;
      try { await api('DELETE', '/api/admin/users/' + encodeURIComponent(id)); await adminRefresh(); renderApp(); showToast('Akun dihapus.'); }
      catch (e) { showToast(netErr(e), 'red'); }
    }
    function adminAddTip(e) {
      e.preventDefault();
      const g = id => document.getElementById(id).value.trim();
      state.tipsList = [...(state.tipsList || []), { id: 'tip-' + Date.now(), category: g('tp-cat').toUpperCase(), title: g('tp-title'), body: g('tp-body') }];
      saveState(); renderApp(); showToast('Tips ditambahkan.');
    }
    function adminDeleteTip(id) {
      if (!confirm('Hapus tips ini?')) return;
      state.tipsList = state.tipsList.filter(t => t.id !== id); saveState(); renderApp(); showToast('Tips dihapus.');
    }
    async function adminChangeCode(e) {
      e.preventDefault();
      const code = document.getElementById('new-ccode').value;
      try { await api('POST', '/api/admin/counselor-code', { code }); document.getElementById('new-ccode').value = ''; showToast('Kode registrasi konselor diganti.'); }
      catch (err) { showToast(netErr(err), 'red'); }
    }
    async function adminSaveWa(e) {
      e.preventDefault();
      const wa = document.getElementById('cfg-wa').value.replace(/\D/g, '');
      try { await api('POST', '/api/admin/whatsapp', { whatsapp: wa }); WA_NUMBER = wa; updateWa(); showToast('Nomor WhatsApp disimpan.'); }
      catch (err) { showToast(netErr(err), 'red'); }
    }
    function renderAdminDashboard() {
      const tab = state.adminTab || 'summary';
      const users = state.adminUsers || [], sts = state.studentsData || [];
      const stat = (n, l) => `<div class="duo-card p-6"><div class="font-feather text-[52px] leading-none text-[rgb(24,24,23)]">${n}</div><div class="text-[12px] font-semibold tracking-[.06em] text-[rgb(107,102,93)] mt-2">${l}</div></div>`;
      const h = t => `<div class="ap-sec">${String(t).toUpperCase()}</div>`;
      const inp = 'border border-[#d9d3c8] rounded-2xl h-12 px-4 font-semibold w-full bg-white';
      const row = (name, sub, id, badge) => `<div class="duo-card p-4 flex items-center justify-between gap-3"><div><b>${admEsc(name)}</b>${badge ? ` <span class="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[rgb(140,98,57)]/[.12] text-[rgb(110,75,42)]">${admEsc(badge)}</span>` : ''}<div class="text-[12px] text-[rgb(107,102,93)]">${admEsc(sub)}</div></div>${id ? `<button onclick="adminDeleteUser('${admEsc(id)}')" class="duo-btn duo-btn-ghost duo-btn-sm">HAPUS</button>` : ''}</div>`;
      let body = '';
      if (tab === 'summary') {
        body = `<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">${stat(sts.length, 'Siswa')}${stat(users.filter(u => u.role === 'konselor').length, 'Konselor')}${stat((state.strategies || []).length, 'Strategi')}${stat((state.tipsList || []).length, 'Tips')}</div>
          ${h('daftar siswa')}<div class="flex flex-col gap-3">${sts.length ? sts.map(st => row(st.name, `${st.kelas} · progres ${st.progress}%`, st.id)).join('') : '<p class="text-[13px] text-[rgb(107,102,93)]">Belum ada siswa yang mendaftar.</p>'}</div>
          <p class="text-[13px] text-[rgb(107,102,93)] mt-6">Untuk mengubah strategi belajar, buka <b>Mode Konselor</b> lalu tab Kelola Materi.</p>`;
      } else if (tab === 'tips') {
        body = `${h('tambah tips')}<form onsubmit="adminAddTip(event)" class="duo-card p-5 flex flex-col gap-3 mb-8"><input id="tp-cat" required maxlength="30" class="${inp}" placeholder="Kategori, mis. AKADEMIK"><input id="tp-title" required maxlength="80" class="${inp}" placeholder="Judul tips"><textarea id="tp-body" required maxlength="400" rows="3" class="border-2 border-[rgb(230,225,216)] rounded-xl p-4 font-bold w-full" placeholder="Isi tips"></textarea><button class="duo-btn duo-btn-primary">TAMBAH TIPS</button></form>
          ${h('semua tips')}<div class="flex flex-col gap-3">${(state.tipsList || []).map(t => `<div class="duo-card p-4 flex items-start justify-between gap-3"><div><div class="text-[11px] font-extrabold tracking-[1px] text-[rgb(110,75,42)]">${admEsc(t.category)}</div><b>${admEsc(t.title)}</b><div class="text-[13px] text-[rgb(107,102,93)]">${admEsc(t.body)}</div></div><button onclick="adminDeleteTip('${admEsc(t.id)}')" class="duo-btn duo-btn-ghost duo-btn-sm">HAPUS</button></div>`).join('')}</div>`;
      } else {
        body = `${h('kode registrasi konselor')}<form onsubmit="adminChangeCode(event)" class="duo-card p-5 flex flex-col gap-3 max-w-xl mb-8"><p class="text-[13px] text-[rgb(107,102,93)]">Kode ini diberikan ke konselor/guru BK yang mendaftar akun. Minimal 8 karakter. Kode lama tidak berlaku lagi.</p><input id="new-ccode" type="text" required minlength="8" autocomplete="off" class="${inp}" placeholder="Kode registrasi baru"><button class="duo-btn duo-btn-primary">SIMPAN KODE</button></form>
          ${h('semua akun')}<div class="flex flex-col gap-3">${users.map(u => row(u.name, shownId(u.email), u.role === 'admin' ? '' : u.id, u.role)).join('')}</div>
          ${h('nomor whatsapp bk')}<form onsubmit="adminSaveWa(event)" class="duo-card p-5 flex flex-col gap-3 max-w-xl mt-8"><p class="text-[13px] text-[rgb(107,102,93)]">Tombol "Chat WhatsApp BK" muncul untuk siswa. Format internasional tanpa +, spasi, atau 0 di depan. Kosongkan untuk menyembunyikan tombol.</p><input id="cfg-wa" inputmode="numeric" value="${admEsc(WA_NUMBER)}" class="${inp}" placeholder="6281234567890"><button class="duo-btn duo-btn-primary">SIMPAN NOMOR</button></form>`;
      }
      const heads = {
        summary: ['PANEL ADMIN — RINGKASAN', 'Ringkasan <em>Sekolah</em>', 'Gambaran pengguna dan materi yang ada di Synapsia.'],
        tips: ['PANEL ADMIN — TIPS', 'Kelola <em>Tips</em>', 'Tambah atau hapus tips konselor yang tampil di portal siswa.'],
        account: ['PANEL ADMIN — AKUN', 'Akun &amp; <em>Pengaturan</em>', 'Kode registrasi konselor, daftar akun, dan nomor WhatsApp BK.']
      }[tab] || [];
      return `<section class="ap-page"><div class="ap-head"><div><p class="ap-eyebrow">${heads[0]}</p><h1 class="ap-h1">${heads[1]}</h1><p class="ap-lead">${heads[2]}</p></div></div>${body}</section>`;
    }

