
    // =========================================================================
    // QUICK LOGIN / ROLE SELECTOR MODAL
    // =========================================================================
    let authRole = null, authMode = 'login';
    const ROLE_INFO = {
      siswa:    { icon: '🎓', title: 'Siswa',    desc: 'Refleksi, kuis, strategi belajar & tantangan XP' },
      konselor: { icon: '🤝', title: 'Konselor', desc: 'Pantau siswa, beri umpan balik & kelola materi' },
      admin:    { icon: '🛡️', title: 'Admin',    desc: 'Kelola akun, tips & kode registrasi' }
    };
    const AUTH_NOTE = 'Synapsia adalah media edukasi dan refleksi diri, bukan pengganti konseling profesional.';
    const showModal = () => document.getElementById('modal-backdrop').classList.remove('hidden');

    function openLoginModal(role) {
      playClickTone('pop');
      authMode = 'login';
      if (role && ROLE_INFO[role]) { authRole = role; renderAuthForm(); } else { authRole = null; renderRolePicker(); }
      showModal();
    }

    // Langkah 1: pilih peran
    function renderRolePicker() {
      document.getElementById('modal-content').innerHTML = `
        <button onclick="closeModal()" aria-label="Tutup" class="sr-x">✕</button>
        <div class="sr-card">
          <img class="sr-logo" src="logo.png" alt="Logo Konselor" width="72" height="72">
          <h3 class="sr-h">Masuk sebagai siapa?</h3>
          <p class="sr-sub">Pilih peranmu untuk melanjutkan.</p>
          <div class="sr-roles">
            ${Object.entries(ROLE_INFO).map(([k, r]) => `
            <button type="button" class="sr-role" onclick="pickAuthRole('${k}')">
              <span class="sr-ico">${r.icon}</span>
              <span class="sr-txt"><b>${r.title}</b><small>${r.desc}</small></span>
              <span class="sr-arr" aria-hidden="true">›</span>
            </button>`).join('')}
          </div>
          <p class="sr-note">${AUTH_NOTE}</p>
        </div>`;
    }

    // Langkah 2: nama pengguna & kata sandi
    function pickAuthRole(r) { playClickTone('pop'); authRole = r; authMode = 'login'; renderAuthForm(); }
    function setAuthMode(m) { authMode = m; renderAuthForm(); }
    function renderAuthForm() {
      const info = ROLE_INFO[authRole], reg = authMode === 'register';
      const f = (id, label, attrs) => `<label class="sr-lbl">${label}<input id="${id}" class="sr-in" ${attrs}></label>`;
      const tab = (m, t) => `<button type="button" onclick="setAuthMode('${m}')" class="${authMode === m ? 'on' : ''}">${t}</button>`;
      document.getElementById('modal-content').innerHTML = `
        <button onclick="closeModal()" aria-label="Tutup" class="sr-x">✕</button>
        <div class="sr-card">
          <img class="sr-logo still" src="logo.png" alt="Logo Konselor" width="72" height="72">
          <button type="button" class="sr-back" onclick="openLoginModal()">‹ Ganti peran</button>
          <div class="sr-badge">${info.icon}&nbsp; ${info.title}</div>
          ${authRole === 'admin' ? '' : `<div class="sr-tabs">${tab('login', 'Masuk')}${tab('register', 'Daftar')}</div>`}
          <form onsubmit="submitAuth(event)" novalidate>
            ${reg ? f('au-name', 'Nama lengkap', 'required maxlength="60" autocomplete="name"') : ''}
            ${reg && authRole === 'siswa' ? f('au-kelas', 'Kelas', 'maxlength="30" placeholder="Contoh: XI IPA 2"') : ''}
            ${reg && authRole === 'konselor' ? f('au-code', 'Kode registrasi konselor', 'required autocomplete="off" placeholder="Diberikan oleh admin BK"') : ''}
            ${f('au-user', authRole === 'admin' ? 'Nama pengguna atau email' : 'Nama pengguna', `required autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="60"${reg ? ' placeholder="contoh: budi.santoso"' : ''}`)}
            ${reg ? '<p class="sr-note" style="margin:-.2rem 0 .5rem">Dipakai untuk masuk. Huruf kecil, angka, titik, atau garis bawah, tanpa spasi.</p>' : ''}
            ${f('au-pass', 'Kata sandi', `type="password" required minlength="8" autocomplete="${reg ? 'new-password' : 'current-password'}"`)}
            <p id="au-err" role="alert" class="sr-err"></p>
            <button id="au-submit" class="duo-btn duo-btn-primary w-full">${reg ? 'DAFTAR' : 'MASUK'}</button>
          </form>
          <p class="sr-note">${AUTH_NOTE}</p>
        </div>`;
      setTimeout(() => { const el = document.getElementById(reg ? 'au-name' : 'au-user'); if (el) el.focus(); }, 30);
    }

    async function submitAuth(e) {
      e.preventDefault();
      const v = id => (document.getElementById(id)?.value || '').trim();
      const err = document.getElementById('au-err'), btn = document.getElementById('au-submit');
      const reg = authMode === 'register', password = document.getElementById('au-pass').value;
      if (!v('au-user') || !password) { err.textContent = 'Isi nama pengguna dan kata sandi.'; return; }
      err.textContent = ''; err.style.color = ''; btn.disabled = true;
      try {
        const j = await api('POST', reg ? '/api/register' : '/api/login', reg
          ? { role: authRole, name: v('au-name'), kelas: v('au-kelas'), code: v('au-code'), username: v('au-user'), password }
          : { role: authRole, username: v('au-user'), password });
        apiToken = j.token; apiUser = j.user;
        try { sessionStorage.setItem('synapsia_token', apiToken); } catch (x) {}
        state.role = SCREEN_ROLE[apiUser.role];
        closeModal();
        await loadFromServer();
        playClickTone('success'); showToast('Selamat datang, ' + apiUser.name.split(' ')[0] + '!', 'green');
        renderApp(); window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (x) { err.style.color = x.status === 202 ? '#2e7d32' : ''; err.textContent = netErr(x); btn.disabled = false; }
    }


        function closeModal() {
      const mv = document.querySelector('#modal-content video'); if (mv) mv.pause();
      document.getElementById('modal-backdrop').classList.add('hidden');
    }

    function closeModalOnBackdrop(e) {
      if (e.target.id === 'modal-backdrop') {
        closeModal();
      }
    }
