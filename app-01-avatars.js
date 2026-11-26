
    // =========================================================================
    // STATE MANAGEMENT & INITIAL DATA (Persisted in localStorage)
    // =========================================================================

    // =========================================================================
    // AVATAR ILUSTRASI SISWA INDONESIA & BANNER (tanpa foto stok luar negeri)
    // =========================================================================
    function makeAvatar({ bg, skin, hair, hijab, shirt }) {
      const body = hijab
        ? `<path d="M14 120c0-28 20-40 46-40s46 12 46 40z" fill="${hijab}"/>`
        : `<path d="M18 120c0-26 18-38 42-38s42 12 42 38z" fill="${shirt}"/><path d="M48 82l12 14 12-14z" fill="#fff"/>`;
      const head = hijab
        ? `<path d="M60 12c-25 0-38 17-38 40 0 13 5 24 12 32h52c7-8 12-19 12-32 0-23-13-40-38-40z" fill="${hijab}"/>
           <ellipse cx="60" cy="56" rx="22" ry="25" fill="${skin}"/>`
        : `<ellipse cx="60" cy="54" rx="24" ry="27" fill="${hair}"/>
           <rect x="52" y="74" width="16" height="14" fill="${skin}"/>
           <ellipse cx="60" cy="58" rx="21" ry="24" fill="${skin}"/>
           <path d="M38 50c-3-22 9-33 22-33s25 11 22 33c-4-9-10-14-22-14s-18 5-22 14z" fill="${hair}"/>`;
      const face = `<circle cx="51" cy="58" r="2.6" fill="#2b1d14"/><circle cx="69" cy="58" r="2.6" fill="#2b1d14"/>
        <path d="M51 69q9 8 18 0" stroke="#7a3b2a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <circle cx="45" cy="66" r="4" fill="#ff7a7a" opacity=".22"/><circle cx="75" cy="66" r="4" fill="#ff7a7a" opacity=".22"/>`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${bg}"/>${body}${head}${face}</svg>`;
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    const AVATARS = {
      alya:  makeAvatar({ bg: '#D7F5B8', skin: '#C98F5F', hijab: '#ffffff' }),
      dimas: makeAvatar({ bg: '#CFEBFF', skin: '#B87A4B', hair: '#1c1410', shirt: '#ffffff' }),
      nadia: makeAvatar({ bg: '#FFE3B8', skin: '#D9A26F', hijab: '#6b4fa0' }),
      raka:  makeAvatar({ bg: '#FFD6D6', skin: '#A86C3F', hair: '#15100c', shirt: '#ffffff' })
    };
    function makeBanner(emoji, c1, c2) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 260"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="600" height="260" fill="url(#g)"/><circle cx="500" cy="40" r="90" fill="#fff" opacity=".12"/><circle cx="90" cy="240" r="110" fill="#fff" opacity=".1"/><text x="300" y="165" font-size="110" text-anchor="middle">${emoji}</text></svg>`;
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    const BANNERS = {
      pomodoro: makeBanner('⏱️', '#8c6239', '#c9a273'),
      emosi:    makeBanner('🧘', '#677a60', '#a9b8a0'),
      karir:    makeBanner('🧭', '#b8923f', '#e0c98f'),
      asertif:  makeBanner('💬', '#b06a50', '#dcab97')
    };
    const BANNER_BY_PEXELS = { '4145354': 'pomodoro', '267669': 'emosi', '3184291': 'karir', '1438072': 'asertif' };
    const AVATAR_BY_PEXELS = { '774909': 'alya', '1222271': 'dimas', '733872': 'nadia', '2379004': 'raka' };
