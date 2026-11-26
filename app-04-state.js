    const STORAGE_KEY = 'synapsia_ui_v2';   // hanya preferensi tampilan, bukan data pribadi
    const UI_KEYS = ['studentTab', 'counselorTab', 'adminTab', 'selectedClassFilter'];
    try { localStorage.removeItem('selfora_bk_duolingo_v1'); } catch (e) {}   // buang sisa data demo/pribadi lama

    const DEFAULT_STATE = {
      role: 'landing', // 'landing' | 'student' | 'counselor'
      studentTab: 'home', // 'home' | 'reflection' | 'explore' | 'quiz' | 'challenges' | 'tips'
      counselorTab: 'overview', // 'overview' | 'students' | 'content'
      selectedClassFilter: 'ALL',
      currentStudent: {
        name: 'Alya Putri Ramadhani',
        nis: '20251042',
        kelas: 'XI IPA 2',
        avatar: AVATARS.alya,
        xp: 420,
        level: 4,
        streak: 7,
        soundEffects: true,
        animations: true,
        dailyGoalSubscribed: false,
        emailSubscribe: ''
      },
      reflections: [
        {
          id: 'ref-1',
          date: '2026-11-22',
          mood: 'Optimis & Fokus',
          stressLevel: 3,
          mainChallenge: 'Mengatur waktu antara persiapan ujian dan kegiatan ekstrakurikuler.',
          gratitude: 'Teman sebangku dan guru BK yang selalu mendukung.',
          counselorNote: 'Bagus sekali Alya! Coba terapkan teknik Pomodoro 25 menit belajar, 5 menit istirahat.'
        }
      ],
      strategies: [
        {
          id: 'strat-1',
          tag: 'NEW',
          tagColor: 'green',
          title: 'Manajemen Waktu Pomodoro',
          description: 'Tingkatkan fokus belajar tanpa mudah lelah dengan siklus fokus 25 menit dan jeda singkat.',
          units: '4 MODUL',
          actionText: 'MULAI',
          image: BANNERS.pomodoro,
          content: 'Teknik Pomodoro membantu otak tetap segar. Caranya: 1) Pilih 1 tugas utama. 2) Set timer 25 menit. 3) Fokus penuh tanpa distraksi ponsel. 4) Istirahat 5 menit setelah timer berbunyi.'
        },
        {
          id: 'strat-2',
          tag: 'POPULAR',
          tagColor: 'blue',
          title: 'Regulasi Emosi & Mindfulness',
          description: 'Kenali pemicu stres akademik dan kuasai teknik pernapasan 4-7-8 untuk menenangkan pikiran.',
          units: '6 MODUL',
          actionText: 'LANJUTKAN',
          image: BANNERS.emosi,
          content: 'Saat merasa cemas sebelum presentasi atau ujian, tarik napas lewat hidung selama 4 detik, tahan 7 detik, dan hembuskan perlahan lewat mulut selama 8 detik.'
        },
        {
          id: 'strat-3',
          tag: 'SUPER',
          tagColor: 'golden',
          title: 'Eksplorasi Minat & Karir',
          description: 'Temukan potensi jurusan kuliah dan bidang karir yang selaras dengan kepribadian RIASEC-mu.',
          units: '5 MODUL',
          actionText: 'EKSPLORASI',
          image: BANNERS.karir,
          content: 'Pemetaan minat RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) membantu siswa merancang rencana studi pasca-SMA dengan percaya diri.'
        },
        {
          id: 'strat-4',
          tag: 'PRO',
          tagColor: 'orange',
          title: 'Komunikasi Asertif Sebaya',
          description: 'Belajar menyampaikan pendapat dan menolak ajakan negatif secara sopan namun tegas.',
          units: '3 MODUL',
          actionText: 'COBA SEKARANG',
          image: BANNERS.asertif,
          content: 'Gunakan rumus "I-Message": Saya merasa [emosi] ketika [situasi], dan saya berharap [solusi]. Cara ini mencegah konflik dan membangun empati.'
        }
      ],
      quizQuestions: [
        {
          id: 'q1',
          question: 'Ketika kamu merasa kewalahan dengan tugas sekolah yang menumpuk, langkah pertama terbaik menurut prinsip regulasi diri adalah...',
          options: [
            'Menunda semua tugas hingga malam hari agar terpacu adrenalin',
            'Memecah tugas menjadi bagian kecil dan membuat daftar prioritas',
            'Mengerjakan semua tugas sekaligus secara bersamaan (multitasking)',
            'Menghindari tugas dan bermain media sosial seharian'
          ],
          correctIndex: 1,
          explanation: 'Memecah tugas besar menjadi langkah kecil (chunking) mengurangi beban kognitif dan rasa cemas.'
        },
        {
          id: 'q2',
          question: 'Apa yang dimaksud dengan "Growth Mindset" dalam pengembangan diri siswa?',
          options: [
            'Keyakinan bahwa kecerdasan dan bakat bersifat tetap sejak lahir',
            'Menghindari tantangan agar tidak terlihat gagal di depan teman',
            'Keyakinan bahwa kemampuan dapat berkembang melalui usaha, strategi, dan umpan balik',
            'Selalu membandingkan nilai ujian dengan orang lain'
          ],
          correctIndex: 2,
          explanation: 'Growth Mindset memandang kesalahan sebagai bagian alami dari proses belajar dan bertumbuh.'
        },
        {
          id: 'q3',
          question: 'Teknik pernapasan 4-7-8 bermanfaat untuk...',
          options: [
            'Menurunkan detak jantung dan meredakan kecemasan sesaat',
            'Menghafal rumus matematika dalam 4 detik',
            'Menggantikan waktu tidur malam',
            'Meningkatkan tekanan darah saat olahraga'
          ],
          correctIndex: 0,
          explanation: 'Pernapasan ritmis mengaktifkan sistem saraf parasimpatis sehingga tubuh menjadi lebih rileks.'
        }
      ],
      quizState: {
        currentIndex: 0,
        selectedOption: null,
        isChecked: false,
        score: 0,
        completed: false
      },
      challenges: [
        { id: 'ch-1', title: 'Catat 3 hal yang disyukuri hari ini', xp: 30, completed: true, category: 'Mindfulness' },
        { id: 'ch-2', title: 'Selesaikan 1 sesi belajar fokus 25 menit tanpa HP', xp: 50, completed: true, category: 'Produktivitas' },
        { id: 'ch-3', title: 'Sapa dan beri apresiasi positif ke 1 teman sekelas', xp: 25, completed: false, category: 'Sosial' },
        { id: 'ch-4', title: 'Tidur sebelum pukul 22.30 WIB malam ini', xp: 40, completed: false, category: 'Kesehatan' }
      ],
      actionPlans: [
        { id: 'ap-1', target: 'Meningkatkan rata-rata nilai Matematika menjadi 85+', deadline: 'Akhir Semester', progress: 85, color: 'green' },
        { id: 'ap-2', target: 'Mengikuti konseling karir bersama Guru BK', deadline: 'Bulan Ini', progress: 60, color: 'blue' },
        { id: 'ap-3', target: 'Membaca 2 buku pengembangan diri remaja', deadline: '2 Minggu Lagi', progress: 35, color: 'orange' }
      ],
      studentsData: [
        {
          id: 'st-1',
          name: 'Alya Putri Ramadhani',
          kelas: 'XI IPA 2',
          avatar: AVATARS.alya,
          progress: 85,
          streak: 7,
          status: 'COMPLETED',
          mood: 'Optimis & Fokus',
          lastReflection: 'Mengatur waktu antara persiapan ujian dan kegiatan ekstrakurikuler.',
          counselorFeedback: 'Pertahankan manajemen waktu Pomodoro yang sudah berjalan baik.'
        },
        {
          id: 'st-2',
          name: 'Dimas Pratama Wijaya',
          kelas: 'X MERDEKA 1',
          avatar: AVATARS.dimas,
          progress: 62,
          streak: 4,
          status: 'IN PROGRESS',
          mood: 'Cukup Baik',
          lastReflection: 'Masih beradaptasi dengan lingkungan SMA dan teman baru di kelas.',
          counselorFeedback: 'Ajak bergabung di kelompok belajar atau ekstrakurikuler minat.'
        },
        {
          id: 'st-3',
          name: 'Nadia Safira Khairunnisa',
          kelas: 'XII IPS 1',
          avatar: AVATARS.nadia,
          progress: 34,
          streak: 1,
          status: 'NEED ATTENTION',
          mood: 'Cemas Memilih Jurusan',
          lastReflection: 'Bingung menentukan pilihan jurusan SNBP antara Psikologi dan Ilmu Komunikasi.',
          counselorFeedback: 'Jadwalkan sesi konseling tatap muka hari Kamis pukul 10.00 WIB.'
        },
        {
          id: 'st-4',
          name: 'Raka Mahendra Putra',
          kelas: 'XI IPA 2',
          avatar: AVATARS.raka,
          progress: 92,
          streak: 14,
          status: 'MASTERED',
          mood: 'Sangat Bersemangat',
          lastReflection: 'Berhasil mengurangi waktu main game dan menggantinya dengan latihan olimpiade.',
          counselorFeedback: 'Luar biasa! Konsistensi streak 14 hari sangat menginspirasi.'
        }
      ],
      tipsList: [
        { id: 'tip-1', category: 'AKADEMIK', title: 'Aturan 2 Menit', body: 'Jika sebuah tugas bisa diselesaikan kurang dari 2 menit (seperti merapikan meja belajar), kerjakan segera tanpa menunda.' },
        { id: 'tip-2', category: 'MENTAL HEALTH', title: 'Validasi Perasaanmu', body: 'Merasa lelah atau kecewa adalah hal manusiawi. Beri ruang untuk beristirahat sebelum bangkit kembali.' },
        { id: 'tip-3', category: 'SOSIAL', title: 'Mendengar Aktif', body: 'Saat teman bercerita, dengarkan untuk memahami, bukan sekadar menunggu giliran berbicara.' }
      ]
    };

    let state = loadState();

    function loadState() {
      const s = JSON.parse(JSON.stringify(DEFAULT_STATE));
      try {
        const ui = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        UI_KEYS.forEach(k => { if (ui[k] !== undefined) s[k] = ui[k]; });
      } catch (e) { /* abaikan */ }
      s.role = 'landing'; s.studentsData = []; s.adminUsers = [];
      blankPersonal(s);
      return s;
    }

    function saveState() {
      try {
        const ui = {}; UI_KEYS.forEach(k => { ui[k] = state[k]; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ui));
      } catch (e) { /* abaikan */ }
      if (state.currentStudent) state.currentStudent.level = Math.floor((state.currentStudent.xp || 0) / 500) + 1;
      scheduleSync();
    }
