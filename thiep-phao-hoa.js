/**
 * THIỆP CƯỚI ĐÈN LỒNG & PHÁO HOA (THIEP-PHAO-HOA.JS)
 * Bầu trời hoa đăng bay lơ lửng, Chạm màn hình bắn pháo hoa lấp lánh tương tác, Live Preview PostMessage
 */

(function () {
  'use strict';

  // 1. Dữ liệu mẫu mặc định
  const DEFAULT_CONFIG = {
    templateLayout: 'fireworks',
    themeStyle: 'fireworks',
    groomName: 'HOÀNG NINH',
    brideName: 'MAI PHƯƠNG',
    weddingDate: '18 . 12 . 2026',
    lunarDate: '10 tháng 11 năm Bính Ngọ',
    heroPhoto: 'image/chinh.jpg',
    couplePhoto: 'image/188A6221.JPG',
    qrCode: 'image/qr_acb.svg',
    bgMusicUrl: 'https://statics.pancake.vn/web-media/5e/ee/bf/4a/afa10d3bdf98ca17ec3191ebbfd3c829d135d06939ee1f1b712d731d-w:0-h:0-l:2938934-t:audio/mpeg.mp3',
    groomParents: 'ÔNG HOÀNG VĂN HIỂN\nBÀ NGUYỄN THỊ HÀ',
    groomAddress: 'Quận 12, TP. Hồ Chí Minh',
    brideParents: 'ÔNG NGÔ VĂN CỔN\nBÀ NGUYỄN THỊ BÌNH',
    brideAddress: 'Xã Bà Điểm, TP. Hồ Chí Minh',
    events: {
      bride: {
        time: '09:00 - Thứ Bảy',
        venue: 'TƯ GIA NHÀ GÁI',
        address: 'Xã Bà Điểm, TP. Hồ Chí Minh'
      },
      groom: {
        time: '11:00 - Chủ Nhật',
        venue: 'TRUNG TÂM HỘI NGHỊ TIỆC CƯỚI ROYAL PALACE',
        address: 'Quận 12, TP. Hồ Chí Minh'
      }
    },
    bankName: 'ACB (Á Châu)',
    accountNumber: '873588',
    accountHolder: 'HOANG VAN NINH',
    transferNote: 'Mừng cưới Hoàng Ninh - Mai Phương',
    invitationGreeting: 'Đến dự buổi tiệc chung vui cùng gia đình chúng tôi. Tình yêu như ngọn đèn lồng ấm áp thắp sáng đêm đông, sự hiện diện của bạn là niềm hạnh phúc lớn nhất của chúng mình!',
    gallery: [
      'image/chinh.jpg',
      'image/188A6221.JPG',
      'image/7011dac3cd2c4d72143d6.jpg',
      'image/8e73104a07a587fbdeb44.jpg',
      'image/8519062011cf9191c8de1.jpg',
      'image/325cb065a78a27d47e9b2.jpg',
      'image/188A6536.JPG',
      'image/188A5904.JPG'
    ]
  };

  let currentConfig = Object.assign({}, DEFAULT_CONFIG);
  let countdownTimer = null;
  let audioPlaying = false;
  let fireworksAnimId = null;

  // DOM Elements
  const audioEl = document.getElementById('wedding-audio');
  const musicPlayer = document.getElementById('fireworks-music-player');
  const overlayEl = document.getElementById('fireworks-overlay');
  const btnLaunch = document.getElementById('btn-fireworks-launch');
  const btnSkip = document.getElementById('btn-skip-festive');
  const toastEl = document.getElementById('festive-toast');
  const lightboxEl = document.getElementById('festive-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');

  // Helper utils
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showToast(msg, duration) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, duration || 2500);
  }

  function extractInitial(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return parts[parts.length - 1].charAt(0).toUpperCase();
  }

  function parseWeddingDateParts(dateStr) {
    if (!dateStr) return { day: 18, month: 12, year: 2026 };
    const nums = dateStr.match(/\d+/g);
    if (nums && nums.length >= 3) {
      return {
        day: parseInt(nums[0], 10),
        month: parseInt(nums[1], 10),
        year: parseInt(nums[2], 10)
      };
    }
    return { day: 18, month: 12, year: 2026 };
  }

  // ==================== 2. SKY LANTERNS & INTERACTIVE FIREWORKS CANVAS ====================
  let triggerFireworkBurst = null;

  function initFireworksCanvas() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // 1. Lanterns
    const lanternCount = Math.min(18, Math.floor(width / 45));
    const lanterns = [];

    function createLantern() {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 200,
        width: Math.random() * 14 + 18,
        height: Math.random() * 20 + 26,
        speedY: Math.random() * 0.7 + 0.5,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAmount: Math.random() * 1.5 + 0.8,
        swayOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.4 + 0.5
      };
    }

    for (let i = 0; i < lanternCount; i++) {
      const l = createLantern();
      l.y = Math.random() * height; // initial distribution
      lanterns.push(l);
    }

    // 2. Fireworks Particles
    const particles = [];
    const colors = [
      '#ffd166', '#ffdd00', '#ff4d6d', '#64dfdf',
      '#a370f7', '#06d6a0', '#ffffff', '#f72585'
    ];

    function createFirework(x, y, count, isHeart) {
      const particleCount = count || 38;
      for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        let vx, vy;

        if (isHeart) {
          const t = (i / particleCount) * Math.PI * 2;
          const heartX = 16 * Math.pow(Math.sin(t), 3);
          const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          vx = (heartX / 16) * (Math.random() * 2 + 3);
          vy = (heartY / 16) * (Math.random() * 2 + 3);
        } else {
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
          const speed = Math.random() * 4.5 + 1.5;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }

        particles.push({
          x: x,
          y: y,
          vx: vx,
          vy: vy,
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012,
          color: color,
          size: Math.random() * 2.5 + 1.5,
          trail: []
        });
      }
    }

    triggerFireworkBurst = function (x, y, isHeart) {
      createFirework(x || width / 2, y || height * 0.35, 45, isHeart);
    };

    // Tap/Click on document to create interactive fireworks
    document.addEventListener('pointerdown', function (e) {
      // Don't intercept button clicks
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('textarea')) {
        return;
      }
      createFirework(e.clientX, e.clientY, 32, Math.random() > 0.6);
    });

    let autoFireworkTimer = Date.now() + 3000;

    function renderScene() {
      ctx.clearRect(0, 0, width, height);

      // A. Draw Sky Lanterns
      for (let i = 0; i < lanterns.length; i++) {
        const l = lanterns[i];
        l.y -= l.speedY;
        const currentX = l.x + Math.sin(l.y * l.swaySpeed + l.swayOffset) * l.swayAmount;

        // Lantern shape
        ctx.save();
        ctx.translate(currentX, l.y);
        ctx.globalAlpha = l.alpha;

        // Soft yellow/amber glow
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, l.width * 1.5);
        glow.addColorStop(0, 'rgba(255, 221, 0, 0.45)');
        glow.addColorStop(0.5, 'rgba(255, 107, 107, 0.2)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, l.width * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Lantern Body
        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.roundRect(-l.width / 2, -l.height / 2, l.width, l.height, 4);
        ctx.fill();

        // Flame core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, l.height * 0.25, l.width * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (l.y < -50) {
          lanterns[i] = createLantern();
        }
      }

      ctx.globalAlpha = 1;

      // B. Periodic Auto Celebration Fireworks
      if (Date.now() > autoFireworkTimer) {
        const randX = Math.random() * (width * 0.7) + (width * 0.15);
        const randY = Math.random() * (height * 0.35) + 60;
        createFirework(randX, randY, 40, Math.random() > 0.5);
        autoFireworkTimer = Date.now() + Math.random() * 4000 + 3500;
      }

      // C. Draw Firework Particles
      for (let j = particles.length - 1; j >= 0; j--) {
        const p = particles[j];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gravity
        p.vx *= 0.98; // air resistance
        p.vy *= 0.98;
        p.alpha -= p.decay;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.alpha <= 0 || p.y > height + 20) {
          particles.splice(j, 1);
        }
      }

      ctx.globalAlpha = 1;

      fireworksAnimId = requestAnimationFrame(renderScene);
    }

    renderScene();
  }

  // ==================== 3. COUNTDOWN TIMER ====================
  function startCountdown(dateStr) {
    if (countdownTimer) clearInterval(countdownTimer);

    const p = parseWeddingDateParts(dateStr);
    const targetDate = new Date(p.year, p.month - 1, p.day, 11, 0, 0).getTime();

    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins = document.getElementById('cd-mins');
    const elSecs = document.getElementById('cd-secs');

    function update() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        if (elDays) elDays.textContent = '00';
        if (elHours) elHours.textContent = '00';
        if (elMins) elMins.textContent = '00';
        if (elSecs) elSecs.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (elDays) elDays.textContent = String(days).padStart(2, '0');
      if (elHours) elHours.textContent = String(hours).padStart(2, '0');
      if (elMins) elMins.textContent = String(mins).padStart(2, '0');
      if (elSecs) elSecs.textContent = String(secs).padStart(2, '0');
    }

    update();
    countdownTimer = setInterval(update, 1000);
  }

  // ==================== 4. RENDER GALLERY ====================
  function renderGallery(galleryList) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    if (!galleryList || galleryList.length === 0) {
      grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:#888;">Chưa có ảnh trong album</p>';
      return;
    }

    let html = '';
    galleryList.forEach(function (url, idx) {
      const isTall = (idx % 3 === 0) ? ' tall' : '';
      html += '<div class="festive-photo-card' + isTall + '" data-src="' + escapeHtml(url) + '">' +
        '<img src="' + escapeHtml(url) + '" alt="Ảnh Cưới ' + (idx + 1) + '" loading="lazy">' +
        '</div>';
    });

    grid.innerHTML = html;

    const items = grid.querySelectorAll('.festive-photo-card');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        const src = this.getAttribute('data-src');
        if (src && lightboxEl && lightboxImg) {
          lightboxImg.src = src;
          lightboxEl.classList.add('active');
        }
      });
    });
  }

  // ==================== 5. APPLY CONFIG TO DOM ====================
  function applyConfig(cfg) {
    currentConfig = Object.assign({}, DEFAULT_CONFIG, cfg);

    // Couple Names
    const coupleUpper = (currentConfig.groomName || 'HOÀNG NINH').toUpperCase() + ' &bull; ' + (currentConfig.brideName || 'MAI PHƯƠNG').toUpperCase();
    const elOverlayNames = document.getElementById('overlay-couple-names');
    if (elOverlayNames) elOverlayNames.innerHTML = coupleUpper;

    const elHeroGroom = document.getElementById('hero-groom-name');
    if (elHeroGroom) elHeroGroom.textContent = (currentConfig.groomName || 'HOÀNG NINH').toUpperCase();

    const elHeroBride = document.getElementById('hero-bride-name');
    if (elHeroBride) elHeroBride.textContent = (currentConfig.brideName || 'MAI PHƯƠNG').toUpperCase();

    const elFooterMono = document.getElementById('footer-monogram');
    if (elFooterMono) elFooterMono.textContent = (currentConfig.groomName || 'HOÀNG NINH').toUpperCase() + ' & ' + (currentConfig.brideName || 'MAI PHƯƠNG').toUpperCase();

    // Wedding Date
    const elOverlayDate = document.getElementById('overlay-wedding-date');
    if (elOverlayDate) elOverlayDate.textContent = currentConfig.weddingDate || '18 . 12 . 2026';

    const elHeroDate = document.getElementById('hero-wedding-date');
    if (elHeroDate) elHeroDate.textContent = currentConfig.weddingDate || '18 . 12 . 2026';

    const elHeroLunar = document.getElementById('hero-lunar-date');
    if (elHeroLunar) {
      elHeroLunar.textContent = currentConfig.lunarDate ? ('Tức ngày ' + currentConfig.lunarDate) : '';
    }

    // Hero Photo
    const heroImgEl = document.getElementById('hero-img');
    if (heroImgEl && currentConfig.heroPhoto) {
      heroImgEl.src = currentConfig.heroPhoto;
    }

    // Greeting Text
    const elGreeting = document.getElementById('hero-greeting-text');
    if (elGreeting && currentConfig.invitationGreeting) {
      elGreeting.textContent = currentConfig.invitationGreeting;
    }

    // Parents
    const elGroomParents = document.getElementById('groom-parents-text');
    if (elGroomParents) {
      elGroomParents.innerHTML = (currentConfig.groomParents || '').replace(/\n/g, '<br>');
    }
    const elGroomAddr = document.getElementById('groom-address-text');
    if (elGroomAddr) elGroomAddr.textContent = currentConfig.groomAddress || '';

    const elBrideParents = document.getElementById('bride-parents-text');
    if (elBrideParents) {
      elBrideParents.innerHTML = (currentConfig.brideParents || '').replace(/\n/g, '<br>');
    }
    const elBrideAddr = document.getElementById('bride-address-text');
    if (elBrideAddr) elBrideAddr.textContent = currentConfig.brideAddress || '';

    // Events
    if (currentConfig.events) {
      if (currentConfig.events.bride) {
        const evB = currentConfig.events.bride;
        const elTime = document.getElementById('event-bride-time');
        const elVen = document.getElementById('event-bride-venue');
        const elAddr = document.getElementById('event-bride-address');
        const elMap = document.getElementById('btn-map-bride');
        if (elTime) elTime.innerHTML = '<i class="fa-solid fa-clock"></i> ' + (evB.time || '');
        if (elVen) elVen.textContent = evB.venue || '';
        if (elAddr) elAddr.textContent = evB.address || '';
        if (elMap) elMap.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((evB.venue || '') + ' ' + (evB.address || ''));
      }
      if (currentConfig.events.groom) {
        const evG = currentConfig.events.groom;
        const elTime = document.getElementById('event-groom-time');
        const elVen = document.getElementById('event-groom-venue');
        const elAddr = document.getElementById('event-groom-address');
        const elMap = document.getElementById('btn-map-groom');
        if (elTime) elTime.innerHTML = '<i class="fa-solid fa-clock"></i> ' + (evG.time || '');
        if (elVen) elVen.textContent = evG.venue || '';
        if (elAddr) elAddr.textContent = evG.address || '';
        if (elMap) elMap.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((evG.venue || '') + ' ' + (evG.address || ''));
      }
    }

    // VietQR & Bank Info
    const qrImgEl = document.getElementById('gift-qr-img');
    if (qrImgEl && currentConfig.qrCode) {
      qrImgEl.src = currentConfig.qrCode;
    }
    const elBank = document.getElementById('gift-bank-name');
    if (elBank) elBank.textContent = currentConfig.bankName || 'ACB (Á Châu)';

    const elHolder = document.getElementById('gift-account-holder');
    if (elHolder) elHolder.textContent = (currentConfig.accountHolder || 'HOANG VAN NINH').toUpperCase();

    const elStk = document.getElementById('gift-account-number');
    if (elStk) elStk.textContent = currentConfig.accountNumber || '873588';

    const elNote = document.getElementById('gift-transfer-note');
    if (elNote) elNote.textContent = currentConfig.transferNote || 'Mừng cưới Hoàng Ninh - Mai Phương';

    // Music audio src
    if (audioEl && currentConfig.bgMusicUrl && audioEl.src !== currentConfig.bgMusicUrl) {
      audioEl.src = currentConfig.bgMusicUrl;
    }

    // Dynamic triggers
    startCountdown(currentConfig.weddingDate);
    renderGallery(currentConfig.gallery);
  }

  // ==================== 6. AUDIO & OVERLAY ====================
  function toggleAudio() {
    if (!audioEl) return;
    if (audioPlaying) {
      audioEl.pause();
      audioPlaying = false;
      if (musicPlayer) musicPlayer.classList.remove('playing');
    } else {
      audioEl.play().then(function () {
        audioPlaying = true;
        if (musicPlayer) musicPlayer.classList.add('playing');
      }).catch(function (err) {
        console.warn('Audio autoplay blocked:', err);
      });
    }
  }

  function dismissFestive() {
    if (overlayEl) {
      overlayEl.classList.add('dismissed');
    }
    if (triggerFireworkBurst) {
      triggerFireworkBurst(window.innerWidth / 2, window.innerHeight * 0.4, true);
      setTimeout(function () {
        triggerFireworkBurst(window.innerWidth * 0.3, window.innerHeight * 0.3, false);
      }, 300);
      setTimeout(function () {
        triggerFireworkBurst(window.innerWidth * 0.7, window.innerHeight * 0.3, false);
      }, 600);
    }
    if (!audioPlaying && audioEl) {
      audioEl.play().then(function () {
        audioPlaying = true;
        if (musicPlayer) musicPlayer.classList.add('playing');
      }).catch(function () {});
    }
  }

  // ==================== 7. WISHES SYSTEM ====================
  const WISHES_STORAGE_KEY = 'wedding_wishes_fireworks';

  function getSavedWishes() {
    try {
      const data = localStorage.getItem(WISHES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveWishes(list) {
    try {
      localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function renderWishes() {
    const listEl = document.getElementById('wishes-list');
    if (!listEl) return;

    const wishes = getSavedWishes();
    if (wishes.length === 0) {
      listEl.innerHTML = '<div class="empty-notice">Hãy là người đầu tiên thả đèn hoa đăng gửi lời chúc mừng!</div>';
      return;
    }

    let html = '';
    wishes.forEach(function (w) {
      html += '<div class="lantern-wish-item">' +
        '<div class="wish-header-line">' +
        '<span class="wish-sender-name">' + escapeHtml(w.name) + '</span>' +
        '<span class="wish-send-time">' + escapeHtml(w.time) + '</span>' +
        '</div>' +
        '<div class="wish-message-body">' + escapeHtml(w.text) + '</div>' +
        '</div>';
    });
    listEl.innerHTML = html;
  }

  // ==================== 8. INITIALIZE & EVENT LISTENERS ====================
  document.addEventListener('DOMContentLoaded', function () {
    // Fireworks Canvas
    initFireworksCanvas();

    const urlParams = new URLSearchParams(window.location.search);

    // Guest name
    const guestParam = urlParams.get('guest') || urlParams.get('to');
    if (guestParam) {
      const gDecoded = decodeURIComponent(guestParam);
      const elOverlayGuest = document.getElementById('overlay-guest-name');
      if (elOverlayGuest) elOverlayGuest.textContent = gDecoded;
    }

    // Check preview mode
    if (urlParams.get('preview') === '1') {
      document.body.classList.add('in-preview');
      if (overlayEl) overlayEl.classList.add('dismissed');
    } else {
      const btnSettings = document.getElementById('fireworks-settings-btn');
      const btnFooterSettings = document.getElementById('btn-footer-settings');
      let targetSettingUrl = 'tao-thiep.html';
      if (window.location.search || window.location.hash) {
        targetSettingUrl += window.location.search + window.location.hash;
      }
      if (btnSettings) btnSettings.href = targetSettingUrl;
      if (btnFooterSettings) btnFooterSettings.href = targetSettingUrl;
    }

    // Parse config from inv or hash
    let customData = null;
    const invParam = urlParams.get('inv');
    if (invParam) {
      try {
        let jsonStr = '';
        if (invParam.startsWith('{')) {
          jsonStr = decodeURIComponent(invParam);
        } else {
          jsonStr = decodeURIComponent(escape(atob(invParam)));
        }
        customData = JSON.parse(jsonStr);
      } catch (e) {
        console.warn('Cannot parse inv config:', e);
      }
    }

    if (!customData && window.location.hash.startsWith('#cfg=')) {
      try {
        const hashStr = window.location.hash.slice(5);
        const jsonStr = decodeURIComponent(escape(atob(hashStr)));
        customData = JSON.parse(jsonStr);
      } catch (e) {
        console.warn('Cannot parse hash config:', e);
      }
    }

    if (!customData) {
      try {
        const isPreview = urlParams.get('preview') === '1';
        if (isPreview) {
          const loc = localStorage.getItem('wedding_custom_config');
          if (loc) customData = JSON.parse(loc);
        } else {
          const sessRaw = localStorage.getItem('wedding_auth_session');
          if (sessRaw) {
            const sess = JSON.parse(sessRaw);
            const dbRaw = localStorage.getItem('wedding_users_db');
            if (dbRaw) {
              const db = JSON.parse(dbRaw);
              const user = db.find(u => u.id === sess.userId);
              if (user && user.invitations && user.invitations.length > 0) {
                const act = user.invitations.find(i => i.id === user.activeInvitationId) || user.invitations[0];
                if (act && act.config) customData = act.config;
              }
            }
          }
          if (!customData) {
            const loc = localStorage.getItem('wedding_custom_config');
            if (loc) customData = JSON.parse(loc);
          }
        }
      } catch (e) {}
    }

    if (customData) {
      if (urlParams.get('preview') !== '1') {
        if (customData.templateLayout === 'palace') {
          window.location.replace('index.html' + window.location.search + window.location.hash);
          return;
        } else if (customData.templateLayout === 'modern') {
          window.location.replace('thiep-hien-dai.html' + window.location.search + window.location.hash);
          return;
        } else if (customData.templateLayout === 'garden') {
          window.location.replace('thiep-hoa-co.html' + window.location.search + window.location.hash);
          return;
        } else if (customData.templateLayout === 'galaxy') {
          window.location.replace('thiep-thien-ha.html' + window.location.search + window.location.hash);
          return;
        }
      }
      applyConfig(customData);
    } else {
      applyConfig(DEFAULT_CONFIG);
    }

    // Intro Overlay Buttons
    if (btnLaunch) btnLaunch.addEventListener('click', dismissFestive);
    if (btnSkip) btnSkip.addEventListener('click', dismissFestive);

    // Music Player Button
    if (musicPlayer) musicPlayer.addEventListener('click', toggleAudio);

    // Copy Account Number
    const btnCopyStk = document.getElementById('btn-copy-stk');
    if (btnCopyStk) {
      btnCopyStk.addEventListener('click', function () {
        const stk = currentConfig.accountNumber || '873588';
        navigator.clipboard.writeText(stk).then(function () {
          showToast('Đã sao chép số tài khoản: ' + stk);
        }).catch(function () {
          const temp = document.createElement('textarea');
          temp.value = stk;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
          showToast('Đã sao chép số tài khoản: ' + stk);
        });
      });
    }

    // Lightbox Close
    if (btnCloseLightbox && lightboxEl) {
      btnCloseLightbox.addEventListener('click', function () {
        lightboxEl.classList.remove('active');
      });
      lightboxEl.addEventListener('click', function (e) {
        if (e.target === lightboxEl || e.target.classList.contains('lightbox-overlay')) {
          lightboxEl.classList.remove('active');
        }
      });
    }

    // Wish Form Submit
    const wishForm = document.getElementById('wish-form');
    if (wishForm) {
      wishForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const inpName = document.getElementById('wish-name');
        const inpText = document.getElementById('wish-text');
        if (!inpName || !inpText) return;

        const nameVal = inpName.value.trim();
        const textVal = inpText.value.trim();
        if (!nameVal || !textVal) return;

        const wishes = getSavedWishes();
        const d = new Date();
        const timeStr = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');

        wishes.unshift({ name: nameVal, text: textVal, time: timeStr });
        saveWishes(wishes);
        renderWishes();

        inpText.value = '';
        showToast('Lời chúc hoa đăng của bạn đã được gửi đi!');
        if (triggerFireworkBurst) {
          triggerFireworkBurst(window.innerWidth / 2, window.innerHeight * 0.4, true);
        }
      });
    }

    renderWishes();

    // ==================== 9. POSTMESSAGE LISTENER (LIVE PREVIEW) ====================
    window.addEventListener('message', function (event) {
      if (!event.data || typeof event.data !== 'object') return;
      const data = event.data;

      if (data.type === 'UPDATE_WEDDING_CONFIG') {
        if (data.config) {
          applyConfig(data.config);
        }
      } else if (data.type === 'OPEN_GATE' || data.type === 'SKIP_INTRO') {
        dismissFestive();
      } else if (data.type === 'SCROLL_TO_SECTION') {
        const secMap = {
          hero: 'section-hero',
          countdown: 'section-countdown',
          parents: 'section-parents',
          events: 'section-events',
          gallery: 'section-gallery',
          gift: 'section-gift',
          wishes: 'section-wishes'
        };
        const targetId = secMap[data.section] || data.section;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

  });

})();
