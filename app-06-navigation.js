
    // =========================================================================
    // NAVIGATION & ROLE SWITCHING
    // =========================================================================
    function switchRole(newRole) {
      playClickTone('pop');
      if (newRole === 'landing' && apiUser) newRole = SCREEN_ROLE[apiUser.role];   // sudah masuk: kembali ke dashboard sendiri
      if (newRole !== 'landing') {
        const allowed = !apiUser ? [] : apiUser.role === 'admin' ? ['admin', 'counselor'] : [SCREEN_ROLE[apiUser.role]];
        if (!allowed.includes(newRole)) { openLoginModal(API_ROLE[newRole]); return; }   // belum masuk / bukan perannya
      }
      state.role = newRole;
      saveState();
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setStudentTab(tab) {
      playClickTone('pop');
      state.studentTab = tab;
      saveState();
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setCounselorTab(tab) {
      playClickTone('pop');
      state.counselorTab = tab;
      refreshStudents();
      saveState();
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderNavbarBase() {
      const roleBadge = document.getElementById('navbar-role-badge');
      const navLinks = document.getElementById('navbar-links');
      const mobileNavBar = document.getElementById('mobile-nav-bar');
      const mobileNavLinks = document.getElementById('mobile-nav-links');
      const actionArea = document.getElementById('navbar-action-area');
      const streakEl = document.getElementById('nav-streak-count');

      streakEl.textContent = state.currentStudent.streak;

      if (state.role === 'landing') {
        roleBadge.textContent = 'BIMBINGAN KONSELING';
        mobileNavBar.classList.add('hidden');

        navLinks.innerHTML = `
          <a href="#fitur-utama" class="px-3.5 py-2 rounded-xl text-[13px] font-bold uppercase tracking-[0.5px] text-[rgb(119,119,119)] hover:text-[rgb(140,98,57)] hover:bg-[rgb(140,98,57)]/[.1] transition-colors">Fitur</a>
          <a href="#modul-siswa" class="px-3.5 py-2 rounded-xl text-[13px] font-bold uppercase tracking-[0.5px] text-[rgb(119,119,119)] hover:text-[rgb(140,98,57)] hover:bg-[rgb(140,98,57)]/[.1] transition-colors">Modul Siswa</a>
          <a href="#portal-konselor" class="px-3.5 py-2 rounded-xl text-[13px] font-bold uppercase tracking-[0.5px] text-[rgb(119,119,119)] hover:text-[rgb(140,98,57)] hover:bg-[rgb(140,98,57)]/[.1] transition-colors">Portal Konselor</a>
          <a href="#komponen-ui" class="px-3.5 py-2 rounded-xl text-[13px] font-bold uppercase tracking-[0.5px] text-[rgb(119,119,119)] hover:text-[rgb(140,98,57)] hover:bg-[rgb(140,98,57)]/[.1] transition-colors">Sistem Belajar</a>
        `;

        actionArea.innerHTML = `
          <button onclick="openLoginModal()" class="duo-btn duo-btn-primary duo-btn-sm">
            MULAI
          </button>
        `;
      } else if (state.role === 'student') {
        roleBadge.textContent = 'PORTAL SISWA';
        mobileNavBar.classList.remove('hidden');

        const tabs = [
          { id: 'home', label: 'Beranda' },
          { id: 'reflection', label: 'Refleksi' },
          { id: 'explore', label: 'Strategi' },
          { id: 'quiz', label: 'Kuis' },
          { id: 'challenges', label: 'Tantangan' },
          { id: 'tips', label: 'Tips' }
        ];

        const renderTabButtons = () => tabs.map(t => {
          const active = state.studentTab === t.id;
          return `
            <button onclick="setStudentTab('${t.id}')"
              class="px-3.5 py-2 rounded-xl text-[13px] font-bold uppercase tracking-[0.5px] transition-colors ${
                active
                  ? 'text-[rgb(140,98,57)] bg-[rgb(140,98,57)]/[.12]'
                  : 'text-[rgb(119,119,119)] hover:text-[rgb(140,98,57)] hover:bg-[rgb(140,98,57)]/[.08]'
              }">
              ${t.label}
            </button>
          `;
        }).join('');

        navLinks.innerHTML = renderTabButtons();
        mobileNavLinks.innerHTML = renderTabButtons();

        actionArea.innerHTML = `
          <button onclick="logout()" class="duo-btn duo-btn-ghost duo-btn-sm" title="Keluar ke Beranda">
            KELUAR
          </button>
        `;
      } else if (state.role === 'counselor') {
        roleBadge.textContent = 'GURU BK / KONSELOR';
        mobileNavBar.classList.remove('hidden');

        const tabs = [
          { id: 'overview', label: 'Ringkasan' },
          { id: 'students', label: 'Daftar Siswa' },
          { id: 'content', label: 'Kelola Materi' }
        ];

        const renderTabButtons = () => tabs.map(t => {
          const active = state.counselorTab === t.id;
          return `
            <button onclick="setCounselorTab('${t.id}')"
              class="px-3.5 py-2 rounded-xl text-[13px] font-bold uppercase tracking-[0.5px] transition-colors ${
                active
                  ? 'text-[rgb(140,98,57)] bg-[rgb(140,98,57)]/[.12]'
                  : 'text-[rgb(119,119,119)] hover:text-[rgb(140,98,57)] hover:bg-[rgb(140,98,57)]/[.08]'
              }">
              ${t.label}
            </button>
          `;
        }).join('');

        navLinks.innerHTML = renderTabButtons();
        mobileNavLinks.innerHTML = renderTabButtons();

        actionArea.innerHTML = `
          <button onclick="logout()" class="duo-btn duo-btn-ghost duo-btn-sm">
            KELUAR
          </button>
        `;
      }
    }
