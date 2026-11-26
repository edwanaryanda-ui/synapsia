
    // =========================================================================
    // MAIN RENDER LOOP
    // =========================================================================
    function renderApp() {
      if (!apiUser) state.role = 'landing';
      else if (state.role === 'admin' && apiUser.role !== 'admin') state.role = SCREEN_ROLE[apiUser.role];
      const inApp = !!apiUser && state.role !== 'landing' && !restoring;
      document.body.classList.toggle('is-landing', state.role === 'landing' && !restoring);
      document.body.classList.toggle('is-app', inApp);
      renderNavbar();
      const root = document.getElementById('app-root');

      if (restoring) {
        root.innerHTML = '<div class="py-24 text-center font-bold text-[rgb(107,102,93)]">Memuat…</div>';
        return;
      }

      // Simpan posisi gulir area isi (bukan halaman) agar aksi kecil tidak melompat ke atas
      const prevMain = document.getElementById('ap-main');
      const keepTop = prevMain ? prevMain.scrollTop : 0, prevKey = apLastKey;

      if (state.role === 'student') {
        root.innerHTML = renderAppShell(renderStudentDashboard());
      } else if (state.role === 'admin') {
        root.innerHTML = renderAppShell(renderAdminDashboard());
      } else if (state.role === 'counselor') {
        root.innerHTML = renderAppShell(renderCounselorDashboard());
      } else {
        root.innerHTML = renderLanding();
      }

      if (inApp) {
        const mainEl = document.getElementById('ap-main');
        if (mainEl && apKey() === prevKey) mainEl.scrollTop = keepTop;
        apLastKey = apKey();
        apSetUnread(apUnread); apStartPolling();
      } else { apLastKey = ''; apStopPolling(); }

      if (window.lucide) {
        window.lucide.createIcons();
      }
      initMotion(); updateWa(); initLanding();
      if (inApp) { msgInit(); msgFillHomeCard(); }
    }

    window.addEventListener('DOMContentLoaded', async () => {
      migrateMedia();
      renderApp();
      loadConfig();
      if (apiToken) { await restoreSession(); renderApp(); }
    });
  
