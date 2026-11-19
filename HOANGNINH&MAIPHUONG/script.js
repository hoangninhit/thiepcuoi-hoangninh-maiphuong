/* =====================================================================
   THIỆP CƯỚI HOÀNG NINH & MAI PHƯƠNG - JAVASCRIPT LOGIC
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Imperial Palace Royal Chime & Gong Sound (Web Audio API)
  function playPalaceOpeningAudio() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') ctx.resume();

      // Deep Palace Gong / Bell Resonance (140Hz -> 65Hz)
      const gongOsc = ctx.createOscillator();
      const gongGain = ctx.createGain();
      gongOsc.type = 'sine';
      gongOsc.frequency.setValueAtTime(140, ctx.currentTime);
      gongOsc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 2.5);

      gongGain.gain.setValueAtTime(0, ctx.currentTime);
      gongGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.05);
      gongGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

      gongOsc.connect(gongGain);
      gongGain.connect(ctx.destination);
      gongOsc.start(ctx.currentTime);
      gongOsc.stop(ctx.currentTime + 2.85);

      // Ascending Crystal Harp / Chime notes (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.15 + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + 0.15 + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15 + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15 + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + 0.15 + idx * 0.12);
        osc.stop(ctx.currentTime + 0.15 + idx * 0.12 + 1.25);
      });
    } catch (e) {
      console.log('AudioContext initialized', e);
    }
  }

  // 2. Audio Player Logic
  const audio = document.getElementById('wedding-audio');
  const musicBtn = document.getElementById('music-toggle-btn');
  let isPlaying = false;

  function updateMusicUI(playing) {
    if (playing) {
      musicBtn.classList.add('playing');
      musicBtn.title = 'Tạm dừng nhạc';
    } else {
      musicBtn.classList.remove('playing');
      musicBtn.title = 'Phát nhạc nền';
    }
  }

  function playAudio() {
    if (!audio) return;
    audio.play().then(() => {
      isPlaying = true;
      updateMusicUI(true);
    }).catch(err => {
      console.log('Autoplay policy caught:', err);
      isPlaying = false;
      updateMusicUI(false);
    });
  }

  function pauseAudio() {
    if (!audio) return;
    audio.pause();
    isPlaying = false;
    updateMusicUI(false);
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });
  }

  // 3. Imperial Palace Gate 3D Opening Transition (Cửa Cung Đình Mở Ra)
  const palaceOverlay = document.getElementById('envelope-overlay');
  const palaceLockBtn = document.getElementById('env-wax-seal');
  const skipIntroBtn = document.getElementById('btn-skip-intro');
  const mainContent = document.getElementById('main-content');
  let hasOpened = false;

  function triggerOpenPalaceGate() {
    if (hasOpened) return;
    hasOpened = true;

    // Immediately release pointer events so touches pass directly to the wedding card without waiting
    if (palaceOverlay) {
      palaceOverlay.classList.add('doors-opened');
      palaceOverlay.style.pointerEvents = 'none';
    }
    if (mainContent) mainContent.classList.add('revealed');

    // 1. Play deep palace gong & crystal chime, start wedding music
    playPalaceOpeningAudio();
    playAudio();

    // 2. Unlock the center medallion
    if (palaceLockBtn) palaceLockBtn.classList.add('unlocked');

    // 3. Burst of golden confetti & rose petals from within the palace
    setTimeout(() => {
      launchConfetti();
    }, 350);

    // 4. Complete transition: dissolve palace gate overlay completely
    setTimeout(() => {
      if (palaceOverlay) {
        palaceOverlay.classList.add('hidden');
        palaceOverlay.style.display = 'none';
      }
    }, 700);
  }

  function skipIntroDirectly() {
    if (hasOpened) return;
    hasOpened = true;
    playAudio();
    if (palaceOverlay) {
      palaceOverlay.style.pointerEvents = 'none';
      palaceOverlay.classList.add('hidden');
      palaceOverlay.style.display = 'none';
    }
    if (mainContent) mainContent.classList.add('revealed');
  }

  if (palaceLockBtn) palaceLockBtn.addEventListener('click', triggerOpenPalaceGate);
  if (skipIntroBtn) skipIntroBtn.addEventListener('click', skipIntroDirectly);

  // Wheel scroll or touch swipe gesture on palace gate opens doors instantly
  if (palaceOverlay) {
    let touchStartY = 0;
    palaceOverlay.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > 6) {
        triggerOpenPalaceGate();
      }
    }, { passive: true });

    palaceOverlay.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    palaceOverlay.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const moveY = e.touches[0].clientY;
        if (Math.abs(moveY - touchStartY) > 10) {
          triggerOpenPalaceGate();
        }
      }
    }, { passive: true });

    palaceOverlay.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const touchEndY = e.changedTouches[0].clientY;
        if (Math.abs(touchEndY - touchStartY) > 10) {
          triggerOpenPalaceGate();
        }
      }
    }, { passive: true });
  }

  // 4. Personalized Guest Name via URL Parameter
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('guest') || urlParams.get('to') || urlParams.get('u') || urlParams.get('khach');
  
  const guestEnvelopeEl = document.getElementById('envelope-guest-name');
  const guestHeroEl = document.getElementById('hero-guest-name');
  const guestInputEl = document.getElementById('rsvp-guest-name');

  if (guestParam) {
    const cleanGuestName = guestParam.trim();
    if (guestEnvelopeEl) guestEnvelopeEl.textContent = cleanGuestName;
    if (guestHeroEl) guestHeroEl.textContent = cleanGuestName;
    if (guestInputEl) guestInputEl.value = cleanGuestName;
  }

  // 5. Calendar Generator (Tháng 1 / 2027)
  const calGrid = document.getElementById('calendar-grid');
  if (calGrid) {
    const year = 2027;
    const month = 1; // January
    const selectedDay = 17; // Ngày cưới trọng đại
    const heartSrc = "https://content.pancake.vn/1/59/9d/0d/23/829a2a25903e5b03a029f62911ad0300b2c875df84e143b3258f9633-w:3600-h:3600-l:165926-t:image/png.png";

    const dows = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    calGrid.innerHTML = "";

    // Header DOW
    dows.forEach(d => {
      const dEl = document.createElement('div');
      dEl.className = 'cal-dow';
      dEl.textContent = d;
      calGrid.appendChild(dEl);
    });

    const firstDate = new Date(year, month - 1, 1);
    const totalDays = new Date(year, month, 0).getDate();
    // Monday first col: (firstDate.getDay() + 6) % 7
    const offset = (firstDate.getDay() + 6) % 7;

    for (let i = 0; i < offset; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      calGrid.appendChild(empty);
    }

    for (let d = 1; d <= totalDays; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      const col = (offset + (d - 1)) % 7;
      if (col === 6) cell.classList.add('sun'); // Sunday

      const span = document.createElement('span');
      span.textContent = d;
      cell.appendChild(span);

      if (d === selectedDay) {
        cell.classList.add('selected');
        const heartImg = document.createElement('img');
        heartImg.src = heartSrc;
        heartImg.alt = "Wedding Day";
        heartImg.className = 'cal-heart-img';
        cell.appendChild(heartImg);
      }

      calGrid.appendChild(cell);
    }
  }

  // 6. Live Countdown Timer (Target: 17:30 17/01/2027)
  const weddingDate = new Date('2027-01-17T17:30:00+07:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minutesEl = document.getElementById('count-minutes');
    const secondsEl = document.getElementById('count-seconds');

    if (!daysEl) return;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days < 10 ? '0' + days : days;
    hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 7. Toast Notification Helper
  function showToast(message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#c59b4c;"></i> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // 8. Modals: Gift / Trao Gửi Yêu Thương
  const giftModal = document.getElementById('gift-modal');
  const openGiftBtns = document.querySelectorAll('.trigger-gift-modal');
  const closeGiftBtn = document.getElementById('close-gift-modal');
  const copyAccountBtn = document.getElementById('btn-copy-account');
  const copyMessageBtn = document.getElementById('btn-copy-message');
  const giftNotifyForm = document.getElementById('gift-notify-form');

  // Destination Email for Wedding Wishes & Trao Gửi Yêu Thương
  const WEDDING_TARGET_EMAIL = 'ninhphuong247@gmail.com';

  // Helper function to dispatch notification to email and server log
  async function sendWeddingEmail(payload) {
    try {
      // 1. Send via FormSubmit AJAX API to destination email
      const formSubmitPromise = fetch(`https://formsubmit.co/ajax/${WEDDING_TARGET_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }).then(res => res.json()).catch(err => {
        console.warn('FormSubmit network notice:', err);
        return null;
      });

      // 2. Also log to local send-rsvp.php in parallel
      const localPhpPromise = fetch('send-rsvp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => res.json()).catch(() => null);

      const [fsRes] = await Promise.all([formSubmitPromise, localPhpPromise]);
      return fsRes;
    } catch (e) {
      console.warn('sendWeddingEmail error:', e);
      return null;
    }
  }

  openGiftBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (giftModal) giftModal.classList.add('active');
    });
  });

  if (closeGiftBtn && giftModal) {
    closeGiftBtn.addEventListener('click', () => {
      giftModal.classList.remove('active');
    });

    giftModal.addEventListener('click', (e) => {
      if (e.target === giftModal) {
        giftModal.classList.remove('active');
      }
    });
  }

  if (copyAccountBtn) {
    copyAccountBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('873588').then(() => {
        showToast('Đã sao chép số tài khoản: 873588 (ACB)');
      }).catch(() => {
        showToast('Số tài khoản: 873588 (ACB)');
      });
    });
  }

  if (copyMessageBtn) {
    copyMessageBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('Mừng cưới Hoàng Ninh - Mai Phương').then(() => {
        showToast('Đã sao chép: Mừng cưới Hoàng Ninh - Mai Phương');
      });
    });
  }

  // Handler for Trao Gửi Yêu Thương Notification Form in Gift Modal
  if (giftNotifyForm) {
    giftNotifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('gift-sender-name')?.value.trim();
      const relation = document.getElementById('gift-sender-relation')?.value.trim() || 'Khách mừng cưới';
      const amount = document.getElementById('gift-sender-amount')?.value.trim() || 'Tùy tâm';
      const note = document.getElementById('gift-sender-note')?.value.trim();
      const submitBtn = document.getElementById('btn-submit-gift-notify');

      if (!name) {
        showToast('Vui lòng nhập tên của bạn nhé!');
        return;
      }

      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ĐANG GỬI...';
      }

      const payload = {
        _subject: `🎁 [Trao Gửi Yêu Thương] Mừng cưới từ ${name} (${amount})`,
        _template: 'table',
        _captcha: 'false',
        "Loại thông báo": "Trao Gửi Yêu Thương (Mừng Cưới)",
        "Họ và Tên người gửi": name,
        "Mối Quan Hệ": relation,
        "Số Tiền Mừng": amount,
        "Lời Nhắn Chúc Mừng": note || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương!',
        "Hình Thức": 'Chuyển khoản ACB - 873588 (HOANG VAN NINH)',
        "Thời Gian Gửi": new Date().toLocaleString('vi-VN')
      };

      // Send to email and log
      sendWeddingEmail(payload);

      // Save to live guestbook wishes
      const now = new Date();
      const timeStr = `Vừa xong, ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
      const newWish = {
        name: name,
        relation: relation,
        message: note ? `[Mừng Cưới - ${amount}] ${note}` : `[Mừng Cưới - ${amount}] Chúc hai bạn trăm năm hạnh phúc!`,
        time: timeStr
      };

      let saved = localStorage.getItem('wedding_wishes_hoangninh_maiphuong');
      let wishes = saved ? JSON.parse(saved) : [...defaultWishes];
      wishes.unshift(newWish);
      localStorage.setItem('wedding_wishes_hoangninh_maiphuong', JSON.stringify(wishes));
      renderWishes(wishes);

      showToast('💌 Cảm ơn bạn! Thông báo mừng cưới đã được gửi tới Dâu Rể!');
      launchConfetti();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
      giftNotifyForm.reset();

      setTimeout(() => {
        if (giftModal) giftModal.classList.remove('active');
      }, 1500);
    });
  }

  // 9. Guestbook & RSVP Submission
  const rsvpForm = document.getElementById('rsvp-form');
  const wishesContainer = document.getElementById('wishes-list');
  const wishesCountBadge = document.getElementById('wishes-count');

  const defaultWishes = [
    {
      name: "Gia đình Bác Hùng",
      relation: "Người thân",
      message: "Chúc hai cháu Hoàng Ninh và Mai Phương trăm năm hạnh phúc, răng long đầu bạc, vạn sự cát tường!",
      time: "Hôm nay, 09:15"
    },
    {
      name: "Trần Minh Khoa",
      relation: "Bạn chú rể",
      message: "Chúc mừng người anh em đã tìm được bến đỗ tuyệt vời! Chúc hai vợ chồng mãi ngọt ngào như ngày đầu nhé!",
      time: "Hôm qua, 18:30"
    },
    {
      name: "Ngọc Lan & Phương Thảo",
      relation: "Bạn cô dâu",
      message: "Cô dâu Mai Phương xinh đẹp nhất trần đời! Chúc hai bạn một hành trình mới ngập tràn niềm vui và tiếng cười!",
      time: "Hôm qua, 14:20"
    }
  ];

  function loadWishes() {
    let saved = localStorage.getItem('wedding_wishes_hoangninh_maiphuong');
    let wishes = saved ? JSON.parse(saved) : defaultWishes;
    renderWishes(wishes);
  }

  function renderWishes(wishes) {
    if (!wishesContainer) return;
    wishesContainer.innerHTML = '';
    wishes.forEach(w => {
      const item = document.createElement('div');
      item.className = 'wish-item';
      item.innerHTML = `
        <div class="wish-header">
          <span class="wish-author">${escapeHtml(w.name)}</span>
          <span class="wish-relation">${escapeHtml(w.relation || 'Khách mời')}</span>
        </div>
        <div class="wish-content">"${escapeHtml(w.message)}"</div>
        <div class="wish-time">${escapeHtml(w.time)}</div>
      `;
      wishesContainer.appendChild(item);
    });
    if (wishesCountBadge) wishesCountBadge.textContent = `${wishes.length} lời chúc`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvp-guest-name')?.value.trim();
      const relation = document.getElementById('rsvp-relation')?.value;
      const attendance = document.getElementById('rsvp-attendance')?.value;
      const message = document.getElementById('rsvp-message')?.value.trim();
      const submitBtn = document.getElementById('btn-submit-rsvp') || rsvpForm.querySelector('button[type="submit"]');

      if (!name) {
        showToast('Vui lòng nhập tên của bạn nhé!');
        return;
      }

      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ĐANG GỬI...';
      }

      const now = new Date();
      const timeStr = `Vừa xong, ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

      const newWish = {
        name: name,
        relation: relation || 'Khách mời',
        message: message || (attendance === 'yes' ? 'Tôi sẽ đến chúc mừng hai bạn!' : 'Chúc hai bạn trăm năm hạnh phúc!'),
        time: timeStr
      };

      // Update UI & localStorage instantly
      let saved = localStorage.getItem('wedding_wishes_hoangninh_maiphuong');
      let wishes = saved ? JSON.parse(saved) : [...defaultWishes];
      wishes.unshift(newWish);
      localStorage.setItem('wedding_wishes_hoangninh_maiphuong', JSON.stringify(wishes));

      renderWishes(wishes);
      showToast('💌 Cảm ơn bạn! Lời chúc đã được gửi trực tiếp tới email Dâu Rể!');
      launchConfetti();

      // Dispatch to email and log
      const payload = {
        _subject: `💌 [Thiệp Cưới Hoàng Ninh & Mai Phương] Lời Chúc & Xác Nhận từ ${name}`,
        _template: 'table',
        _captcha: 'false',
        "Loại thông báo": "RSVP & Lời Chúc Mừng",
        "Họ và Tên": name,
        "Mối Quan Hệ": relation || 'Khách mời',
        "Xác Nhận Tham Dự": attendance === 'yes' ? '✅ Chắc chắn sẽ tham dự' : '❌ Rất tiếc không thể tham dự',
        "Lời Chúc Ý Nghĩa": message || (attendance === 'yes' ? 'Tôi sẽ đến chúc mừng hai bạn!' : 'Chúc hai bạn trăm năm hạnh phúc!'),
        "Thời Gian Gửi": new Date().toLocaleString('vi-VN')
      };

      sendWeddingEmail(payload);

      // Reset form
      if (document.getElementById('rsvp-message')) {
        document.getElementById('rsvp-message').value = '';
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }

  loadWishes();

  // 10. Photo Gallery & Lightbox Logic
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');
  const btnCloseLightbox = document.getElementById('lightbox-close');

  const photoSources = [];
  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    if (img) photoSources.push(img.src);
  });

  let currentPhotoIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    currentPhotoIndex = index;
    lightboxImg.src = photoSources[currentPhotoIndex];
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${photoSources.length}`;
    }
    lightbox.classList.add('active');
  }

  function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photoSources.length;
    openLightbox(currentPhotoIndex);
  }

  function showPrevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photoSources.length) % photoSources.length;
    openLightbox(currentPhotoIndex);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (btnNext) btnNext.addEventListener('click', showNextPhoto);
  if (btnPrev) btnPrev.addEventListener('click', showPrevPhoto);
  if (btnCloseLightbox && lightbox) {
    btnCloseLightbox.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-img-wrap')) {
        lightbox.classList.remove('active');
      }
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') showNextPhoto();
    if (e.key === 'ArrowLeft') showPrevPhoto();
    if (e.key === 'Escape') lightbox.classList.remove('active');
  });

  // 11. Guest Link Creator Modal (For Groom / Bride)
  const creatorModal = document.getElementById('creator-modal');
  const openCreatorBtn = document.getElementById('floating-tool-btn');
  const closeCreatorBtn = document.getElementById('close-creator-modal');
  const inputCreatorName = document.getElementById('input-creator-name');
  const generatedLinkEl = document.getElementById('generated-link-display');
  const btnCopyLink = document.getElementById('btn-copy-generated-link');

  function updateGeneratedLink() {
    const base = window.location.origin + window.location.pathname;
    const name = inputCreatorName ? inputCreatorName.value.trim() : '';
    const fullLink = name ? `${base}?guest=${encodeURIComponent(name)}` : base;
    if (generatedLinkEl) generatedLinkEl.textContent = fullLink;
  }

  if (openCreatorBtn && creatorModal) {
    openCreatorBtn.addEventListener('click', () => {
      creatorModal.classList.add('active');
      updateGeneratedLink();
    });
  }

  if (closeCreatorBtn && creatorModal) {
    closeCreatorBtn.addEventListener('click', () => {
      creatorModal.classList.remove('active');
    });
    creatorModal.addEventListener('click', (e) => {
      if (e.target === creatorModal) creatorModal.classList.remove('active');
    });
  }

  if (inputCreatorName) {
    inputCreatorName.addEventListener('input', updateGeneratedLink);
  }

  if (btnCopyLink && generatedLinkEl) {
    btnCopyLink.addEventListener('click', () => {
      const link = generatedLinkEl.textContent;
      navigator.clipboard.writeText(link).then(() => {
        showToast('Đã sao chép link mời khách!');
      });
    });
  }

  // 12. Falling Particles (Rose Petals & Golden Shimmer)
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const totalParticles = 24;

    for (let i = 0; i < totalParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 6,
        speedX: Math.random() * 1.5 - 0.5,
        speedY: Math.random() * 1.2 + 0.8,
        angle: Math.random() * 360,
        spinSpeed: Math.random() * 1.5 - 0.75,
        opacity: Math.random() * 0.5 + 0.3,
        type: Math.random() > 0.4 ? 'petal' : 'heart'
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.angle += p.spinSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'petal') {
          ctx.fillStyle = '#b3242e';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Heart shape
          ctx.fillStyle = '#c59b4c';
          const s = p.size * 0.7;
          ctx.beginPath();
          ctx.moveTo(0, s / 4);
          ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s / 3);
          ctx.bezierCurveTo(-s / 2, (2 * s) / 3, 0, s, 0, (4 * s) / 3);
          ctx.bezierCurveTo(0, s, s / 2, (2 * s) / 3, s / 2, s / 3);
          ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s / 4);
          ctx.fill();
        }

        ctx.restore();
      });

      requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  // 13. Confetti Effect Function
  function launchConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100vw';
    confettiContainer.style.height = '100vh';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);

    const colors = ['#8b1820', '#c59b4c', '#e8d39f', '#fff', '#e63946'];
    for (let i = 0; i < 45; i++) {
      const piece = document.createElement('div');
      const size = Math.random() * 8 + 6;
      piece.style.position = 'absolute';
      piece.style.width = size + 'px';
      piece.style.height = (size * 1.5) + 'px';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.top = '-20px';
      piece.style.borderRadius = '2px';
      piece.style.opacity = Math.random() + 0.5;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.transition = `all ${Math.random() * 2 + 2}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      confettiContainer.appendChild(piece);

      setTimeout(() => {
        piece.style.top = '110vh';
        piece.style.transform = `rotate(${Math.random() * 720}deg) scale(0.6)`;
        piece.style.opacity = '0';
      }, 50);
    }

    setTimeout(() => {
      confettiContainer.remove();
    }, 4500);
  }

  // 14. Scroll Reveal Animations (Intersection Observer)
  function initScrollAnimations() {
    const scrollElements = document.querySelectorAll('[data-aos]');
    if (!('IntersectionObserver' in window)) {
      scrollElements.forEach(el => el.classList.add('aos-animate'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    scrollElements.forEach(el => observer.observe(el));
  }

  // 15. Scroll Progress Bar & Back to Top Button (Optimized with requestAnimationFrame)
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress-bar');
    const scrollTopBtn = document.getElementById('scroll-top-btn');

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0 && progressBar) {
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = progress + '%';
          }

          if (scrollTopBtn) {
            if (window.scrollY > 350) {
              scrollTopBtn.classList.add('visible');
            } else {
              scrollTopBtn.classList.remove('visible');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // 16. TIKTOK LIVE GIFTING SYSTEM (Hoa Hồng, Siêu Xe, Tên Lửa, Lâu Đài...)
  function initTikTokGifts() {
    const stage = document.getElementById('tiktok-stage');
    const banner = document.getElementById('tiktok-gift-banner');
    const trayOverlay = document.getElementById('tiktok-tray-overlay');
    const openTrayBtn = document.getElementById('floating-gift-btn');
    const closeTrayBtn = document.getElementById('close-tray-btn');
    const btnTraySend = document.getElementById('btn-tray-send');
    const traySenderInput = document.getElementById('tray-sender-name');
    const sectionGuestInput = document.getElementById('tiktok-guest-input');

    if (!stage || !banner) return;

    // Gift Configs
    const GIFTS = {
      rose: {
        name: 'Hoa Hồng',
        action: 'Vừa bắn Hoa Hồng Combo',
        icon: '🌹',
        avatar: '🌸',
        sound: 'rose'
      },
      car: {
        name: 'Siêu Xe Cưới',
        action: 'Vừa lao Siêu Xe Mui Trần đón dâu',
        icon: '🏎️',
        avatar: '🏎️',
        sound: 'car'
      },
      rocket: {
        name: 'Tên Lửa',
        action: 'Vừa phóng Tên Lửa nổ Pháo Hoa Trái Tim',
        icon: '🚀',
        avatar: '🚀',
        sound: 'rocket'
      },
      castle: {
        name: 'Lâu Đài Vàng',
        action: 'Vừa dựng Lâu Đài Cổ Tích nguy nga',
        icon: '🏰',
        avatar: '👑',
        sound: 'castle'
      },
      ring: {
        name: 'Nhẫn Kim Cương',
        action: 'Vừa trao Nhẫn Kim Cương Vĩnh Cửu',
        icon: '💍',
        avatar: '💎',
        sound: 'ring'
      },
      crown: {
        name: 'Vương Miện',
        action: 'Vừa trao Vương Miện Hoàng Gia',
        icon: '👑',
        avatar: '👑',
        sound: 'crown'
      },
      jet: {
        name: 'Chuyên Cơ',
        action: 'Vừa gửi Chuyên Cơ Trăng Mật',
        icon: '✈️',
        avatar: '✈️',
        sound: 'jet'
      },
      money: {
        name: 'Mưa Tiền Vàng',
        action: 'Vừa bắn Cơn Mưa Tiền Vàng Tài Lộc',
        icon: '💰',
        avatar: '🪙',
        sound: 'money'
      }
    };

    // Live Stats Storage
    const stats = {
      rose: parseInt(localStorage.getItem('gift_stat_rose') || '1520'),
      car: parseInt(localStorage.getItem('gift_stat_car') || '88'),
      rocket: parseInt(localStorage.getItem('gift_stat_rocket') || '168'),
      castle: parseInt(localStorage.getItem('gift_stat_castle') || '52')
    };

    function updateStatDisplays() {
      const elRose = document.getElementById('stat-count-rose');
      const elCar = document.getElementById('stat-count-car');
      const elRocket = document.getElementById('stat-count-rocket');
      const elCastle = document.getElementById('stat-count-castle');
      if (elRose) elRose.textContent = stats.rose >= 1000 ? (stats.rose / 1000).toFixed(1) + 'K' : stats.rose;
      if (elCar) elCar.textContent = stats.car;
      if (elRocket) elRocket.textContent = stats.rocket;
      if (elCastle) elCastle.textContent = stats.castle;
    }
    updateStatDisplays();
    loadSavedGiftActivities();

    // Pre-fill sender name from URL or hero guest name
    const heroGuest = document.getElementById('hero-guest-name');
    if (heroGuest && heroGuest.textContent && heroGuest.textContent !== 'Quý Khách') {
      if (sectionGuestInput) sectionGuestInput.value = heroGuest.textContent;
      if (traySenderInput) traySenderInput.value = heroGuest.textContent;
    }

    // Web Audio API Sound Effects
    let giftAudioCtx = null;
    function getGiftAudio() {
      if (!giftAudioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) giftAudioCtx = new AudioClass();
      }
      if (giftAudioCtx && giftAudioCtx.state === 'suspended') {
        giftAudioCtx.resume();
      }
      return giftAudioCtx;
    }

    function playSound(type) {
      try {
        const ctx = getGiftAudio();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (type === 'rose') {
          [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            gain.gain.setValueAtTime(0, now + idx * 0.04);
            gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.04 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.38);
          });
        } else if (type === 'car') {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.6);
          osc.frequency.exponentialRampToValueAtTime(200, now + 1.2);
          osc.frequency.exponentialRampToValueAtTime(360, now + 1.8);
          osc.frequency.exponentialRampToValueAtTime(90, now + 2.8);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, now);
          filter.frequency.exponentialRampToValueAtTime(2600, now + 0.7);
          filter.frequency.exponentialRampToValueAtTime(600, now + 2.8);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
          gain.gain.setValueAtTime(0.22, now + 2.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 3.05);
        } else if (type === 'rocket') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(950, now + 1.2);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.28);

          setTimeout(() => {
            const boom = ctx.createOscillator();
            const bGain = ctx.createGain();
            boom.type = 'sine';
            boom.frequency.setValueAtTime(140, ctx.currentTime);
            boom.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 1.4);
            bGain.gain.setValueAtTime(0.35, ctx.currentTime);
            bGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
            boom.connect(bGain);
            bGain.connect(ctx.destination);
            boom.start(ctx.currentTime);
            boom.stop(ctx.currentTime + 1.55);
          }, 1200);
        } else if (type === 'castle') {
          [523.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);
            gain.gain.setValueAtTime(0, now + idx * 0.15);
            gain.gain.linearRampToValueAtTime(0.24, now + idx * 0.15 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 1.25);
          });
        } else if (type === 'ring' || type === 'crown') {
          [659.25, 880, 1174.66, 1760].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.85);
          });
        } else if (type === 'money') {
          for (let i = 0; i < 7; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400 + Math.random() * 800, now + i * 0.07);
            gain.gain.setValueAtTime(0, now + i * 0.07);
            gain.gain.linearRampToValueAtTime(0.18, now + i * 0.07 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.28);
          }
        } else if (type === 'jet') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.linearRampToValueAtTime(140, now + 2.5);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.85);
        }
      } catch (e) {
        console.log('Audio error:', e);
      }
    }

    // Combo & Banner Tracking
    let activeGiftKey = null;
    let comboCount = 0;
    let bannerHideTimer = null;

    function triggerGift(giftKey, multiplier = 1, customSender = '') {
      const gift = GIFTS[giftKey];
      if (!gift) return;

      const senderName = customSender || (sectionGuestInput ? sectionGuestInput.value.trim() : '') || 'Quý Khách';

      // Update Combo
      if (activeGiftKey === giftKey) {
        comboCount += multiplier;
      } else {
        activeGiftKey = giftKey;
        comboCount = multiplier;
      }

      // Update Banner Elements
      const senderEl = document.getElementById('gift-banner-sender');
      const actionEl = document.getElementById('gift-banner-action');
      const iconEl = document.getElementById('gift-banner-icon');
      const avatarEl = document.getElementById('gift-banner-avatar');
      const comboEl = document.getElementById('gift-banner-combo');

      if (senderEl) senderEl.textContent = senderName;
      if (actionEl) actionEl.textContent = gift.action;
      if (iconEl) iconEl.textContent = gift.icon;
      if (avatarEl) avatarEl.textContent = gift.avatar;
      if (comboEl) {
        comboEl.textContent = 'x' + comboCount;
        comboEl.classList.remove('bounce');
        void comboEl.offsetWidth;
        comboEl.classList.add('bounce');
      }

      banner.classList.add('active');

      if (bannerHideTimer) clearTimeout(bannerHideTimer);
      bannerHideTimer = setTimeout(() => {
        banner.classList.remove('active');
        comboCount = 0;
        activeGiftKey = null;
      }, 3000);

      // Play Sound
      playSound(gift.sound);

      // Trigger Visual Effect on Stage
      runStageAnimation(giftKey, multiplier);

      // Update Counters & Stats
      if (stats[giftKey] !== undefined) {
        stats[giftKey] += multiplier;
        localStorage.setItem('gift_stat_' + giftKey, stats[giftKey]);
        updateStatDisplays();
      }

      // Add to Live Activity Feed (with persistence to server file gift_activity.json)
      addFeedActivity(senderName, gift.icon + ' ' + gift.name + ' x' + multiplier, giftKey, multiplier);
    }

    // Render activity list into the DOM feed
    function renderFeedActivities(activities) {
      const feedList = document.getElementById('tiktok-feed-list');
      if (!feedList || !Array.isArray(activities) || !activities.length) return;
      feedList.innerHTML = '';
      activities.slice(0, 8).forEach(act => {
        const item = document.createElement('div');
        item.className = 'feed-item';
        item.innerHTML = `
          <span class="feed-avatar">${escapeHtml(act.avatar || '💖')}</span>
          <span class="feed-text"><strong>${escapeHtml(act.sender)}</strong> vừa tặng <strong>${escapeHtml(act.gift)}</strong></span>
          <span class="feed-time">${escapeHtml(act.time || 'Vừa xong')}</span>
        `;
        feedList.appendChild(item);
      });
    }

    // Load saved gift activities from server file gift_activity.json (and localStorage fallback)
    async function loadSavedGiftActivities() {
      // 1. Instant load from localStorage so feed never flickers
      try {
        const cached = localStorage.getItem('wedding_gift_activities_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            renderFeedActivities(parsed);
          }
        }
      } catch (err) {}

      // 2. Fetch latest data from server file gift_activity.json (or gift-activity.php on PHP server)
      try {
        let res = await fetch('gift-activity.php').catch(() => null);
        if (!res || !res.ok) {
          res = await fetch('gift_activity.json').catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.success !== false) {
            const activities = data.activities || (Array.isArray(data) ? data : []);
            if (activities.length) {
              renderFeedActivities(activities);
              localStorage.setItem('wedding_gift_activities_v1', JSON.stringify(activities));
            }
            if (data.stats) {
              Object.assign(stats, data.stats);
              updateStatDisplays();
            }
          }
        }
      } catch (e) {
        console.warn('Notice: loadSavedGiftActivities offline fallback:', e);
      }
    }

    // Add Live Feed Item & Persist to server file gift_activity.json + localStorage
    const feedAvatars = ['🌸', '💖', '👑', '🎉', '💐', '💎', '🚀', '✨', '🏎️', '🎩'];
    function addFeedActivity(sender, giftDesc, giftKey, multiplier) {
      const feedList = document.getElementById('tiktok-feed-list');
      const randomAvatar = feedAvatars[Math.floor(Math.random() * feedAvatars.length)];
      
      const newAct = {
        avatar: randomAvatar,
        sender: sender,
        gift: giftDesc,
        time: 'Vừa xong',
        giftKey: giftKey || '',
        multiplier: multiplier || 1,
        timestamp: Date.now()
      };

      // 1. Prepend to DOM immediately with smooth animation
      if (feedList) {
        const item = document.createElement('div');
        item.className = 'feed-item';
        item.innerHTML = `
          <span class="feed-avatar">${escapeHtml(newAct.avatar)}</span>
          <span class="feed-text"><strong>${escapeHtml(newAct.sender)}</strong> vừa tặng <strong>${escapeHtml(newAct.gift)}</strong></span>
          <span class="feed-time">Vừa xong</span>
        `;
        feedList.insertBefore(item, feedList.firstChild);
        while (feedList.children.length > 8) {
          feedList.removeChild(feedList.lastChild);
        }
      }

      // 2. Save to localStorage cache for instant persistence across F5
      try {
        let cached = JSON.parse(localStorage.getItem('wedding_gift_activities_v1') || '[]');
        cached.unshift(newAct);
        if (cached.length > 25) cached = cached.slice(0, 25);
        localStorage.setItem('wedding_gift_activities_v1', JSON.stringify(cached));
      } catch (e) {}

      // 3. Save directly to server file gift_activity.json via gift-activity.php
      fetch('gift-activity.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct)
      }).then(res => res.json()).then(data => {
        if (data && data.stats) {
          Object.assign(stats, data.stats);
          updateStatDisplays();
        }
      }).catch(err => {
        console.warn('Notice: server file save error:', err);
      });
    }

    // Fullscreen Visual Effects Creator
    function runStageAnimation(giftKey, multiplier) {
      if (!stage) return;

      if (giftKey === 'rose') {
        const count = Math.min(18, 6 * multiplier);
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const rose = document.createElement('div');
            rose.className = 'stage-rose-item';
            rose.textContent = ['🌹', '🌸', '💐', '🌺'][Math.floor(Math.random() * 4)];
            rose.style.left = (Math.random() * 80 + 10) + '%';
            rose.style.bottom = (Math.random() * 20 + 5) + '%';
            rose.style.setProperty('--drift-x', (Math.random() * 120 - 60) + 'px');
            rose.style.fontSize = (Math.random() * 24 + 28) + 'px';
            stage.appendChild(rose);
            setTimeout(() => rose.remove(), 2500);
          }, i * 70);
        }
      } else if (giftKey === 'car') {
        const carWrap = document.createElement('div');
        carWrap.className = 'stage-supercar-wrap';
        carWrap.innerHTML = `
          <div class="car-banner-text">🏎️ SIÊU XE CƯỚI ĐÓN DÂU HOÀNG GIA! 🏎️</div>
          <div class="supercar-svg-box">
            <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                  <stop offset="0%" stop-color="#b3001e"/>
                  <stop offset="45%" stop-color="#ff1a40"/>
                  <stop offset="70%" stop-color="#800014"/>
                  <stop offset="100%" stop-color="#3d000a"/>
                </linearGradient>
                <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#d4af37"/>
                  <stop offset="50%" stop-color="#fff2b2"/>
                  <stop offset="100%" stop-color="#aa7c11"/>
                </linearGradient>
                <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ffd700"/>
                  <stop offset="50%" stop-color="#ffffff"/>
                  <stop offset="100%" stop-color="#996515"/>
                </linearGradient>
              </defs>
              <ellipse cx="250" cy="140" rx="230" ry="8" fill="rgba(0,0,0,0.5)"/>
              <path d="M 40 115 L 70 85 L 140 75 L 210 38 L 330 38 L 400 70 L 470 95 L 485 115 L 460 120 L 415 120 A 30 30 0 0 0 355 120 L 195 120 A 30 30 0 0 0 135 120 L 55 120 Z" fill="url(#carGrad)" stroke="url(#goldTrim)" stroke-width="2.5"/>
              <path d="M 215 42 L 325 42 L 385 70 L 170 70 Z" fill="#111111" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
              <path d="M 225 45 L 315 45 L 340 68 L 225 68 Z" fill="rgba(0,210,255,0.2)"/>
              <line x1="140" y1="92" x2="450" y2="92" stroke="url(#goldTrim)" stroke-width="2"/>
              <polygon points="460,95 482,105 465,108" fill="#ffffff" filter="drop-shadow(0 0 8px #00f0ff)"/>
              <path d="M 40 85 L 20 70 L 55 70 Z" fill="#aa7c11"/>
              <circle cx="385" cy="120" r="26" fill="#1a1a1a" stroke="#333" stroke-width="3"/>
              <circle cx="385" cy="120" r="18" fill="url(#rimGrad)"/>
              <circle cx="385" cy="120" r="7" fill="#1a1a1a"/>
              <circle cx="165" cy="120" r="26" fill="#1a1a1a" stroke="#333" stroke-width="3"/>
              <circle cx="165" cy="120" r="18" fill="url(#rimGrad)"/>
              <circle cx="165" cy="120" r="7" fill="#1a1a1a"/>
            </svg>
            <div class="car-headlight-glow"></div>
            <div class="car-exhaust-flames">🔥💨</div>
          </div>
        `;
        stage.appendChild(carWrap);
        setTimeout(() => carWrap.remove(), 3400);
      } else if (giftKey === 'rocket') {
        const rocketWrap = document.createElement('div');
        rocketWrap.className = 'stage-rocket-wrap';
        rocketWrap.innerHTML = `
          <div class="rocket-body">
            <span>🚀</span>
            <span class="rocket-flame">🔥</span>
          </div>
        `;
        stage.appendChild(rocketWrap);

        // Explode into heart fireworks
        setTimeout(() => {
          rocketWrap.remove();
          const burst = document.createElement('div');
          burst.className = 'stage-firework-burst';
          const colors = ['#ff2c55', '#ffd700', '#00f2fe', '#fff', '#ff9a9e'];
          for (let i = 0; i < 32; i++) {
            const spark = document.createElement('div');
            spark.className = 'firework-spark';
            spark.style.background = colors[i % colors.length];
            spark.style.boxShadow = `0 0 10px ${colors[i % colors.length]}`;
            // Heart curve geometry
            const t = (i / 32) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            const dist = 10;
            spark.style.setProperty('--tx', (x * dist) + 'px');
            spark.style.setProperty('--ty', (y * dist) + 'px');
            burst.appendChild(spark);
          }
          stage.appendChild(burst);
          setTimeout(() => burst.remove(), 2000);
        }, 1250);
      } else if (giftKey === 'castle') {
        const castleWrap = document.createElement('div');
        castleWrap.className = 'stage-castle-wrap';
        castleWrap.innerHTML = `
          <div class="castle-rays"></div>
          <div class="castle-icon">🏰</div>
          <div class="car-banner-text">👑 LÂU ĐÀI HẠNH PHÚC - TRĂM NĂM VIÊN MÃN! 👑</div>
        `;
        stage.appendChild(castleWrap);
        setTimeout(() => castleWrap.remove(), 3300);
      } else if (giftKey === 'ring') {
        const ringWrap = document.createElement('div');
        ringWrap.className = 'stage-diamond-wrap';
        ringWrap.innerHTML = `
          <div class="diamond-icon">💍</div>
          <div class="car-banner-text">💎 MINH CHỨNG TÌNH YÊU VĨNH CỬU! 💎</div>
        `;
        stage.appendChild(ringWrap);
        setTimeout(() => ringWrap.remove(), 3100);
      } else if (giftKey === 'crown') {
        const crownWrap = document.createElement('div');
        crownWrap.className = 'stage-crown-wrap';
        crownWrap.innerHTML = `
          <div class="crown-icon">👑</div>
          <div class="car-banner-text">✨ VƯƠNG MIỆN HOÀNG GIA HỶ SỰ! ✨</div>
        `;
        stage.appendChild(crownWrap);
        setTimeout(() => crownWrap.remove(), 3100);
      } else if (giftKey === 'jet') {
        const jetWrap = document.createElement('div');
        jetWrap.className = 'stage-jet-wrap';
        jetWrap.innerHTML = `
          <div class="jet-banner-row">
            <span class="jet-airplane">✈️</span>
            <div class="jet-trailing-banner">HOÀNG NINH &amp; MAI PHƯƠNG &bull; TRĂM NĂM HẠNH PHÚC 💕</div>
          </div>
        `;
        stage.appendChild(jetWrap);
        setTimeout(() => jetWrap.remove(), 3600);
      } else if (giftKey === 'money') {
        const symbols = ['💰', '🪙', '💵', '囍', '✨'];
        for (let i = 0; i < 35; i++) {
          setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'stage-money-item';
            coin.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            coin.style.left = (Math.random() * 90 + 5) + '%';
            coin.style.setProperty('--drift-x', (Math.random() * 80 - 40) + 'px');
            coin.style.fontSize = (Math.random() * 18 + 22) + 'px';
            stage.appendChild(coin);
            setTimeout(() => coin.remove(), 2900);
          }, i * 65);
        }
      }
    }

    // In-Page Gift Cards Click Listeners
    const giftCards = document.querySelectorAll('.gift-card');
    giftCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const giftKey = card.getAttribute('data-gift');
        triggerGift(giftKey, 1);
      });
    });

    // Tray Bottom Sheet Open / Close
    if (openTrayBtn) {
      openTrayBtn.addEventListener('click', () => {
        if (trayOverlay) trayOverlay.classList.add('active');
        // Synchronize name
        if (sectionGuestInput && traySenderInput) {
          traySenderInput.value = sectionGuestInput.value;
        }
      });
    }

    if (closeTrayBtn) {
      closeTrayBtn.addEventListener('click', () => {
        if (trayOverlay) trayOverlay.classList.remove('active');
      });
    }

    if (trayOverlay) {
      trayOverlay.addEventListener('click', (e) => {
        if (e.target === trayOverlay) {
          trayOverlay.classList.remove('active');
        }
      });
    }

    // Tray Items Select
    let selectedTrayGift = 'rose';
    const trayItems = document.querySelectorAll('.tray-item');
    trayItems.forEach(item => {
      item.addEventListener('click', () => {
        trayItems.forEach(it => it.classList.remove('active'));
        item.classList.add('active');
        selectedTrayGift = item.getAttribute('data-gift');
      });
    });

    // Tray Multiplier Select
    let selectedMultiplier = 1;
    const multiBtns = document.querySelectorAll('.btn-multi-combo');
    multiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        multiBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMultiplier = parseInt(btn.getAttribute('data-mult') || '1');
      });
    });

    // Tray Send Button
    if (btnTraySend) {
      btnTraySend.addEventListener('click', () => {
        const sender = traySenderInput ? traySenderInput.value.trim() : 'Quý Khách';
        if (sectionGuestInput) sectionGuestInput.value = sender;
        triggerGift(selectedTrayGift, selectedMultiplier, sender);
        showToast(`Đã gửi tặng ${GIFTS[selectedTrayGift].name} x${selectedMultiplier}!`);
      });
    }
  }

  initTikTokGifts();
  initScrollProgress();
  initScrollAnimations();

});
