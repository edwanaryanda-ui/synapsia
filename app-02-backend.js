
    // =========================================================================
    // AKUN, LOGIN & SINKRON DATABASE (API ke Supabase)
    // =========================================================================
    const PERSONAL_KEYS = ['reflections', 'challenges', 'actionPlans', 'currentStudent'];
    const API_ROLE = { student: 'siswa', counselor: 'konselor', admin: 'admin' };      // layar -> peran akun
    const SCREEN_ROLE = { siswa: 'student', konselor: 'counselor', admin: 'admin' };   // peran akun -> layar
    const lastSynced = {};
    let syncTimer = null;
    let apiToken = null;
    let apiUser = null;
    let restoring = false;
    // Token memakai sessionStorage: otomatis hilang saat tab ditutup (aman untuk komputer sekolah bersama).
    try { apiToken = sessionStorage.getItem('synapsia_auth') ? 'sb' : null; restoring = !!apiToken; } catch (e) {}

    // ---------- Database: Supabase (menggantikan server.js; antarmuka api() tetap sama) ----------
    const CFG = window.SYNAPSIA_CONFIG || {};
    const sb = (window.supabase && CFG.SUPABASE_URL && !/ISI_/.test(CFG.SUPABASE_URL))
      ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { storage: window.sessionStorage, storageKey: 'synapsia_auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
      : null;
    const ROLE_LABEL = { siswa: 'Siswa', konselor: 'Konselor', admin: 'Admin' };
    const NOTE_STATUS = ['COMPLETED', 'IN PROGRESS', 'NEED ATTENTION', 'MASTERED'];
    const fail = (msg, status) => { const e = new Error(msg); e.status = status; return e; };
    const must = (r, msg) => { if (r.error) throw fail(msg || r.error.message, r.status || 400); return r.data; };
    const group = (rows) => { const o = {}; (rows || []).forEach(r => (o[r.collection] ||= []).push(r.data)); return o; };

    const LOGIN_DOMAIN = String(CFG.LOGIN_DOMAIN || 'synapsia.app').toLowerCase();
    // Nama pengguna -> email internal untuk Supabase Auth. Input yang berisi "@" dipakai apa adanya (akun lama / admin).
    function toLoginEmail(id) {
      id = String(id || '').trim().toLowerCase();
      if (id.includes('@')) return id;
      if (!/^[a-z0-9._-]{3,30}$/.test(id)) throw fail('Nama pengguna 3–30 karakter: huruf kecil, angka, titik, garis bawah, atau strip (tanpa spasi).', 400);
      return id + '@' + LOGIN_DOMAIN;
    }
    const shownId = (email) => String(email || '').toLowerCase().endsWith('@' + LOGIN_DOMAIN) ? String(email).slice(0, -(LOGIN_DOMAIN.length + 1)) : email;
    const NOT_ACTIVE = 'Akun belum aktif karena Supabase masih meminta konfirmasi email. Pengelola perlu mematikan "Confirm email" (lihat README) atau mengonfirmasi akun di Authentication → Users.';

    // Masuk dengan email internal. Akun nama-pengguna tidak punya email sungguhan, jadi jika Supabase menahannya
    // karena "belum dikonfirmasi", minta database mengonfirmasinya otomatis lalu coba lagi (lihat syn_autoconfirm di schema.sql).
    async function signInAuto(email, password) {
      let r = await sb.auth.signInWithPassword({ email, password });
      if (r.error && /not confirmed/i.test(r.error.message || '') && email.endsWith('@' + LOGIN_DOMAIN)) {
        const c = await sb.rpc('syn_autoconfirm', { p_email: email });
        if (c.error) console.error('[Synapsia] syn_autoconfirm gagal (jalankan ulang schema.sql):', c.error);
        else r = await sb.auth.signInWithPassword({ email, password });
      }
      return r;
    }

    async function myProfile() {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw fail('Silakan masuk dulu', 401);
      const readProfile = () => sb.from('syn_profiles').select('id,name,role,kelas').eq('id', session.user.id).maybeSingle();
      let { data, error } = await readProfile();
      if (!error && !data) {
        // Profil belum ada (trigger pendaftaran tidak berjalan): minta database membuatkannya, lalu baca ulang.
        const fix = await sb.rpc('syn_ensure_profile');
        if (fix.error) console.error('[Synapsia] syn_ensure_profile gagal:', fix.error);
        ({ data, error } = await readProfile());
      }
      if (error) {
        console.error('[Synapsia] gagal membaca syn_profiles:', error);
        if (/permission denied|row-level security/i.test(error.message || ''))
          throw fail('Database menolak akses ke tabel syn_profiles. Jalankan ulang schema.sql di Supabase (bagian GRANT) lalu coba lagi.', 403);
        if (/does not exist|schema cache|relation/i.test(error.message || ''))
          throw fail('Tabel syn_profiles tidak ditemukan di project Supabase "' + (String(CFG.SUPABASE_URL || '').replace(/^https?:\/\//, '').split('.')[0]) + '". Pastikan schema.sql dijalankan di project yang SAMA dengan config.js (lihat README, bagian "Tabel tidak ditemukan").', 404);
        throw fail('Gagal membaca profil: ' + error.message, 500);
      }
      if (!data) {
        console.error('[Synapsia] akun ada di Auth tetapi tidak punya baris di syn_profiles:', session.user.email);
        throw fail('Akun ini belum punya profil di database (dibuat sebelum schema.sql dijalankan). Jalankan ulang schema.sql, lalu masuk lagi.', 409);
      }
      return { id: data.id, name: data.name, email: shownId(session.user.email), role: data.role, kelas: data.kelas || '' };
    }

    async function api(method, p, body = {}) {
      if (!sb) throw fail('Isi config.js dengan URL dan key Supabase dulu.', 0);
      let m;

      if (p === '/api/config' && method === 'GET') {
        const r = await sb.from('syn_config').select('value').eq('key', 'whatsapp').maybeSingle();
        return { whatsapp: String((r.data && r.data.value) || '').replace(/\D/g, '') };
      }

      if (p === '/api/register' && method === 'POST') {
        const role = body.role === 'konselor' ? 'konselor' : body.role === 'siswa' ? 'siswa' : null;
        const name = String(body.name || '').trim(), email = toLoginEmail(body.username), pw = String(body.password || '');
        if (!role) throw fail('Peran tidak valid', 400);
        if (name.length < 2) throw fail('Nama minimal 2 karakter', 400);
        if (pw.length < 8) throw fail('Kata sandi minimal 8 karakter', 400);
        const r = await sb.auth.signUp({ email, password: pw, options: { data: { name, role, kelas: role === 'siswa' ? String(body.kelas || '').trim().slice(0, 30) : '', code: String(body.code || '') } } });
        if (r.error) {
          console.error('[Synapsia] daftar gagal:', r.error);
          if (/already|registered/i.test(r.error.message)) throw fail('Nama pengguna sudah dipakai. Pilih yang lain.', 400);
          if (/invalid/i.test(r.error.message) && /email/i.test(r.error.message)) throw fail('Supabase menolak domain internal "' + LOGIN_DOMAIN + '". Ubah LOGIN_DOMAIN di config.js.', 400);
          throw fail(role === 'konselor' ? 'Pendaftaran gagal. Periksa kode registrasi konselor.' : 'Pendaftaran gagal: ' + r.error.message, 400);
        }
        if (r.data.user && Array.isArray(r.data.user.identities) && r.data.user.identities.length === 0)
          throw fail('Nama pengguna sudah dipakai. Pilih yang lain.', 400);
        if (!r.data.session) {
          const li = await signInAuto(email, pw);
          if (li.error) throw fail(NOT_ACTIVE, 400);
        }
        return { token: 'sb', user: await myProfile() };
      }

      if (p === '/api/login' && method === 'POST') {
        const r = await signInAuto(toLoginEmail(body.username), String(body.password || ''));
        if (r.error) {
          const m = r.error.message || '';
          console.error('[Synapsia] login gagal:', r.error);
          if (/not confirmed/i.test(m)) throw fail(NOT_ACTIVE, 400);
          if (/rate limit|too many/i.test(m)) throw fail('Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.', 429);
          if (/invalid api key|apikey/i.test(m)) throw fail('Key Supabase di config.js salah. Salin ulang anon/publishable key dari Project Settings → API.', 401);
          throw fail('Nama pengguna atau kata sandi salah', 401);
        }
        let user;
        try { user = await myProfile(); }
        catch (e) { await sb.auth.signOut(); throw e; }
        if (body.role && body.role !== user.role) {
          await sb.auth.signOut();
          throw fail(`Akun ini terdaftar sebagai ${ROLE_LABEL[user.role]}, bukan ${ROLE_LABEL[body.role] || body.role}. Pilih peran yang sesuai.`, 403);
        }
        return { token: 'sb', user };
      }

      if (p === '/api/logout' && method === 'POST') { await sb.auth.signOut(); return { ok: true }; }
      if (p === '/api/me' && method === 'GET') return { user: await myProfile() };

      if (p === '/api/bootstrap' && method === 'GET') {
        const out = group(must(await sb.from('syn_items').select('collection,data').order('position')));
        const prof = await myProfile().catch(() => null);
        if (prof && prof.role === 'siswa') {
          const mine = group(must(await sb.from('syn_user_items').select('collection,data').order('position')));
          if (mine.currentStudent) { mine.currentStudent = mine.currentStudent[0]; mine.currentStudent.name = prof.name; mine.currentStudent.kelas = prof.kelas; }
          const note = (await sb.from('syn_student_notes').select('feedback').eq('user_id', prof.id).maybeSingle()).data;
          if (note && note.feedback && mine.reflections && mine.reflections[0]) mine.reflections[0].counselorNote = note.feedback;
          Object.assign(out, mine);
        }
        return out;
      }

      if ((m = p.match(/^\/api\/data\/(\w+)$/)) && method === 'PUT') {
        const name = m[1], personal = PERSONAL_KEYS.includes(name);
        if (!personal && !['strategies', 'tipsList'].includes(name)) throw fail('Koleksi tidak dikenal', 404);
        const { data: { session } } = await sb.auth.getSession();
        if (!session) throw fail('Silakan masuk dulu', 401);
        const list = name === 'currentStudent' ? [{ ...body.data, id: 'main' }] : body.data;
        if (!Array.isArray(list) || list.length > 500 || list.some(x => typeof x !== 'object' || x === null)) throw fail('Format data salah', 400);
        const table = personal ? 'syn_user_items' : 'syn_items';
        const rows = list.map((it, i) => ({ collection: name, id: String(it.id ?? (personal ? 'main' : i)), position: i, data: it, ...(personal ? { user_id: session.user.id } : {}) }));
        if (rows.length) must(await sb.from(table).upsert(rows, { onConflict: personal ? 'user_id,collection,id' : 'collection,id' }), 'Gagal menyimpan data');
        let del = sb.from(table).delete().eq('collection', name);
        if (personal) del = del.eq('user_id', session.user.id);
        if (rows.length) del = del.not('id', 'in', '(' + rows.map(r => '"' + r.id.replace(/["\\,()]/g, '') + '"').join(',') + ')');
        must(await del, 'Gagal menyimpan data');
        return { ok: true };
      }

      // ---- Pesan konselor <-> siswa ----
      if (p === '/api/messages/unread' && method === 'GET') return { count: Number(must(await sb.rpc('syn_msg_unread'))) || 0 };
      if (p === '/api/messages/threads' && method === 'GET') return must(await sb.rpc('syn_msg_threads')) || [];
      if ((m = p.match(/^\/api\/messages\/([\w-]+)\/read$/)) && method === 'POST') {
        must(await sb.rpc('syn_msg_mark_read', { p_student: m[1] === 'me' ? null : m[1] }), 'Gagal menandai dibaca');
        return { ok: true };
      }
      if ((m = p.match(/^\/api\/messages\/([\w-]+)$/))) {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) throw fail('Silakan masuk dulu', 401);
        const sid = m[1] === 'me' ? session.user.id : m[1];
        if (method === 'GET') {
          const rows = must(await sb.from('syn_messages').select('id,sender_id,sender_role,sender_name,body,created_at,read_at')
            .eq('student_id', sid).order('created_at', { ascending: false }).limit(200), 'Gagal memuat pesan') || [];
          return rows.slice().reverse();
        }
        if (method === 'POST') {
          const text = String(body.body || '').trim().slice(0, 1500);
          if (!text) throw fail('Tulis pesan dulu', 400);
          const ins = await sb.from('syn_messages').insert({ student_id: sid, body: text });
          if (ins.error) {
            const em = ins.error.message || '';
            console.error('[Synapsia] kirim pesan gagal:', ins.error);
            if (/row-level security|violates row/i.test(em)) throw fail('Pesan ditolak database: akunmu tidak berhak mengirim ke percakapan ini. Pastikan peran akunmu benar (konselor/siswa) dan schema.sql terbaru sudah dijalankan penuh.', 403);
            if (/permission denied/i.test(em)) throw fail('Database menolak akses ke tabel pesan. Jalankan ulang schema.sql (bagian GRANT) di Supabase.', 403);
            if (/column|does not exist|schema cache|relation|null value/i.test(em)) throw fail('Struktur tabel pesan belum sesuai. Jalankan ulang schema.sql terbaru di Supabase. (Detail: ' + em + ')', 500);
            throw fail('Pesan gagal terkirim: ' + em, 500);
          }
          return { ok: true };
        }
      }

      if (p === '/api/students' && method === 'GET') return must(await sb.rpc('syn_student_rows')) || [];
      if ((m = p.match(/^\/api\/students\/([\w-]+)\/note$/)) && method === 'PUT') {
        const status = NOTE_STATUS.includes(body.status) ? body.status : 'IN PROGRESS';
        must(await sb.from('syn_student_notes').upsert({ user_id: m[1], status, feedback: String(body.feedback || '').trim().slice(0, 1000), updated_at: new Date().toISOString() }), 'Gagal menyimpan catatan');
        return { ok: true };
      }

      if (p === '/api/admin/users' && method === 'GET') return must(await sb.rpc('syn_admin_users')) || [];
      if ((m = p.match(/^\/api\/admin\/users\/([\w-]+)$/)) && method === 'DELETE') { must(await sb.rpc('syn_admin_delete_user', { uid: m[1] }), 'Gagal menghapus akun'); return { ok: true }; }
      if (p === '/api/admin/counselor-code' && method === 'POST') {
        const code = typeof body.code === 'string' ? body.code.trim() : '';
        if (code.length < 8) throw fail('Kode minimal 8 karakter', 400);
        must(await sb.from('syn_settings').upsert({ key: 'counselor_code', value: code }), 'Gagal mengganti kode');
        return { ok: true };
      }
      if (p === '/api/admin/whatsapp' && method === 'POST') {
        must(await sb.from('syn_config').upsert({ key: 'whatsapp', value: String(body.whatsapp || '').replace(/\D/g, '') }), 'Gagal menyimpan nomor');
        return { ok: true };
      }
      throw fail('Tidak ditemukan', 404);
    }
    const netErr = (e) => e instanceof TypeError ? 'Database tidak bisa dihubungi. Periksa koneksi internet dan config.js.' : e.message;

    function initialsAvatar(name) {
      const ini = String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase().replace(/[<>&"']/g, '') || '?';
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="26" fill="#8c6239"/><text x="50" y="63" font-family="Arial,sans-serif" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">' + ini + '</text></svg>';
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }
    const fixStudent = (st) => ({ ...st, avatar: st.avatar || initialsAvatar(st.name) });
    const localDate = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    // Data pribadi siswa dimulai KOSONG (bukan data demo)
    function blankPersonal(s, user) {
      s.currentStudent = {
        name: user ? user.name : 'Siswa', nis: '', kelas: user ? user.kelas : '', avatar: initialsAvatar(user ? user.name : '?'),
        xp: 0, level: 1, streak: 0, lastActive: '', soundEffects: true, animations: true, dailyGoalSubscribed: false, emailSubscribe: ''
      };
      s.reflections = [];
      s.challenges = DEFAULT_STATE.challenges.map(c => ({ ...c, completed: false }));
      s.actionPlans = [
        { id: 'ap-1', target: 'Menyusun jadwal belajar mingguan', deadline: 'Minggu Ini', progress: 0, color: 'green' },
        { id: 'ap-2', target: 'Berkonsultasi dengan Guru BK', deadline: 'Bulan Ini', progress: 0, color: 'blue' },
        { id: 'ap-3', target: 'Membaca 1 buku pengembangan diri remaja', deadline: '2 Minggu Lagi', progress: 0, color: 'orange' }
      ];
    }

    function touchStreak() {
      const cs = state.currentStudent, today = localDate();
      if (cs.lastActive === today) return;
      cs.streak = cs.lastActive === localDate(new Date(Date.now() - 86400000)) ? (cs.streak || 0) + 1 : 1;
      cs.lastActive = today;
    }

    async function loadFromServer() {
      try {
        const remote = await api('GET', '/api/bootstrap');
        ['strategies', 'tipsList'].forEach(k => { if (remote[k]) { state[k] = remote[k]; lastSynced[k] = JSON.stringify(remote[k]); } });
        if (apiUser.role === 'siswa') {
          blankPersonal(state, apiUser);
          PERSONAL_KEYS.forEach(k => { if (remote[k]) { state[k] = remote[k]; lastSynced[k] = JSON.stringify(remote[k]); } });
          state.currentStudent = { ...state.currentStudent, name: apiUser.name, kelas: apiUser.kelas };
          touchStreak();
        } else {
          state.studentsData = (await api('GET', '/api/students')).map(fixStudent);
          if (apiUser.role === 'admin') state.adminUsers = await api('GET', '/api/admin/users');
        }
        migrateMedia();
        scheduleSync();
      } catch (e) { showToast(netErr(e), 'red'); }
    }

    async function restoreSession() {
      try { apiUser = (await api('GET', '/api/me')).user; }
      catch (e) { if (e.status === 401) clearAuth(); else showToast(netErr(e), 'red'); restoring = false; return; }
      state.role = SCREEN_ROLE[apiUser.role];
      await loadFromServer();
      restoring = false;
    }

    function clearAuth() {
      apiToken = null; apiUser = null; clearTimeout(syncTimer);
      try { sessionStorage.removeItem('synapsia_token'); } catch (e) {}
      Object.keys(lastSynced).forEach(k => delete lastSynced[k]);
      blankPersonal(state); state.studentsData = []; state.adminUsers = [];
    }

    async function logout() {
      playClickTone('pop');
      try { await doSync(); await api('POST', '/api/logout'); } catch (e) {}
      clearAuth(); state.role = 'landing'; renderApp(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function syncKeys() {
      if (!apiUser) return [];
      return apiUser.role === 'siswa' ? PERSONAL_KEYS : apiUser.role === 'konselor' ? ['strategies'] : ['strategies', 'tipsList'];
    }

    function scheduleSync() { clearTimeout(syncTimer); syncTimer = setTimeout(doSync, 400); }

    async function doSync() {
      clearTimeout(syncTimer);
      for (const k of syncKeys()) {
        if (state[k] === undefined) continue;
        const json = JSON.stringify(state[k]);
        if (json === lastSynced[k]) continue;
        try { await api('PUT', '/api/data/' + k, { data: state[k] }); lastSynced[k] = json; }
        catch (e) {
          if (e.status === 401) { showToast('Sesi habis, silakan masuk lagi.', 'red'); clearAuth(); state.role = 'landing'; renderApp(); return; }
        }
      }
    }

    async function refreshStudents() {
      if (!apiUser || apiUser.role === 'siswa') return;
      try { state.studentsData = (await api('GET', '/api/students')).map(fixStudent); renderApp(); } catch (e) {}
    }

    function migrateMedia() {
      const fixAv = (o) => { if (o && /pexels/.test(o.avatar || '')) { const id = (o.avatar.match(/photos\/(\d+)/) || [])[1]; o.avatar = AVATARS[AVATAR_BY_PEXELS[id]] || AVATARS.alya; } };
      fixAv(state.currentStudent);
      (state.studentsData || []).forEach(fixAv);
      (state.strategies || []).forEach(s => { if (/pexels/.test(s.image || '')) { const id = (s.image.match(/photos\/(\d+)/) || [])[1]; s.image = BANNERS[BANNER_BY_PEXELS[id]] || BANNERS.pomodoro; } });
    }
