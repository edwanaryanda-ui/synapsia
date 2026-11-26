
    // =========================================================================
    // COUNSELOR DASHBOARD VIEW (Dark Blue Hero + Student Monitoring + CMS)
    // =========================================================================
    function renderCounselorDashboard() {
      const tab = state.counselorTab;
      if (tab === 'messages') return renderMessagesView();
      const all = state.studentsData || [];
      const classes = ['ALL', ...new Set(all.map(st => st.kelas))];
      const filtered = state.selectedClassFilter === 'ALL' ? all : all.filter(st => st.kelas === state.selectedClassFilter);
      const first = apEsc(String(apiUser.name || '').trim().split(/\s+/).slice(0, 2).join(' ') || 'Konselor');

      const heads = {
        overview: ['PORTAL KONSELOR — BIMBINGAN KONSELING', `Halo, <em>${first}</em>`, 'Pantau perkembangan siswa, tindak lanjuti yang membutuhkan pendampingan, dan balas pesan mereka.'],
        students: ['PEMANTAUAN SISWA', 'Daftar <em>Siswa</em>', 'Lihat capaian, suasana hati, dan beri umpan balik untuk setiap siswa.'],
        content: ['KELOLA MATERI', 'Materi <em>Strategi</em>', 'Tambah atau hapus modul strategi belajar yang tampil di portal siswa.']
      };
      const h = heads[tab] || heads.overview;

      const pills = (tab === 'content') ? '' : `
        <div class="flex flex-wrap items-center gap-2 mb-8">
          ${classes.map(cls => {
            const active = state.selectedClassFilter === cls;
            return `<button onclick="filterCounselorClass('${apEsc(cls)}')" class="px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${active ? 'bg-[rgb(24,24,23)] text-white' : 'bg-white border border-[#d9d3c8] text-[rgb(36,34,31)] hover:bg-[#f1ede5]'}">${cls === 'ALL' ? 'Semua kelas' : apEsc(cls)}</button>`;
          }).join('')}
        </div>`;

      let body;
      if (tab === 'content') body = renderCounselorContentManager();
      else if (tab === 'students') body = renderCounselorStudentSection(filtered, 'DAFTAR PEMANTAUAN SISWA');
      else body = renderCounselorOverview(filtered);

      return `
        <section class="ap-page">
          <div class="ap-head"><div><p class="ap-eyebrow">${h[0]}</p><h1 class="ap-h1">${h[1]}</h1><p class="ap-lead">${h[2]}</p></div></div>
          ${pills}
          ${body}
        </section>
      `;
    }

    // Ringkasan: angka nyata dari data siswa (bukan angka contoh)
    function renderCounselorOverview(list) {
      const n = list.length;
      const avg = n ? Math.round(list.reduce((t, st) => t + (Number(st.progress) || 0), 0) / n) : 0;
      const attn = list.filter(st => st.status === 'NEED ATTENTION');
      const stat = (num, label, extra = '') => `<div class="duo-card p-6"><div class="font-feather text-[52px] leading-none text-[rgb(24,24,23)]">${num}</div><div class="text-[12px] font-semibold tracking-[.06em] text-[rgb(107,102,93)] mt-2">${label}</div>${extra}</div>`;
      const msgBtn = `<button onclick="apOpenMessages()" class="ed-link mt-3">Buka pesan ${edIcon('arrow', 14)}</button>`;
      return `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          ${stat(n, 'Siswa terpantau')}
          ${stat(avg + '%', 'Rata-rata capaian')}
          ${stat(attn.length, 'Perlu perhatian')}
          ${stat(`<span data-msg-count>${apUnread}</span>`, 'Pesan belum dibaca', msgBtn)}
        </div>
        <div class="ap-sec">PERLU PERHATIAN</div>
        ${attn.length
          ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">${attn.slice(0, 4).map(counselorStudentCard).join('')}</div>`
          : `<div class="duo-card-static p-7 mb-10 text-[14px] text-[rgb(107,102,93)]">Tidak ada siswa yang ditandai perlu perhatian. Kamu bisa menandai siswa lewat tombol “Beri umpan balik” di daftar siswa.</div>`}
        <button onclick="setCounselorTab('students')" class="ed-btn dark">Lihat semua siswa ${edIcon('arrow', 16)}</button>
      `;
    }

    function filterCounselorClass(cls) {
      playClickTone('pop');
      state.selectedClassFilter = cls;
      saveState();
      renderApp();
    }

    function counselorStudentCard(st) {
      const badgeMap = {
        'COMPLETED': 'bg-[rgb(140,98,57)]/[.12] text-[rgb(110,75,42)]',
        'MASTERED': 'bg-[rgb(111,143,95)]/[.18] text-[#3f5a34]',
        'IN PROGRESS': 'bg-[rgb(103,122,96)]/[.14] text-[rgb(80,96,74)]',
        'NEED ATTENTION': 'bg-[#b24a40]/[.12] text-[#8f352d]'
      };
      const barColor = st.status === 'NEED ATTENTION' ? 'bg-[#b24a40]' : st.progress >= 80 ? 'bg-[rgb(140,98,57)]' : 'bg-[rgb(103,122,96)]';
      const av = st.avatar || initialsAvatar(st.name);
      return `
        <div class="duo-card p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-3 mb-5">
              <div class="flex items-center gap-3.5 min-w-0">
                <img src="${av}" alt="" class="w-12 h-12 rounded-full border border-[rgb(230,225,216)] object-cover bg-white shrink-0">
                <div class="min-w-0">
                  <h3 class="font-feather text-[24px] leading-[1.05] text-[rgb(24,24,23)] truncate">${apEsc(st.name)}</h3>
                  <div class="text-[12px] font-semibold text-[rgb(107,102,93)]">${apEsc(st.kelas)} · 🔥 ${st.streak} hari</div>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full text-[10.5px] font-bold tracking-[.05em] whitespace-nowrap ${badgeMap[st.status] || badgeMap['IN PROGRESS']}">${apEsc(st.status)}</span>
            </div>
            <div class="mb-5">
              <div class="flex justify-between text-[11px] font-bold tracking-[.08em] text-[rgb(107,102,93)] mb-1.5"><span>CAPAIAN MODUL & REFLEKSI</span><span class="text-[rgb(24,24,23)]">${st.progress}%</span></div>
              <div class="w-full h-[8px] bg-[rgb(230,225,216)] rounded-full overflow-hidden"><div class="h-full ${barColor} rounded-full" style="width: ${st.progress}%"></div></div>
            </div>
            <div class="p-4 rounded-2xl bg-[#f1ede5] mb-5">
              <div class="text-[11px] font-bold tracking-[.08em] text-[rgb(107,102,93)] mb-1">REFLEKSI TERAKHIR (${apEsc(st.mood)})</div>
              <p class="text-[13.5px] text-[rgb(36,34,31)] leading-[1.55]">“${apEsc(st.lastReflection)}”</p>
            </div>
          </div>
          <div class="pt-4 border-t border-[rgb(230,225,216)] flex items-center justify-between gap-3">
            <span class="text-[12px] text-[rgb(107,102,93)] truncate">${st.counselorFeedback ? 'Catatan: ' + apEsc(st.counselorFeedback) : 'Belum ada catatan'}</span>
            <div class="flex gap-2 shrink-0">
              <button onclick="openMessageWith('${apEsc(st.id)}')" class="duo-btn duo-btn-primary duo-btn-sm">Kirim pesan</button>
              <button onclick="openCounselorStudentModal('${apEsc(st.id)}')" class="duo-btn duo-btn-ghost duo-btn-sm">Catatan</button>
            </div>
          </div>
        </div>`;
    }

    function renderCounselorStudentSection(students, label) {
      return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div class="ap-sec !mb-0 flex-1">${label} (${students.length})</div>
          <button onclick="setCounselorTab('content')" class="duo-btn duo-btn-primary duo-btn-sm">+ Tambah modul strategi</button>
        </div>
        ${students.length ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-5">${students.map(counselorStudentCard).join('')}</div>` : '<div class="duo-card-static p-7 text-[14px] text-[rgb(107,102,93)]">Belum ada siswa yang cocok.</div>'}
      `;
    }

    function openCounselorStudentModal(studentId) {
      const st = state.studentsData.find(s => s.id === studentId);
      if (!st) return;
      playClickTone('pop');

      const modalContent = document.getElementById('modal-content');
      modalContent.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[rgb(103,122,96)]/[.12] text-[rgb(103,122,96)]">${st.kelas}</span>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-[#f1ede5] flex items-center justify-center font-bold text-[rgb(107,102,93)]">✕</button>
        </div>
        <h3 class="font-feather text-[24px] text-[rgb(36,34,31)] mb-1">${st.name}</h3>
        <p class="text-[13px] font-bold text-[rgb(107,102,93)] mb-4">Suasana Hati: ${st.mood}</p>

        <div class="p-4 rounded-xl bg-[#f1ede5] mb-5">
          <div class="text-[11px] font-extrabold uppercase text-[rgb(160,154,143)] mb-1">Isi Refleksi Siswa</div>
          <p class="text-[14px] font-semibold text-[rgb(36,34,31)]">"${st.lastReflection}"</p>
        </div>

        <form onsubmit="saveCounselorFeedback(event, '${st.id}')" class="flex flex-col gap-4">
          <div>
            <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Status Pendampingan</label>
            <select id="modal-st-status" class="duo-input">
              <option value="COMPLETED" ${st.status === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
              <option value="IN PROGRESS" ${st.status === 'IN PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
              <option value="NEED ATTENTION" ${st.status === 'NEED ATTENTION' ? 'selected' : ''}>NEED ATTENTION</option>
              <option value="MASTERED" ${st.status === 'MASTERED' ? 'selected' : ''}>MASTERED</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Catatan & Saran Guru BK</label>
            <textarea id="modal-st-feedback" rows="3" required class="w-full p-3.5 border-2 border-[rgb(230,225,216)] rounded-xl text-[14px] font-semibold text-[rgb(36,34,31)] focus:border-[rgb(103,122,96)] outline-none">${st.counselorFeedback}</textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="openMessageWith('${st.id}')" class="duo-btn duo-btn-ghost duo-btn-sm mr-auto">Kirim pesan</button>
            <button type="button" onclick="closeModal()" class="duo-btn duo-btn-ghost duo-btn-sm">Batal</button>
            <button type="submit" class="duo-btn duo-btn-primary duo-btn-sm">Simpan catatan</button>
          </div>
        </form>
      `;
      document.getElementById('modal-backdrop').classList.remove('hidden');
    }

    async function saveCounselorFeedback(e, studentId) {
      e.preventDefault();
      const st = state.studentsData.find(s => s.id === studentId);
      if (!st) return;
      const status = document.getElementById('modal-st-status').value;
      const feedback = document.getElementById('modal-st-feedback').value.trim();
      try { await api('PUT', '/api/students/' + encodeURIComponent(studentId) + '/note', { status, feedback }); }
      catch (err) { return showToast(netErr(err), 'red'); }
      st.status = status; st.counselorFeedback = feedback;
      closeModal();
      playClickTone('success');
      showToast('✅ Umpan balik konselor berhasil diperbarui!', 'green');
      renderApp();
    }

    // COUNSELOR CONTENT MANAGER TAB
    function renderCounselorContentManager() {
      return `
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-9">
          <!-- Form Tambah Modul Strategi -->
          <div class="min-w-0">
            <div class="duo-section-label">TAMBAH MODUL STRATEGI BARU</div>
            <form onsubmit="addNewStrategy(event)" class="flex flex-col gap-4">
              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Judul Modul</label>
                <input id="new-strat-title" type="text" required placeholder="Contoh: Mengatasi Kecemasan Ujian" class="duo-input">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Label Badge</label>
                  <select id="new-strat-tag" class="duo-input">
                    <option value="NEW|green">NEW (Hijau)</option>
                    <option value="POPULAR|blue">POPULAR (Biru)</option>
                    <option value="SUPER|golden">SUPER (Emas)</option>
                    <option value="PRO|orange">PRO (Oranye)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Jumlah Unit</label>
                  <input id="new-strat-units" type="text" required value="4 MODUL" class="duo-input">
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Deskripsi Singkat</label>
                <input id="new-strat-desc" type="text" required placeholder="Ringkasan manfaat modul untuk siswa" class="duo-input">
              </div>

              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Isi Materi / Panduan Praktis</label>
                <textarea id="new-strat-content" rows="3" required placeholder="Langkah-langkah praktis yang dapat langsung diterapkan siswa..." class="w-full p-3.5 border-2 border-[rgb(230,225,216)] rounded-xl text-[14px] font-semibold text-[rgb(36,34,31)] focus:border-[rgb(103,122,96)] outline-none"></textarea>
              </div>

              <div>
                <button type="submit" class="duo-btn duo-btn-primary">
                  PUBLIKASIKAN MODUL
                </button>
              </div>
            </form>
          </div>

          <!-- Daftar Modul Aktif -->
          <div class="min-w-0">
            <div class="duo-section-label">MODUL AKTIF DI PORTAL SISWA (${state.strategies.length})</div>
            <div class="flex flex-col gap-3">
              ${state.strategies.map(item => `
                <div class="duo-card-static p-4 flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[11px] font-extrabold uppercase text-[rgb(140,98,57)]">${item.tag}</span>
                      <span class="text-[11px] font-bold text-[rgb(160,154,143)]">• ${item.units}</span>
                    </div>
                    <h4 class="text-[15px] font-extrabold text-[rgb(36,34,31)]">${item.title}</h4>
                    <p class="text-[12px] text-[rgb(107,102,93)] line-clamp-1">${item.description}</p>
                  </div>
                  ${state.strategies.length > 1 ? `
                    <button onclick="deleteStrategy('${item.id}')" class="duo-btn duo-btn-danger duo-btn-sm shrink-0">
                      HAPUS
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    function addNewStrategy(e) {
      e.preventDefault();
      const title = document.getElementById('new-strat-title').value.trim();
      const [tag, tagColor] = document.getElementById('new-strat-tag').value.split('|');
      const units = document.getElementById('new-strat-units').value.trim().toUpperCase();
      const description = document.getElementById('new-strat-desc').value.trim();
      const content = document.getElementById('new-strat-content').value.trim();

      state.strategies.unshift({
        id: 'strat-' + Date.now(),
        tag,
        tagColor,
        title,
        description,
        units,
        actionText: 'MULAI',
        image: BANNERS.pomodoro,
        content
      });

      saveState();
      playClickTone('success');
      showToast('🎉 Modul baru berhasil ditambahkan ke portal siswa!', 'green');
      renderApp();
    }

    function deleteStrategy(id) {
      state.strategies = state.strategies.filter(s => s.id !== id);
      saveState();
      playClickTone('error');
      showToast('🗑️ Modul dihapus', 'red');
      renderApp();
    }
