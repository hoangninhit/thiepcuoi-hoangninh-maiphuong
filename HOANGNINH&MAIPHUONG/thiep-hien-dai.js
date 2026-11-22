/**
 * THIỆP CƯỚI HIỆN ĐẠI (MODERN EDITORIAL ENVELOPE) - JAVASCRIPT
 */
(function () {
  'use strict';

  // 1. Elements
  const envelopeOverlay = document.getElementById('envelope-overlay');
  const envelopeBox = document.getElementById('envelope-box');
  const modernWaxSeal = document.getElementById('modern-wax-seal');
  const btnSkipEnvelope = document.getElementById('btn-skip-envelope');

  const heroGroomName = document.getElementById('hero-groom-name');
  const heroBrideName = document.getElementById('hero-bride-name');
  const heroWeddingDate = document.getElementById('hero-wedding-date');
  const heroGreetingText = document.getElementById('hero-greeting-text');
  const heroImg = document.getElementById('hero-img');
  const coupleImg = document.getElementById('couple-img');

  const topMonogram = document.getElementById('top-monogram');
  const envelopeMonogram = document.getElementById('envelope-monogram');
  const envelopeNames = document.getElementById('envelope-names');
  const envelopeDate = document.getElementById('envelope-date');
  const envelopeGuestName = document.getElementById('envelope-guest-name');
  const footerNames = document.getElementById('footer-names');

  const groomParents = document.getElementById('groom-parents');
  const groomAddress = document.getElementById('groom-address');
  const brideParents = document.getElementById('bride-parents');
  const brideAddress = document.getElementById('bride-address');

  const ev1Time = document.getElementById('ev1-time');
  const ev1Venue = document.getElementById('ev1-venue');
  const ev1Address = document.getElementById('ev1-address');
  const ev2Time = document.getElementById('ev2-time');
  const ev2Venue = document.getElementById('ev2-venue');
  const ev2Address = document.getElementById('ev2-address');

  const bankQrImg = document.getElementById('bank-qr-img');
  const bankName = document.getElementById('bank-name');
  const accountHolder = document.getElementById('account-holder');
  const accountNumber = document.getElementById('account-number');
  const transferNote = document.getElementById('transfer-note');
  const btnCopyAcc = document.getElementById('btn-copy-acc');

  const galleryContainer = document.getElementById('gallery-container');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');

  const modernToast = document.getElementById('modern-toast');
  const toastMsg = document.getElementById('toast-msg');

  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  const weddingAudio = document.getElementById('wedding-audio');
  const modernDiscPlayer = document.getElementById('modern-disc-player');

  const modernWishesForm = document.getElementById('modern-wishes-form');
  const wishesFeed = document.getElementById('wishes-feed');

  let hasOpened = false;
  let targetWeddingTimestamp = new Date('2026-12-18T11:00:00').getTime();

  // 2. Open Envelope Logic
  function openEnvelope() {
    if (hasOpened) return;
    hasOpened = true;

    if (envelopeBox) envelopeBox.classList.add('open');

    // Play music on first interaction
    tryPlayMusic();

    setTimeout(() => {
      if (envelopeOverlay) envelopeOverlay.classList.add('opened');
    }, 1200);
  }

  function skipEnvelope() {
    hasOpened = true;
    tryPlayMusic();
    if (envelopeOverlay) envelopeOverlay.classList.add('opened');
  }

  if (modernWaxSeal) modernWaxSeal.addEventListener('click', openEnvelope);
  if (envelopeBox) envelopeBox.addEventListener('click', openEnvelope);
  if (btnSkipEnvelope) btnSkipEnvelope.addEventListener('click', skipEnvelope);

  // 3. Audio Player Logic
  let isAudioPlaying = false;
  function tryPlayMusic() {
    if (weddingAudio && !isAudioPlaying) {
      weddingAudio.play().then(() => {
        isAudioPlaying = true;
        if (modernDiscPlayer) modernDiscPlayer.classList.add('playing');
      }).catch(() => {
        // Autoplay blocked by browser
      });
    }
  }

  if (modernDiscPlayer) {
    modernDiscPlayer.addEventListener('click', () => {
      if (!weddingAudio) return;
      if (isAudioPlaying) {
        weddingAudio.pause();
        isAudioPlaying = false;
        modernDiscPlayer.classList.remove('playing');
      } else {
        weddingAudio.play().then(() => {
          isAudioPlaying = true;
          modernDiscPlayer.classList.add('playing');
        });
      }
    });
  }

  // 4. Toast helper
  let toastTimer = null;
  function showToast(text) {
    if (toastMsg) toastMsg.textContent = text;
    if (modernToast) {
      modernToast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        modernToast.classList.remove('show');
      }, 2600);
    }
  }

  // 5. Copy Account Number
  if (btnCopyAcc && accountNumber) {
    btnCopyAcc.addEventListener('click', () => {
      const num = accountNumber.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(num).then(() => {
          showToast(`Đã sao chép STK: ${num}`);
        });
      } else {
        const ta = document.createElement('textarea');
        ta.value = num;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(`Đã sao chép STK: ${num}`);
      }
    });
  }

  // 6. Wishes Form
  if (modernWishesForm) {
    modernWishesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderInp = document.getElementById('inp-guest-sender');
      const contentInp = document.getElementById('inp-guest-content');
      const sender = senderInp ? senderInp.value.trim() : '';
      const content = contentInp ? contentInp.value.trim() : '';
      if (!sender || !content) return;

      const item = document.createElement('div');
      item.className = 'wish-item';
      item.innerHTML = `
        <div class="wish-author"><i class="fa-solid fa-heart" style="color: #e63946;"></i> ${escapeHtml(sender)}</div>
        <div class="wish-text">${escapeHtml(content)}</div>
      `;
      if (wishesFeed) wishesFeed.prepend(item);

      if (senderInp) senderInp.value = '';
      if (contentInp) contentInp.value = '';
      showToast('Cảm ơn bạn đã gửi lời chúc yêu thương!');
    });
  }

  // 7. Lightbox Gallery
  if (btnCloseLightbox && lightboxModal) {
    btnCloseLightbox.addEventListener('click', () => lightboxModal.classList.remove('active'));
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.remove('active');
    });
  }

  function bindGalleryItemClicks() {
    if (!galleryContainer) return;
    galleryContainer.querySelectorAll('.modern-gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img && lightboxImg && lightboxModal) {
          lightboxImg.src = img.src;
          lightboxModal.classList.add('active');
        }
      });
    });
  }

  // 8. Countdown Timer
  function updateCountdown() {
    const now = Date.now();
    const diff = targetWeddingTimestamp - now;
    if (diff <= 0) {
      if (cdDays) cdDays.textContent = '00';
      if (cdHours) cdHours.textContent = '00';
      if (cdMins) cdMins.textContent = '00';
      if (cdSecs) cdSecs.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
    if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Helper utils
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 9. Apply Custom Wedding Data
  function applyCustomWeddingData(cfg) {
    if (!cfg || typeof cfg !== 'object') return;

    const groom = (cfg.groomName || '').trim();
    const bride = (cfg.brideName || '').trim();

    if (groom) {
      if (heroGroomName) heroGroomName.textContent = groom.toUpperCase();
    }
    if (bride) {
      if (heroBrideName) heroBrideName.textContent = bride.toUpperCase();
    }

    if (groom && bride) {
      document.title = `THIỆP CƯỚI • ${groom.toUpperCase()} & ${bride.toUpperCase()}`;
      if (envelopeNames) envelopeNames.textContent = `${groom.toUpperCase()} & ${bride.toUpperCase()}`;
      if (footerNames) footerNames.textContent = `${groom.toUpperCase()} & ${bride.toUpperCase()}`;

      // Monogram initials
      const gWords = groom.split(/\s+/);
      const bWords = bride.split(/\s+/);
      const gInitial = (gWords[gWords.length - 1] || groom)[0] || 'N';
      const bInitial = (bWords[bWords.length - 1] || bride)[0] || 'P';
      const mono = `${gInitial.toUpperCase()} &bull; ${bInitial.toUpperCase()}`;
      if (topMonogram) topMonogram.innerHTML = `${gInitial.toUpperCase()} &amp; ${bInitial.toUpperCase()}`;
      if (envelopeMonogram) envelopeMonogram.innerHTML = mono;
    }

    if (cfg.weddingDate) {
      if (heroWeddingDate) heroWeddingDate.textContent = cfg.weddingDate;
      if (envelopeDate) envelopeDate.textContent = cfg.weddingDate;

      // Try parsing date for countdown: DD . MM . YYYY or DD/MM/YYYY
      const parts = cfg.weddingDate.split(/[\.\/\-]/).map(p => p.trim());
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          targetWeddingTimestamp = new Date(year, month, day, 11, 0, 0).getTime();
          updateCountdown();
        }
      }
    }

    if (cfg.invitationGreeting) {
      if (heroGreetingText) heroGreetingText.textContent = cfg.invitationGreeting;
    }

    if (cfg.heroPhoto && heroImg) {
      heroImg.src = cfg.heroPhoto;
    }
    if (cfg.couplePhoto && coupleImg) {
      coupleImg.src = cfg.couplePhoto;
    }

    // Parents & Addresses
    if (cfg.groomParents && groomParents) {
      groomParents.innerHTML = escapeHtml(cfg.groomParents).replace(/\n/g, '<br>');
    }
    if (cfg.groomAddress && groomAddress) {
      groomAddress.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(cfg.groomAddress)}`;
    }
    if (cfg.brideParents && brideParents) {
      brideParents.innerHTML = escapeHtml(cfg.brideParents).replace(/\n/g, '<br>');
    }
    if (cfg.brideAddress && brideAddress) {
      brideAddress.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(cfg.brideAddress)}`;
    }

    // Events
    if (cfg.events) {
      if (cfg.events.bride) {
        if (ev1Time && cfg.events.bride.time) ev1Time.innerHTML = `<i class="fa-regular fa-clock"></i> ${escapeHtml(cfg.events.bride.time)}`;
        if (ev1Venue && cfg.events.bride.venue) ev1Venue.textContent = cfg.events.bride.venue;
        if (ev1Address && cfg.events.bride.address) ev1Address.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(cfg.events.bride.address)}`;
      }
      if (cfg.events.groom) {
        if (ev2Time && cfg.events.groom.time) ev2Time.innerHTML = `<i class="fa-regular fa-clock"></i> ${escapeHtml(cfg.events.groom.time)}`;
        if (ev2Venue && cfg.events.groom.venue) ev2Venue.textContent = cfg.events.groom.venue;
        if (ev2Address && cfg.events.groom.address) ev2Address.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(cfg.events.groom.address)}`;
      }
    }

    // Bank & QR
    if (cfg.qrCode && bankQrImg) {
      bankQrImg.src = cfg.qrCode;
    }
    if (cfg.bankName && bankName) {
      bankName.textContent = cfg.bankName;
    }
    if (cfg.accountHolder && accountHolder) {
      accountHolder.textContent = cfg.accountHolder.toUpperCase();
    }
    if (cfg.accountNumber && accountNumber) {
      accountNumber.textContent = cfg.accountNumber;
    }
    if (cfg.transferNote && transferNote) {
      transferNote.textContent = cfg.transferNote;
    }

    // Gallery
    if (Array.isArray(cfg.gallery) && cfg.gallery.length > 0 && galleryContainer) {
      galleryContainer.innerHTML = '';
      cfg.gallery.forEach((url, i) => {
        const it = document.createElement('div');
        it.className = 'modern-gallery-item';
        it.innerHTML = `<img src="${url}" alt="Album ${i + 1}" loading="lazy">`;
        galleryContainer.appendChild(it);
      });
      bindGalleryItemClicks();
    }

    // Music
    if (cfg.bgMusicUrl && weddingAudio) {
      const srcEl = weddingAudio.querySelector('source');
      if (srcEl && srcEl.src !== cfg.bgMusicUrl) {
        srcEl.src = cfg.bgMusicUrl;
        weddingAudio.load();
      }
    }

    // Theme color adjustments if themeStyle
    if (cfg.themeStyle) {
      const root = document.documentElement;
      const themeColors = {
        royal: { accent: '#8b1820', gold: '#c59b4c' },
        rose: { accent: '#a83b56', gold: '#d9919f' },
        emerald: { accent: '#1b4938', gold: '#c59b4c' },
        sapphire: { accent: '#183359', gold: '#c59b4c' },
        lavender: { accent: '#59296e', gold: '#d4af37' },
        champagne: { accent: '#825224', gold: '#d4af37' }
      };
      const th = themeColors[cfg.themeStyle] || themeColors.royal;
      root.style.setProperty('--primary-accent', th.accent);
      root.style.setProperty('--gold', th.gold);
    }
  }

  // 10. Initial Data Load
  function initData() {
    let customData = null;

    if (window.EMBEDDED_WEDDING_CONFIG && typeof window.EMBEDDED_WEDDING_CONFIG === 'object') {
      customData = window.EMBEDDED_WEDDING_CONFIG;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('to') || urlParams.get('guest');
    if (guestParam && envelopeGuestName) {
      envelopeGuestName.textContent = decodeURIComponent(guestParam);
    }

    // Read ?inv=ID or ?id=ID
    const invId = urlParams.get('inv') || urlParams.get('id');
    if (invId && !customData) {
      try {
        const pubRaw = localStorage.getItem('wedding_public_invitations');
        if (pubRaw) {
          const pub = JSON.parse(pubRaw);
          if (pub && pub[invId]) {
            customData = pub[invId].config || pub[invId];
          }
        }
        if (!customData) {
          const dbRaw = localStorage.getItem('wedding_users_db');
          if (dbRaw) {
            const db = JSON.parse(dbRaw);
            if (Array.isArray(db)) {
              for (const u of db) {
                if (u.invitations && Array.isArray(u.invitations)) {
                  const m = u.invitations.find(i => i.id === invId);
                  if (m && m.config) {
                    customData = m.config;
                    break;
                  }
                }
              }
            }
          }
        }
      } catch (e) {}
    }

    // Read #cfg= or ?cfg=
    const cfgParam = urlParams.get('cfg');
    if (cfgParam && !customData) {
      try {
        customData = JSON.parse(decodeURIComponent(escape(atob(cfgParam))));
      } catch (e) {
        try { customData = JSON.parse(decodeURIComponent(cfgParam)); } catch (err) {}
      }
    } else if (window.location.hash.startsWith('#cfg=') && !customData) {
      try {
        const raw = window.location.hash.substring(5);
        customData = JSON.parse(decodeURIComponent(escape(atob(raw))));
      } catch (e) {
        try { customData = JSON.parse(decodeURIComponent(raw)); } catch (err) {}
      }
    }

    // Fallback to local config
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
        } else if (customData.templateLayout === 'garden') {
          window.location.replace('thiep-hoa-co.html' + window.location.search + window.location.hash);
          return;
        } else if (customData.templateLayout === 'galaxy') {
          window.location.replace('thiep-thien-ha.html' + window.location.search + window.location.hash);
          return;
        } else if (customData.templateLayout === 'fireworks') {
          window.location.replace('thiep-phao-hoa.html' + window.location.search + window.location.hash);
          return;
        }
      }

      applyCustomWeddingData(customData);

      // Cache on guest device
      const activeId = invId || customData.invId;
      if (activeId) {
        try {
          const pubRaw = localStorage.getItem('wedding_public_invitations');
          let reg = pubRaw ? JSON.parse(pubRaw) : {};
          if (!reg || typeof reg !== 'object') reg = {};
          reg[activeId] = {
            id: activeId,
            title: `Thiệp Cưới ${(customData.groomName || 'Chú Rể')} & ${(customData.brideName || 'Cô Dâu')}`,
            updatedAt: new Date().toISOString(),
            config: customData
          };
          localStorage.setItem('wedding_public_invitations', JSON.stringify(reg));
        } catch (e) {}
      }
    }

    // Auto skip intro if in preview
    if (urlParams.get('preview') === '1' || urlParams.get('skipIntro') === '1') {
      document.body.classList.add('in-preview');
      setTimeout(skipEnvelope, 300);
    } else {
      const btnSettings = document.getElementById('modern-settings-btn');
      const btnFooterSettings = document.getElementById('btn-footer-settings');
      let targetSettingUrl = 'tao-thiep.html';
      if (window.location.search || window.location.hash) {
        targetSettingUrl += window.location.search + window.location.hash;
      }
      if (btnSettings) btnSettings.href = targetSettingUrl;
      if (btnFooterSettings) btnFooterSettings.href = targetSettingUrl;
    }
  }

  // 11. Listen for postMessage from tao-thiep editor
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'UPDATE_WEDDING_CONFIG') {
      applyCustomWeddingData(event.data.config);
    } else if (event.data.type === 'OPEN_GATE' || event.data.type === 'OPEN_ENVELOPE') {
      openEnvelope();
    } else if (event.data.type === 'SKIP_INTRO') {
      skipEnvelope();
    } else if (event.data.type === 'SCROLL_TO_SECTION' && event.data.sectionId) {
      if (!hasOpened) skipEnvelope();
      const sec = document.getElementById(event.data.sectionId);
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Init
  initData();
  bindGalleryItemClicks();

})();
