
        // =========================================================================
    // SOUND & TOAST UTILITIES
    // =========================================================================
    function playClickTone(type = 'pop') {
      if (!state.currentStudent.soundEffects) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'success') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'error') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        }
      } catch (e) {
        // Ignore audio errors if blocked
      }
    }

    function showToast(message, variant = 'green') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      const colors = {
        green: 'bg-[rgb(140,98,57)] text-white',
        blue: 'bg-[rgb(103,122,96)] text-white',
        red: 'bg-[#b24a40] text-white',
        dark: 'bg-[rgb(24,24,23)] text-white'
      };
      toast.className = `${colors[variant] || colors.green} px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 transform transition-all duration-300 translate-y-2 opacity-0`;
      toast.innerHTML = `<span>${message}</span>`;
      container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 2800);
    }
