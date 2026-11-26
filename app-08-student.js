
    // =========================================================================
    // STUDENT DASHBOARD VIEW
    // =========================================================================
    const STUDENT_HEADS = {
      reflection: ['REFLEKSI HARIAN', 'Catat <em>Perasaanmu</em>', 'Luangkan satu menit untuk memahami suasana hati dan tantanganmu hari ini.'],
      explore: ['JELAJAH STRATEGI', 'Strategi <em>Belajar</em>', 'Teknik praktis yang disusun konselor untuk membantumu belajar dengan tenang.'],
      quiz: ['KUIS INTERAKTIF', 'Kenali <em>Dirimu</em>', 'Skenario singkat untuk melatih keputusan yang sehat.'],
      challenges: ['TANTANGAN HARIAN', 'Bangun <em>Kebiasaan</em>', 'Misi kecil setiap hari untuk menjaga streak dan rencana aksimu.'],
      tips: ['TIPS KONSELOR', 'Saran <em>Praktis</em>', 'Catatan singkat dari tim BK seputar belajar, stres, dan masa depan.']
    };

    function renderStudentDashboard() {
      const s = state.currentStudent;
      if (state.studentTab === 'messages') return renderMessagesView();
      const completedChallenges = state.challenges.filter(c => c.completed).length;
      const levelProgress = Math.min(100, Math.round((s.xp % 500) / 500 * 100));
      const first = apEsc(String(s.name || '').split(' ')[0] || 'Kamu');
      const home = state.studentTab === 'home';
      const h = STUDENT_HEADS[state.studentTab];
      const eyebrow = home ? `PORTAL SISWA — ${apEsc(s.kelas || '')} — LEVEL ${s.level}` : h[0];
      const title = home ? `Halo, <em>${first}</em>` : h[1];
      const lead = home ? 'Lanjutkan perjalanan pengembangan dirimu hari ini.' : h[2];

      return `
        <section class="ap-page">
          <div class="ap-head">
            <div>
              <p class="ap-eyebrow">${eyebrow}</p>
              <h1 class="ap-h1">${title}</h1>
              <p class="ap-lead">${lead}</p>
            </div>
            ${home ? `
            <div class="ap-glass ap-xp p-5 sm:min-w-[340px]">
              <div class="flex items-center justify-between text-[11px] font-bold tracking-[.14em] mb-2.5">
                <span class="text-[rgb(107,102,93)]">TARGET HARIAN XP</span>
                <span class="text-[rgb(140,98,57)]">${s.xp % 500} / 500 XP</span>
              </div>
              <div class="w-full h-[8px] bg-[rgb(24,24,23)]/[.1] rounded-full overflow-hidden mb-3.5">
                <div class="h-full bg-[rgb(140,98,57)] rounded-full transition-all duration-500" style="width: ${levelProgress}%"></div>
              </div>
              <div class="flex items-center justify-between text-[12px] font-semibold text-[rgb(107,102,93)]">
                <span>Tantangan: ${completedChallenges}/${state.challenges.length} selesai</span>
                <span class="text-[rgb(110,75,42)] font-bold">🔥 ${s.streak} hari streak</span>
              </div>
            </div>` : ''}
          </div>
          ${renderStudentTabContent()}
        </section>
      `;
    }

    function renderStudentTabContent() {
      switch (state.studentTab) {
        case 'reflection':
          return renderStudentReflectionTab();
        case 'explore':
          return renderStudentExploreTab();
        case 'quiz':
          return renderStudentQuizTab();
        case 'challenges':
          return renderStudentChallengesTab();
        case 'tips':
          return renderStudentTipsTab();
        case 'messages':
          return renderMessagesView();
        case 'home':
        default:
          return renderStudentHomeTab();
      }
    }

    // 1. STUDENT HOME TAB (2-Column Duolingo Panel Grid)
    function renderStudentHomeTab() {
      return `
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-9">
          <!-- Panel Left: Misi & Menu Utama -->
          <div class="min-w-0">
            <div class="duo-section-label">JALUR BELAJAR & REFLEKSI</div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onclick="setStudentTab('reflection')" class="duo-card p-5 cursor-pointer flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="w-11 h-11 rounded-full bg-[rgb(140,98,57)]/[.15] text-[rgb(140,98,57)] flex items-center justify-center text-xl">📝</span>
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[rgb(140,98,57)]/[.12] text-[rgb(140,98,57)]">+40 XP</span>
                  </div>
                  <h3 class="font-feather text-[25px] leading-[1.1] text-[rgb(24,24,23)] mb-1.5">Refleksi Diri</h3>
                  <p class="text-[13px] text-[rgb(107,102,93)] leading-[1.5]">Catat perasaan, tingkat stres, dan hal yang kamu syukuri hari ini.</p>
                </div>
                <div class="mt-4 pt-3 border-t border-[rgb(230,225,216)] flex items-center justify-between text-[12px] font-bold uppercase">
                  <span class="text-[rgb(160,154,143)]">${state.reflections.length} JURNAL</span>
                  <span class="text-[rgb(140,98,57)]">ISI JURNAL →</span>
                </div>
              </div>

              <div onclick="setStudentTab('quiz')" class="duo-card p-5 cursor-pointer flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="w-11 h-11 rounded-full bg-[rgb(103,122,96)]/[.15] text-[rgb(103,122,96)] flex items-center justify-center text-xl">🎯</span>
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[rgb(103,122,96)]/[.12] text-[rgb(103,122,96)]">INTERAKTIF</span>
                  </div>
                  <h3 class="font-feather text-[25px] leading-[1.1] text-[rgb(24,24,23)] mb-1.5">Kuis Regulasi Diri</h3>
                  <p class="text-[13px] text-[rgb(107,102,93)] leading-[1.5]">Latih pengambilan keputusan sehat melalui skenario pilihan ganda.</p>
                </div>
                <div class="mt-4 pt-3 border-t border-[rgb(230,225,216)] flex items-center justify-between text-[12px] font-bold uppercase">
                  <span class="text-[rgb(160,154,143)]">${state.quizQuestions.length} SOAL</span>
                  <span class="text-[rgb(103,122,96)]">MULAI KUIS →</span>
                </div>
              </div>

              <div onclick="setStudentTab('explore')" class="duo-card p-5 cursor-pointer flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="w-11 h-11 rounded-full bg-[#b06a50]/[.15] text-[#b06a50] flex items-center justify-center text-xl">🧭</span>
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[#b06a50]/[.12] text-[#b06a50]">POPULAR</span>
                  </div>
                  <h3 class="font-feather text-[25px] leading-[1.1] text-[rgb(24,24,23)] mb-1.5">Eksplorasi Strategi</h3>
                  <p class="text-[13px] text-[rgb(107,102,93)] leading-[1.5]">Pelajari teknik Pomodoro, pernapasan 4-7-8, dan pemetaan karir.</p>
                </div>
                <div class="mt-4 pt-3 border-t border-[rgb(230,225,216)] flex items-center justify-between text-[12px] font-bold uppercase">
                  <span class="text-[rgb(160,154,143)]">${state.strategies.length} MODUL</span>
                  <span class="text-[#b06a50]">PELAJARI →</span>
                </div>
              </div>

              <div onclick="setStudentTab('challenges')" class="duo-card p-5 cursor-pointer flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="w-11 h-11 rounded-full bg-[#c2a05a]/[.2] text-[#7a5c28] flex items-center justify-center text-xl">🏆</span>
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[#c2a05a]/[.2] text-[#7a5c28]">HARIAN</span>
                  </div>
                  <h3 class="font-feather text-[25px] leading-[1.1] text-[rgb(24,24,23)] mb-1.5">Tantangan & Aksi</h3>
                  <p class="text-[13px] text-[rgb(107,102,93)] leading-[1.5]">Centang kebiasaan positif dan pantau target rencana aksimu.</p>
                </div>
                <div class="mt-4 pt-3 border-t border-[rgb(230,225,216)] flex items-center justify-between text-[12px] font-bold uppercase">
                  <span class="text-[rgb(160,154,143)]">TARGET AKTIF</span>
                  <span class="text-[#7a5c28]">LIHAT TARGET →</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel Right: Progres Rencana Aksi & Umpan Balik Konselor -->
          <div class="min-w-0">
            <div class="duo-section-label">PROGRES RENCANA AKSI & CATATAN BK</div>

            <!-- Action Plan Progress Bars -->
            <div class="duo-card-static p-6 flex flex-col gap-4 mb-8">
              ${state.actionPlans.map(ap => {
                const barColor = ap.color === 'green' ? 'bg-[rgb(140,98,57)]' : ap.color === 'blue' ? 'bg-[rgb(103,122,96)]' : 'bg-[#b06a50]';
                return `
                  <div>
                    <div class="flex justify-between text-[13px] font-bold text-[rgb(36,34,31)] mb-1.5">
                      <span>${ap.target}</span>
                      <span class="text-[rgb(107,102,93)] text-[11px] uppercase">${ap.deadline}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="flex-1 h-[8px] bg-[rgb(230,225,216)] rounded-full overflow-hidden">
                        <div class="h-full ${barColor} rounded-full transition-all duration-500" style="width: ${ap.progress}%"></div>
                      </div>
                      <span class="w-[36px] text-right text-[12px] font-extrabold text-[rgb(36,34,31)]">${ap.progress}%</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Latest Counselor Feedback Card -->
            <div class="duo-section-label">UMPAN BALIK TERBARU DARI GURU BK</div>
            <div id="home-feedback" class="duo-card-static p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="ap-chip">PESAN KONSELOR</span>
                <span class="text-[12px] font-semibold text-[rgb(107,102,93)]">${state.reflections[0]?.date || 'Hari ini'}</span>
              </div>
              <p class="ap-quote">${state.reflections[0]?.counselorNote || 'Tetap semangat menjalani proses belajar! Jangan ragu menghubungi ruang BK jika butuh teman berdiskusi.'}</p>
              <button class="ed-link mt-4" onclick="setStudentTab('messages')">Kirim pesan ke guru BK ${edIcon('arrow', 14)}</button>
            </div>
          </div>
        </div>
      `;
    }

    // 2. STUDENT REFLECTION TAB
    function renderStudentReflectionTab() {
      return `
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-9">
          <!-- Form Refleksi -->
          <div class="min-w-0">
            <div class="duo-section-label">JURNAL REFLEKSI HARIAN</div>
            <h2 class="font-feather text-[26px] text-[rgb(140,98,57)] lowercase mb-2">bagaimana perasaanmu hari ini?</h2>
            <p class="text-[14px] text-[rgb(107,102,93)] mb-6">Tuliskan refleksi singkat untuk mendapatkan +40 XP dan bantuan pemantauan dari Guru BK. Suasana hati dan tantangan utama dari refleksi terakhirmu dapat dilihat Guru BK; isi lainnya tetap pribadi.</p>

            <form onsubmit="submitReflection(event)" class="flex flex-col gap-4">
              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Suasana Hati Utama</label>
                <select id="ref-mood" class="duo-input cursor-pointer">
                  <option value="Optimis & Fokus">😊 Optimis & Fokus</option>
                  <option value="Tenang & Bahagia">🌿 Tenang & Bahagia</option>
                  <option value="Lelah Tapi Bertahan">😓 Lelah Tapi Bertahan</option>
                  <option value="Cemas / Tertekan Tugas">😟 Cemas / Tertekan Tugas</option>
                  <option value="Butuh Teman Bicara">💬 Butuh Teman Bicara</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Tingkat Stres Akademik (1 - 5)</label>
                <div class="grid grid-cols-5 gap-2" id="stress-selector">
                  ${[1, 2, 3, 4, 5].map(num => `
                    <label class="cursor-pointer">
                      <input type="radio" name="stressLevel" value="${num}" ${num === 2 ? 'checked' : ''} class="peer hidden">
                      <div class="h-11 rounded-xl border-2 border-[rgb(230,225,216)] peer-checked:border-[rgb(103,122,96)] peer-checked:bg-[rgb(103,122,96)]/[.1] peer-checked:text-[rgb(103,122,96)] flex items-center justify-center font-extrabold text-[15px] transition-all">
                        ${num}
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">Tantangan Terbesar Hari Ini</label>
                <textarea id="ref-challenge" required rows="3" placeholder="Ceritakan kendala belajar, pertemanan, atau perencanaan karirmu..." class="w-full p-4 border-2 border-[rgb(230,225,216)] rounded-[12px] text-[15px] font-semibold text-[rgb(36,34,31)] focus:border-[rgb(103,122,96)] outline-none"></textarea>
              </div>

              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-[1px] text-[rgb(160,154,143)] mb-2">1 Hal yang Kamu Syukuri</label>
                <input id="ref-gratitude" required type="text" placeholder="Contoh: Berhasil menyelesaikan PR tepat waktu" class="duo-input">
              </div>

              <div class="pt-2">
                <button type="submit" class="duo-btn duo-btn-primary w-full sm:w-auto">
                  SIMPAN REFLEKSI (+40 XP)
                </button>
              </div>
            </form>
          </div>

          <!-- Riwayat Refleksi -->
          <div class="min-w-0">
            <div class="duo-section-label">RIWAYAT REFLEKSI SAYA (${state.reflections.length})</div>

            <div class="flex flex-col gap-4">
              ${state.reflections.map(ref => `
                <div class="duo-card-static p-5">
                  <div class="flex items-center justify-between gap-2 mb-2.5">
                    <span class="px-3 py-1 rounded-full text-[12px] font-extrabold uppercase bg-[rgb(140,98,57)]/[.12] text-[rgb(140,98,57)]">
                      ${ref.mood}
                    </span>
                    <span class="text-[12px] font-bold text-[rgb(160,154,143)]">${ref.date} • Stres ${ref.stressLevel}/5</span>
                  </div>
                  <p class="text-[14px] font-bold text-[rgb(36,34,31)] mb-1.5">${ref.mainChallenge}</p>
                  <p class="text-[13px] text-[rgb(107,102,93)] mb-3">✨ Syukur: ${ref.gratitude}</p>
                  <div class="p-3 rounded-xl bg-[#f1ede5] text-[12px] font-semibold text-[rgb(36,34,31)]">
                    <strong class="text-[rgb(103,122,96)] uppercase">Catatan Guru BK:</strong> ${ref.counselorNote}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    function submitReflection(e) {
      e.preventDefault();
      const mood = document.getElementById('ref-mood').value;
      const stressLevel = document.querySelector('input[name="stressLevel"]:checked')?.value || 2;
      const mainChallenge = document.getElementById('ref-challenge').value.trim();
      const gratitude = document.getElementById('ref-gratitude').value.trim();

      if (!mainChallenge || !gratitude) return;

      const newRef = {
        id: 'ref-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        mood,
        stressLevel: Number(stressLevel),
        mainChallenge,
        gratitude,
        counselorNote: 'Terima kasih sudah berbagi refleksi! Guru BK telah menerima catatanmu.'
      };

      state.reflections.unshift(newRef);
      state.currentStudent.xp += 40;
      saveState();
      playClickTone('success');
      showToast('🎉 Refleksi tersimpan! Kamu mendapatkan +40 XP', 'green');
      renderApp();
    }

    // 3. STUDENT EXPLORE STRATEGIES TAB
    function renderStudentExploreTab() {
      const badgeStyles = {
        green: 'text-[rgb(140,98,57)] bg-[rgb(140,98,57)]/[.1]',
        blue: 'text-[rgb(103,122,96)] bg-[rgb(103,122,96)]/[.1]',
        golden: 'text-[#7a5c28] bg-[#c2a05a]/[.2]',
        orange: 'text-[#b06a50] bg-[#b06a50]/[.15]'
      };

      return `
        <div class="min-w-0">
          <div class="duo-section-label">EKSPLORASI STRATEGI BELAJAR & PENGEMBANGAN DIRI</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${state.strategies.map(item => `
              <div class="duo-card overflow-hidden flex flex-col justify-between">
                <div>
                  <img src="${item.image}" alt="${item.title}" class="w-full h-[170px] object-cover ${apLegacyImg(item.image) ? 'ap-img-legacy' : ''}">
                  <div class="p-5">
                    <span class="inline-block px-3 py-[4px] rounded-full text-[11px] font-extrabold uppercase ${badgeStyles[item.tagColor] || badgeStyles.green}">
                      ${item.tag}
                    </span>
                    <h3 class="font-feather text-[26px] leading-[1.1] text-[rgb(24,24,23)] mt-3 mb-2">${item.title}</h3>
                    <p class="text-[14px] text-[rgb(107,102,93)] leading-[1.55]">${item.description}</p>
                  </div>
                </div>
                <div class="px-5 py-3.5 border-t border-[rgb(230,225,216)] flex items-center justify-between">
                  <span class="text-[12px] font-bold uppercase text-[rgb(160,154,143)]">${item.units}</span>
                  <button onclick="openStrategyModal('${item.id}')" class="duo-btn duo-btn-primary duo-btn-sm">
                    ${item.actionText}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    function openStrategyModal(strategyId) {
      const item = state.strategies.find(s => s.id === strategyId);
      if (!item) return;
      playClickTone('pop');

      const modalContent = document.getElementById('modal-content');
      modalContent.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <span class="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase bg-[rgb(140,98,57)]/[.12] text-[rgb(140,98,57)]">${item.units}</span>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-[#f1ede5] flex items-center justify-center font-bold text-[rgb(107,102,93)] hover:text-black">✕</button>
        </div>
        <img src="${item.image}" alt="${item.title}" class="w-full h-[160px] object-cover rounded-xl mb-4" onerror="this.src='https://placehold.co/600x260/58CC02/FFFFFF?text=Selfora+BK'">
        <h3 class="font-feather text-[24px] text-[rgb(36,34,31)] mb-2">${item.title}</h3>
        <p class="text-[14px] text-[rgb(107,102,93)] mb-4">${item.description}</p>
        <div class="p-4 rounded-xl bg-[rgb(140,98,57)]/[.08] border-2 border-[rgb(140,98,57)]/[.2] text-[15px] font-semibold text-[rgb(36,34,31)] leading-[1.6] mb-6">
          ${item.content}
        </div>
        <div class="flex justify-end gap-3">
          <button onclick="completeStrategy('${item.id}')" class="duo-btn duo-btn-primary">
            TANDAI SELESAI (+30 XP)
          </button>
        </div>
      `;
      document.getElementById('modal-backdrop').classList.remove('hidden');
    }

    function completeStrategy(id) {
      state.currentStudent.xp += 30;
      saveState();
      closeModal();
      playClickTone('success');
      showToast('🌟 Modul selesai! +30 XP ditambahkan', 'green');
      renderApp();
    }

    // 4. STUDENT INTERACTIVE QUIZ TAB (Duolingo Option Cards & Validation Banner)
    function renderStudentQuizTab() {
      const qState = state.quizState;
      const total = state.quizQuestions.length;
      const progressPct = qState.completed ? 100 : Math.round((qState.currentIndex / total) * 100);

      if (qState.completed) {
        return `
          <div class="max-w-2xl mx-auto py-12 px-5 text-center">
            <div class="duo-card-static p-8">
              <div class="text-5xl mb-4">🏆</div>
              <h2 class="font-feather text-[32px] text-[rgb(140,98,57)] lowercase mb-2">kuis selesai!</h2>
              <p class="text-[16px] text-[rgb(107,102,93)] mb-6">
                Kamu menjawab benar <strong class="text-[rgb(36,34,31)]">${qState.score} dari ${total}</strong> pertanyaan dan memperoleh bonus XP!
              </p>
              <div class="flex flex-wrap justify-center gap-3">
                <button onclick="resetQuiz()" class="duo-btn duo-btn-primary">
                  ULANGI KUIS
                </button>
                <button onclick="setStudentTab('home')" class="duo-btn duo-btn-secondary">
                  KEMBALI KE BERANDA
                </button>
              </div>
            </div>
          </div>
        `;
      }

      const currentQ = state.quizQuestions[qState.currentIndex];
      const isCorrect = qState.isChecked && qState.selectedOption === currentQ.correctIndex;

      return `
        <div class="max-w-3xl mx-auto py-8 px-5">
          <!-- Top Quiz Progress Bar -->
          <div class="flex items-center gap-4 mb-8">
            <button onclick="setStudentTab('home')" class="text-[rgb(160,154,143)] hover:text-[rgb(36,34,31)] font-extrabold text-lg">✕</button>
            <div class="flex-1 h-[14px] bg-[rgb(230,225,216)] rounded-[7px] overflow-hidden">
              <div class="h-full bg-[rgb(140,98,57)] rounded-[7px] transition-all duration-500" style="width: ${progressPct}%"></div>
            </div>
            <span class="text-[13px] font-extrabold text-[rgb(140,98,57)]">${qState.currentIndex + 1}/${total}</span>
          </div>

          <div class="duo-section-label">PERTANYAAN ${qState.currentIndex + 1}</div>
          <h2 class="text-[20px] sm:text-[24px] font-extrabold text-[rgb(36,34,31)] leading-[1.4] mb-6">
            ${currentQ.question}
          </h2>

          <!-- Options -->
          <div class="flex flex-col gap-3 mb-8">
            ${currentQ.options.map((opt, idx) => {
              let cls = 'quiz-option flex items-center gap-3.5 font-bold text-[15px] text-[rgb(36,34,31)]';
              if (qState.isChecked) {
                if (idx === currentQ.correctIndex) cls += ' correct';
                else if (idx === qState.selectedOption) cls += ' wrong';
              } else if (qState.selectedOption === idx) {
                cls += ' selected';
              }

              return `
                <div onclick="selectQuizOption(${idx})" class="${cls}">
                  <span class="w-8 h-8 rounded-lg border-2 border-current flex items-center justify-center text-[13px] font-extrabold shrink-0">
                    ${String.fromCharCode(65 + idx)}
                  </span>
                  <span>${opt}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Validation Banner & Action Button -->
          ${qState.isChecked ? `
            <div class="p-5 rounded-2xl mb-6 ${isCorrect ? 'bg-[rgb(140,98,57)]/[.15] text-[rgb(110,75,42)]' : 'bg-[#b24a40]/[.15] text-[#b24a40]'}">
              <div class="flex items-center gap-2 font-extrabold text-[17px] mb-1">
                <span>${isCorrect ? '✅ Jawaban Tepat!' : '❌ Kurang Tepat'}</span>
              </div>
              <p class="text-[14px] font-semibold text-[rgb(36,34,31)]">${currentQ.explanation}</p>
            </div>
            <div class="flex justify-end">
              <button onclick="nextQuizQuestion()" class="duo-btn ${isCorrect ? 'duo-btn-primary' : 'duo-btn-danger'} w-full sm:w-auto">
                LANJUTKAN
              </button>
            </div>
          ` : `
            <div class="flex justify-end">
              <button onclick="checkQuizAnswer()" ${qState.selectedOption === null ? 'disabled' : ''} class="duo-btn duo-btn-primary w-full sm:w-auto">
                PERIKSA JAWABAN
              </button>
            </div>
          `}
        </div>
      `;
    }

    function selectQuizOption(idx) {
      if (state.quizState.isChecked) return;
      playClickTone('pop');
      state.quizState.selectedOption = idx;
      saveState();
      renderApp();
    }

    function checkQuizAnswer() {
      const qState = state.quizState;
      if (qState.selectedOption === null || qState.isChecked) return;
      const currentQ = state.quizQuestions[qState.currentIndex];
      qState.isChecked = true;
      if (qState.selectedOption === currentQ.correctIndex) {
        qState.score += 1;
        state.currentStudent.xp += 25;
        playClickTone('success');
      } else {
        playClickTone('error');
      }
      saveState();
      renderApp();
    }

    function nextQuizQuestion() {
      const qState = state.quizState;
      if (qState.currentIndex + 1 < state.quizQuestions.length) {
        qState.currentIndex += 1;
        qState.selectedOption = null;
        qState.isChecked = false;
      } else {
        qState.completed = true;
        playClickTone('success');
      }
      saveState();
      renderApp();
    }

    function resetQuiz() {
      state.quizState = {
        currentIndex: 0,
        selectedOption: null,
        isChecked: false,
        score: 0,
        completed: false
      };
      saveState();
      renderApp();
    }

    // 5. STUDENT CHALLENGES & ACTION PLAN TAB (Toggles, Progress Bars, Checklist)
    function renderStudentChallengesTab() {
      return `
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-9">
          <!-- Tantangan Harian -->
          <div class="min-w-0">
            <div class="duo-section-label">TANTANGAN KEBIASAAN POSITIF</div>
            <div class="flex flex-col gap-3">
              ${state.challenges.map(ch => `
                <div onclick="toggleChallenge('${ch.id}')" class="duo-card p-4 cursor-pointer flex items-center justify-between gap-4 ${ch.completed ? 'border-[rgb(140,98,57)] bg-[rgb(140,98,57)]/[.05]' : ''}">
                  <div class="flex items-center gap-3.5">
                    <div class="w-7 h-7 rounded-lg border-2 flex items-center justify-center font-extrabold text-sm ${
                      ch.completed ? 'bg-[rgb(140,98,57)] border-[rgb(140,98,57)] text-white' : 'border-[rgb(230,225,216)] text-transparent'
                    }">✓</div>
                    <div>
                      <div class="text-[15px] font-bold ${ch.completed ? 'line-through text-[rgb(107,102,93)]' : 'text-[rgb(36,34,31)]'}">${ch.title}</div>
                      <span class="text-[11px] font-extrabold uppercase text-[rgb(160,154,143)]">${ch.category}</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[#c2a05a]/[.2] text-[#7a5c28] shrink-0">
                    +${ch.xp} XP
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Rencana Aksi & Preferensi -->
          <div class="min-w-0">
            <div class="duo-section-label">RENCANA AKSI PRIBADI</div>
            <div class="flex flex-col gap-4 mb-8">
              ${state.actionPlans.map(ap => `
                <div class="duo-card-static p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[14px] font-bold text-[rgb(36,34,31)]">${ap.target}</span>
                    <button onclick="boostActionPlan('${ap.id}')" class="duo-btn duo-btn-ghost duo-btn-sm">+10%</button>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-[8px] bg-[rgb(230,225,216)] rounded-full overflow-hidden">
                      <div class="h-full bg-[rgb(140,98,57)] rounded-[6px] transition-all duration-500" style="width: ${ap.progress}%"></div>
                    </div>
                    <span class="w-[36px] text-right text-[12px] font-extrabold text-[rgb(36,34,31)]">${ap.progress}%</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Duolingo-Style Toggle Switches -->
            <div class="duo-section-label">PENGATURAN PENGALAMAN BELAJAR</div>
            <div class="flex flex-wrap items-center gap-6">
              <div onclick="togglePreference('soundEffects')" class="flex items-center gap-3 cursor-pointer select-none">
                <div class="duo-toggle ${state.currentStudent.soundEffects ? 'checked' : ''}">
                  <div class="duo-toggle-thumb"></div>
                </div>
                <span class="text-[14px] font-semibold text-[rgb(36,34,31)]">Sound effects</span>
              </div>

              <div onclick="togglePreference('animations')" class="flex items-center gap-3 cursor-pointer select-none">
                <div class="duo-toggle ${state.currentStudent.animations ? 'checked' : ''}">
                  <div class="duo-toggle-thumb"></div>
                </div>
                <span class="text-[14px] font-semibold text-[rgb(36,34,31)]">Animations</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function toggleChallenge(id) {
      const ch = state.challenges.find(c => c.id === id);
      if (!ch) return;
      ch.completed = !ch.completed;
      if (ch.completed) {
        state.currentStudent.xp += ch.xp;
        playClickTone('success');
        showToast(`🔥 Tantangan selesai! +${ch.xp} XP`, 'green');
      } else {
        state.currentStudent.xp = Math.max(0, state.currentStudent.xp - ch.xp);
        playClickTone('pop');
      }
      saveState();
      renderApp();
    }

    function boostActionPlan(id) {
      const ap = state.actionPlans.find(a => a.id === id);
      if (!ap) return;
      ap.progress = Math.min(100, ap.progress + 10);
      state.currentStudent.xp += 15;
      playClickTone('success');
      showToast('📈 Progres rencana aksi diperbarui!', 'blue');
      saveState();
      renderApp();
    }

    function togglePreference(key) {
      state.currentStudent[key] = !state.currentStudent[key];
      saveState();
      playClickTone('pop');
      renderApp();
    }

    // 6. STUDENT TIPS & FEEDBACK TAB
    function renderStudentTipsTab() {
      return `
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-9">
          <div class="min-w-0">
            <div class="duo-section-label">TIPS HARIAN BIMBINGAN KONSELING</div>
            <div class="flex flex-col gap-4">
              ${state.tipsList.map(tip => `
                <div class="duo-card-static p-5">
                  <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[rgb(103,122,96)]/[.12] text-[rgb(103,122,96)] mb-2">${tip.category}</span>
                  <h3 class="text-[16px] font-extrabold text-[rgb(36,34,31)] mb-1">${tip.title}</h3>
                  <p class="text-[14px] text-[rgb(107,102,93)] leading-[1.55]">${tip.body}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="min-w-0">
            <div class="duo-section-label">PENGINGAT HARIAN & KONSULTASI</div>
            <h3 class="font-feather text-[24px] text-[rgb(140,98,57)] lowercase mb-2">dapatkan pengingat refleksi</h3>
            <p class="text-[14px] text-[rgb(107,102,93)] mb-5">Masukkan email sekolahmu untuk menerima rangkuman tips mingguan dari tim BK.</p>

            <form onsubmit="subscribeTips(event)" class="flex flex-col sm:flex-row gap-3 mb-8">
              <input id="subscribe-email" type="email" required placeholder="nama.siswa@sekolah.sch.id" value="${state.currentStudent.emailSubscribe || ''}" class="duo-input flex-1">
              <button type="submit" class="duo-btn duo-btn-primary shrink-0">SUBSCRIBE</button>
            </form>

            <div class="duo-card-static p-5 bg-[#b06a50]/[.08] border-[#b06a50]/[.3]">
              <h4 class="text-[15px] font-extrabold text-[rgb(36,34,31)] mb-1">Butuh Konseling Tatap Muka?</h4>
              <p class="text-[13px] text-[rgb(107,102,93)] mb-4">Ruang BK terbuka setiap Senin–Jumat pukul 07.30 – 15.00 WIB dengan kerahasiaan terjamin.</p>
              <button onclick="showToast('📅 Permintaan jadwal konseling telah dikirim ke Guru BK!', 'blue')" class="duo-btn duo-btn-blue duo-btn-sm">
                AJUKAN JADWAL KONSELING
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function subscribeTips(e) {
      e.preventDefault();
      const val = document.getElementById('subscribe-email').value.trim();
      if (!val) return;
      state.currentStudent.emailSubscribe = val;
      state.currentStudent.dailyGoalSubscribed = true;
      saveState();
      playClickTone('success');
      showToast('✅ Berhasil berlangganan tips mingguan Synapsia!', 'green');
    }
