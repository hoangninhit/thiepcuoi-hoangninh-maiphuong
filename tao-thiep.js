/**
 * CÔNG CỤ TẠO & TÙY BIẾN THIỆP CƯỚI HOÀNG GIA (TAO-THIEP.JS)
 * Quản lý trạng thái, nén ảnh HTML5 Canvas, VietQR tự động, Real-time Live Preview
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Dữ liệu mẫu mặc định ban đầu
  const DEFAULT_CONFIG = {
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
    gallery: [
      'image/chinh.jpg',
      'image/188A6221.JPG',
      'image/7011dac3cd2c4d72143d6.jpg',
      'image/8e73104a07a587fbdeb44.jpg',
      'image/8519062011cf9191c8de1.jpg',
      'image/325cb065a78a27d47e9b2.jpg',
      'image/188A6536.JPG',
      'image/188A5904.JPG',
      'image/f292674370acf0f2a9bd5.jpg',
      'image/188A6174.JPG',
      'image/ed4e6d777a98fac6a3893.jpg',
      'image/188A6465.JPG',
      'image/188A6455.JPG',
      'image/188A6210.JPG',
      'image/188A5908.JPG',
      'image/188A6590.JPG'
    ]
  };

  const BANK_NAMES = {
    ACB: 'ACB (Á Châu)',
    VCB: 'Vietcombank',
    MB: 'MB Bank',
    TCB: 'Techcombank',
    CTG: 'VietinBank',
    BIDV: 'BIDV',
    VPB: 'VPBank',
    TPB: 'TPBank',
    VIB: 'VIB',
    STB: 'Sacombank',
    HDB: 'HDBank',
    OCB: 'OCB'
  };

  // Helper utils
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getAvatarInitial(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 0) {
      const lastWord = parts[parts.length - 1];
      return lastWord.charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  function formatTime(isoStr) {
    if (!isoStr) return 'Vừa xong';
    try {
      const d = new Date(isoStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${mins} - ${day}/${month}/${year}`;
    } catch (e) {
      return 'Vừa xong';
    }
  }

  // User Accounts & Multi-Invitation Storage System (Database lưu trên LocalStorage)
  const DB_KEY = 'wedding_users_db';
  const SESSION_KEY = 'wedding_auth_session';

  function getUsersDB() {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc Users DB:', e);
    }
    // Khởi tạo tài khoản mẫu Hoàng Ninh mặc định
    const defaultDB = [
      {
        id: 'user_demo_1',
        fullname: 'Hoàng Ninh',
        account: 'ninhphuong247@gmail.com',
        password: '123456',
        createdAt: '2026-11-21T00:00:00.000Z',
        activeInvitationId: 'inv_default_1',
        invitations: [
          {
            id: 'inv_default_1',
            title: 'Thiệp Cưới Hoàng Ninh & Mai Phương (Mẫu Chuẩn)',
            updatedAt: new Date().toISOString(),
            config: JSON.parse(JSON.stringify(DEFAULT_CONFIG))
          }
        ]
      }
    ];
    saveUsersDB(defaultDB);
    return defaultDB;
  }

  function saveUsersDB(db) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.warn('Lỗi lưu Users DB:', e);
    }
  }

  function getCurrentSession() {
    try {
      const sess = localStorage.getItem(SESSION_KEY);
      return sess ? JSON.parse(sess) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentSession(user) {
    try {
      const sessData = {
        userId: user.id,
        fullname: user.fullname,
        account: user.account,
        loggedAt: new Date().toISOString()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessData));
      return sessData;
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  function saveCurrentConfigToUserAccount() {
    try {
      const session = getCurrentSession();
      if (!session) return;
      const db = getUsersDB();
      const user = db.find(u => u.id === session.userId);
      if (!user) return;

      if (!user.invitations || !Array.isArray(user.invitations)) {
        user.invitations = [];
      }

      let activeInv = user.invitations.find(inv => inv.id === user.activeInvitationId);
      const title = `Thiệp Cưới ${currentConfig.groomName || 'Chú Rể'} & ${currentConfig.brideName || 'Cô Dâu'}`;
      if (!activeInv) {
        activeInv = {
          id: user.activeInvitationId || ('inv_' + Date.now()),
          title: title,
          updatedAt: new Date().toISOString(),
          config: JSON.parse(JSON.stringify(currentConfig))
        };
        user.activeInvitationId = activeInv.id;
        user.invitations.push(activeInv);
      } else {
        activeInv.title = title;
        activeInv.updatedAt = new Date().toISOString();
        activeInv.config = JSON.parse(JSON.stringify(currentConfig));
      }

      saveUsersDB(db);
    } catch (e) {
      console.warn('Lỗi lưu thiệp vào tài khoản:', e);
    }
  }

  function getInvitationShareUrl(cfg) {
    const shareData = {
      groomName: cfg.groomName,
      brideName: cfg.brideName,
      weddingDate: cfg.weddingDate,
      lunarDate: cfg.lunarDate,
      bgMusicUrl: cfg.bgMusicUrl,
      groomParents: cfg.groomParents,
      groomAddress: cfg.groomAddress,
      brideParents: cfg.brideParents,
      brideAddress: cfg.brideAddress,
      bankName: cfg.bankName,
      accountNumber: cfg.accountNumber,
      accountHolder: cfg.accountHolder,
      transferNote: cfg.transferNote,
      events: cfg.events
    };

    if (cfg.heroPhoto && !cfg.heroPhoto.startsWith('data:')) {
      shareData.heroPhoto = cfg.heroPhoto;
    }
    if (cfg.couplePhoto && !cfg.couplePhoto.startsWith('data:')) {
      shareData.couplePhoto = cfg.couplePhoto;
    }
    if (cfg.qrCode && !cfg.qrCode.startsWith('data:')) {
      shareData.qrCode = cfg.qrCode;
    }

    const encodedJson = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
    const baseUrl = window.location.origin + window.location.pathname.replace('tao-thiep.html', 'index.html');
    return `${baseUrl}?cfg=${encodedJson}`;
  }

  // State hiện tại (được tải từ localStorage nếu đã lưu trước đó hoặc từ tài khoản người dùng)
  let currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  try {
    const session = getCurrentSession();
    if (session) {
      const db = getUsersDB();
      const user = db.find(u => u.id === session.userId);
      if (user && user.invitations && user.invitations.length > 0) {
        const activeInv = user.invitations.find(inv => inv.id === user.activeInvitationId) || user.invitations[0];
        if (activeInv && activeInv.config) {
          currentConfig = Object.assign({}, DEFAULT_CONFIG, activeInv.config);
          if (activeInv.config.events) currentConfig.events = Object.assign({}, DEFAULT_CONFIG.events, activeInv.config.events);
        }
      }
    } else {
      const saved = localStorage.getItem('wedding_custom_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          currentConfig = Object.assign({}, DEFAULT_CONFIG, parsed);
          if (parsed.events) currentConfig.events = Object.assign({}, DEFAULT_CONFIG.events, parsed.events);
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc cache config:', e);
  }

  // 2. Elements tham chiếu
  const previewIframe = document.getElementById('preview-iframe');
  const toastNotice = document.getElementById('toast-notice');
  const toastText = document.getElementById('toast-text');

  // Input elements
  const inpGroomName = document.getElementById('inp-groom-name');
  const inpBrideName = document.getElementById('inp-bride-name');
  const inpWeddingDate = document.getElementById('inp-wedding-date');
  const inpLunarDate = document.getElementById('inp-lunar-date');
  const selBgMusic = document.getElementById('sel-bg-music');
  const inpCustomMusic = document.getElementById('inp-custom-music');

  // Photos elements
  const imgPreviewHero = document.getElementById('img-preview-hero');
  const fileHeroPhoto = document.getElementById('file-hero-photo');
  const inpUrlHero = document.getElementById('inp-url-hero');

  const imgPreviewCouple = document.getElementById('img-preview-couple');
  const fileCouplePhoto = document.getElementById('file-couple-photo');
  const inpUrlCouple = document.getElementById('inp-url-couple');

  const imgPreviewQr = document.getElementById('img-preview-qr');
  const fileQrPhoto = document.getElementById('file-qr-photo');
  const inpUrlQr = document.getElementById('inp-url-qr');

  const fileGalleryMulti = document.getElementById('file-gallery-multi');
  const galleryThumbsContainer = document.getElementById('gallery-thumbs-container');
  const galleryCountText = document.getElementById('gallery-count-text');
  const btnRestoreGallery = document.getElementById('btn-restore-gallery');
  const btnClearGallery = document.getElementById('btn-clear-gallery');

  // Family elements
  const inpGroomParents = document.getElementById('inp-groom-parents');
  const inpGroomAddress = document.getElementById('inp-groom-address');
  const inpBrideParents = document.getElementById('inp-bride-parents');
  const inpBrideAddress = document.getElementById('inp-bride-address');

  // Events elements
  const inpEv1Time = document.getElementById('inp-ev1-time');
  const inpEv1Venue = document.getElementById('inp-ev1-venue');
  const inpEv1Address = document.getElementById('inp-ev1-address');
  const inpEv2Time = document.getElementById('inp-ev2-time');
  const inpEv2Venue = document.getElementById('inp-ev2-venue');
  const inpEv2Address = document.getElementById('inp-ev2-address');

  // Bank & VietQR elements
  const selBankCode = document.getElementById('sel-bank-code');
  const inpBankName = document.getElementById('inp-bank-name');
  const inpAccountNumber = document.getElementById('inp-account-number');
  const inpAccountHolder = document.getElementById('inp-account-holder');
  const inpTransferNote = document.getElementById('inp-transfer-note');
  const btnGenerateVietQr = document.getElementById('btn-generate-vietqr');

  // Modal elements
  const shareModal = document.getElementById('share-modal');
  const shareLinkText = document.getElementById('share-link-text');
  const btnShareLink = document.getElementById('btn-share-link');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCopyShareLink = document.getElementById('btn-copy-share-link');
  const btnTestShareLink = document.getElementById('btn-test-share-link');

  // 3. Hiển thị thông báo Toast
  let toastTimer = null;
  function showToast(msg) {
    if (toastText) toastText.textContent = msg;
    if (toastNotice) {
      toastNotice.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastNotice.classList.remove('show');
      }, 2600);
    }
  }

  // 4. Tab Switching & Tab-Based Auto-Scroll in Preview
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const tabSectionMap = {
    'tab-names': 'section-hero',
    'tab-images': 'section-gallery',
    'tab-family': 'section-families',
    'tab-events': 'section-events',
    'tab-bank': 'section-thankyou'
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      // Tự động cuộn khung xem trước điện thoại tới đúng mục đang chỉnh sửa
      const targetSec = tabSectionMap[targetId];
      if (targetSec && previewIframe && previewIframe.contentWindow) {
        if (targetId === 'tab-bank') {
          previewIframe.contentWindow.postMessage({ type: 'OPEN_GIFT_MODAL' }, '*');
        } else {
          previewIframe.contentWindow.postMessage({ type: 'SCROLL_TO_SECTION', sectionId: targetSec }, '*');
        }
      }
    });
  });

  // 5. Nén ảnh thông minh bằng HTML5 Canvas (Tối ưu dung lượng để lưu localStorage mượt mà)
  function compressImage(file, maxWidth = 1000, maxHeight = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Tính toán tỉ lệ co dãn tối ưu
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Xuất file Base64 JPEG chất lượng cao
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 6. Cập nhật giao diện Form theo State
  function populateFormFromConfig(cfg) {
    if (inpGroomName) inpGroomName.value = cfg.groomName || '';
    if (inpBrideName) inpBrideName.value = cfg.brideName || '';
    if (inpWeddingDate) inpWeddingDate.value = cfg.weddingDate || '';
    if (inpLunarDate) inpLunarDate.value = cfg.lunarDate || '';

    // Music
    if (selBgMusic) {
      const foundOpt = Array.from(selBgMusic.options).find(opt => opt.value === cfg.bgMusicUrl);
      if (foundOpt) {
        selBgMusic.value = cfg.bgMusicUrl;
        if (inpCustomMusic) inpCustomMusic.style.display = 'none';
      } else if (cfg.bgMusicUrl) {
        selBgMusic.value = 'custom';
        if (inpCustomMusic) {
          inpCustomMusic.style.display = 'block';
          inpCustomMusic.value = cfg.bgMusicUrl;
        }
      }
    }

    // Photos
    if (imgPreviewHero) imgPreviewHero.src = cfg.heroPhoto || DEFAULT_CONFIG.heroPhoto;
    if (inpUrlHero) inpUrlHero.value = (cfg.heroPhoto && !cfg.heroPhoto.startsWith('data:')) ? cfg.heroPhoto : '';

    if (imgPreviewCouple) imgPreviewCouple.src = cfg.couplePhoto || DEFAULT_CONFIG.couplePhoto;
    if (inpUrlCouple) inpUrlCouple.value = (cfg.couplePhoto && !cfg.couplePhoto.startsWith('data:')) ? cfg.couplePhoto : '';

    if (imgPreviewQr) imgPreviewQr.src = cfg.qrCode || DEFAULT_CONFIG.qrCode;
    if (inpUrlQr) inpUrlQr.value = (cfg.qrCode && !cfg.qrCode.startsWith('data:')) ? cfg.qrCode : '';

    // Family
    if (inpGroomParents) inpGroomParents.value = cfg.groomParents || '';
    if (inpGroomAddress) inpGroomAddress.value = cfg.groomAddress || '';
    if (inpBrideParents) inpBrideParents.value = cfg.brideParents || '';
    if (inpBrideAddress) inpBrideAddress.value = cfg.brideAddress || '';

    // Events
    if (cfg.events && cfg.events.bride) {
      if (inpEv1Time) inpEv1Time.value = cfg.events.bride.time || '';
      if (inpEv1Venue) inpEv1Venue.value = cfg.events.bride.venue || '';
      if (inpEv1Address) inpEv1Address.value = cfg.events.bride.address || '';
    }
    if (cfg.events && cfg.events.groom) {
      if (inpEv2Time) inpEv2Time.value = cfg.events.groom.time || '';
      if (inpEv2Venue) inpEv2Venue.value = cfg.events.groom.venue || '';
      if (inpEv2Address) inpEv2Address.value = cfg.events.groom.address || '';
    }

    // Bank
    if (inpBankName) inpBankName.value = cfg.bankName || '';
    if (inpAccountNumber) inpAccountNumber.value = cfg.accountNumber || '';
    if (inpAccountHolder) inpAccountHolder.value = cfg.accountHolder || '';
    if (inpTransferNote) inpTransferNote.value = cfg.transferNote || '';

    renderGalleryThumbs();
  }

  // 7. Render danh sách thumbnail Album ảnh cưới
  function renderGalleryThumbs() {
    if (!galleryThumbsContainer) return;
    galleryThumbsContainer.innerHTML = '';
    const gallery = currentConfig.gallery || [];

    if (galleryCountText) {
      galleryCountText.textContent = `${gallery.length} ảnh trong album`;
    }

    gallery.forEach((url, index) => {
      const item = document.createElement('div');
      item.className = 'gallery-thumb-item';
      item.innerHTML = `
        <img src="${url}" alt="Album ${index + 1}" loading="lazy">
        <button type="button" class="gallery-thumb-remove" data-index="${index}" title="Xóa ảnh này">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      galleryThumbsContainer.appendChild(item);
    });

    // Bắt sự kiện xóa từng ảnh trong gallery
    galleryThumbsContainer.querySelectorAll('.gallery-thumb-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'));
        if (!isNaN(idx)) {
          currentConfig.gallery.splice(idx, 1);
          renderGalleryThumbs();
          syncToPreviewAndStore();
          showToast('Đã xóa 1 ảnh khỏi album');
        }
      });
    });
  }

  // 8. Đồng bộ cấu hình sang Iframe xem trước & lưu localStorage
  function syncToPreviewAndStore() {
    try {
      localStorage.setItem('wedding_custom_config', JSON.stringify(currentConfig));
    } catch (e) {
      console.warn('LocalStorage Quota Warning (Ảnh có thể quá lớn):', e);
    }

    // Tự động lưu cấu hình vào thiệp cưới đang chọn của tài khoản đã đăng nhập
    saveCurrentConfigToUserAccount();

    // Gửi Message sang Iframe đang mở index.html để cập nhật thời gian thực
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage({
        type: 'UPDATE_WEDDING_CONFIG',
        config: currentConfig
      }, '*');
    }
  }

  // 9. Lắng nghe thay đổi các trường nhập liệu Text
  function bindTextInputListeners() {
    const textInputs = [
      { el: inpGroomName, key: 'groomName' },
      { el: inpBrideName, key: 'brideName' },
      { el: inpWeddingDate, key: 'weddingDate' },
      { el: inpLunarDate, key: 'lunarDate' },
      { el: inpGroomParents, key: 'groomParents' },
      { el: inpGroomAddress, key: 'groomAddress' },
      { el: inpBrideParents, key: 'brideParents' },
      { el: inpBrideAddress, key: 'brideAddress' },
      { el: inpBankName, key: 'bankName' },
      { el: inpAccountNumber, key: 'accountNumber' },
      { el: inpAccountHolder, key: 'accountHolder' },
      { el: inpTransferNote, key: 'transferNote' }
    ];

    textInputs.forEach(item => {
      if (item.el) {
        item.el.addEventListener('input', () => {
          currentConfig[item.key] = item.el.value.trim();
          // Cập nhật lại gợi ý chuyển khoản nếu người dùng chưa sửa
          if (item.key === 'groomName' || item.key === 'brideName') {
            if (inpTransferNote && (!inpTransferNote.value || inpTransferNote.value.startsWith('Mừng cưới'))) {
              const autoNote = `Mừng cưới ${currentConfig.groomName || 'Hoàng Ninh'} - ${currentConfig.brideName || 'Mai Phương'}`;
              inpTransferNote.value = autoNote;
              currentConfig.transferNote = autoNote;
            }
          }
          syncToPreviewAndStore();
        });
      }
    });

    // Events inputs
    const evInputs = [
      { el: inpEv1Time, target: ['events', 'bride', 'time'] },
      { el: inpEv1Venue, target: ['events', 'bride', 'venue'] },
      { el: inpEv1Address, target: ['events', 'bride', 'address'] },
      { el: inpEv2Time, target: ['events', 'groom', 'time'] },
      { el: inpEv2Venue, target: ['events', 'groom', 'venue'] },
      { el: inpEv2Address, target: ['events', 'groom', 'address'] }
    ];

    evInputs.forEach(item => {
      if (item.el) {
        item.el.addEventListener('input', () => {
          if (!currentConfig.events) currentConfig.events = {};
          if (!currentConfig.events[item.target[1]]) currentConfig.events[item.target[1]] = {};
          currentConfig.events[item.target[1]][item.target[2]] = item.el.value.trim();
          syncToPreviewAndStore();
        });
      }
    });

    // Music Selector
    if (selBgMusic) {
      selBgMusic.addEventListener('change', () => {
        if (selBgMusic.value === 'custom') {
          if (inpCustomMusic) inpCustomMusic.style.display = 'block';
        } else {
          if (inpCustomMusic) inpCustomMusic.style.display = 'none';
          currentConfig.bgMusicUrl = selBgMusic.value;
          syncToPreviewAndStore();
          showToast('Đã đổi bài hát nền!');
        }
      });
    }

    if (inpCustomMusic) {
      inpCustomMusic.addEventListener('input', () => {
        const val = inpCustomMusic.value.trim();
        if (val) {
          currentConfig.bgMusicUrl = val;
          syncToPreviewAndStore();
        }
      });
    }

    // Auto Bank Dropdown -> Update Bank Name
    if (selBankCode && inpBankName) {
      selBankCode.addEventListener('change', () => {
        const code = selBankCode.value;
        if (BANK_NAMES[code]) {
          inpBankName.value = BANK_NAMES[code];
          currentConfig.bankName = BANK_NAMES[code];
          syncToPreviewAndStore();
        }
      });
    }

    // Auto VietQR Generator
    if (btnGenerateVietQr) {
      btnGenerateVietQr.addEventListener('click', () => {
        const bank = (selBankCode ? selBankCode.value : 'ACB') || 'ACB';
        const acc = (inpAccountNumber ? inpAccountNumber.value.trim() : '') || '873588';
        const holder = (inpAccountHolder ? inpAccountHolder.value.trim() : '') || 'HOANG VAN NINH';
        const note = (inpTransferNote ? inpTransferNote.value.trim() : '') || 'Mung cuoi';

        if (!acc) {
          alert('Vui lòng nhập Số Tài Khoản để tạo mã VietQR!');
          return;
        }

        // Tạo link ảnh VietQR chuẩn Napas 247
        const qrUrl = `https://img.vietqr.io/image/${bank}-${acc}-compact2.jpg?amount=&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(holder)}`;
        currentConfig.qrCode = qrUrl;
        if (imgPreviewQr) imgPreviewQr.src = qrUrl;
        if (inpUrlQr) inpUrlQr.value = qrUrl;
        syncToPreviewAndStore();
        showToast('Đã tạo mã VietQR tự động thành công!');
      });
    }
  }

  // 10. Xử lý tải ảnh lên (Upload & Nén ảnh tự động)
  function bindImageUploadListeners() {
    // A. Ảnh bìa Hero
    if (fileHeroPhoto) {
      fileHeroPhoto.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          showToast('Đang nén & xử lý ảnh bìa...');
          const compressed = await compressImage(file, 1000, 1300, 0.84);
          currentConfig.heroPhoto = compressed;
          if (imgPreviewHero) imgPreviewHero.src = compressed;
          if (inpUrlHero) inpUrlHero.value = '';
          syncToPreviewAndStore();
          showToast('Đã đổi ảnh bìa chính thành công!');
        } catch (err) {
          alert('Không thể đọc file ảnh này. Vui lòng thử file ảnh khác!');
        }
      });
    }
    if (inpUrlHero) {
      inpUrlHero.addEventListener('input', () => {
        const val = inpUrlHero.value.trim();
        if (val) {
          currentConfig.heroPhoto = val;
          if (imgPreviewHero) imgPreviewHero.src = val;
          syncToPreviewAndStore();
        }
      });
    }

    // B. Ảnh đôi uyên ương
    if (fileCouplePhoto) {
      fileCouplePhoto.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          showToast('Đang nén & xử lý ảnh đôi...');
          const compressed = await compressImage(file, 900, 1100, 0.84);
          currentConfig.couplePhoto = compressed;
          if (imgPreviewCouple) imgPreviewCouple.src = compressed;
          if (inpUrlCouple) inpUrlCouple.value = '';
          syncToPreviewAndStore();
          showToast('Đã đổi ảnh đôi thành công!');
        } catch (err) {
          alert('Không thể đọc file ảnh này.');
        }
      });
    }
    if (inpUrlCouple) {
      inpUrlCouple.addEventListener('input', () => {
        const val = inpUrlCouple.value.trim();
        if (val) {
          currentConfig.couplePhoto = val;
          if (imgPreviewCouple) imgPreviewCouple.src = val;
          syncToPreviewAndStore();
        }
      });
    }

    // C. Ảnh mã QR ngân hàng
    if (fileQrPhoto) {
      fileQrPhoto.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          showToast('Đang tải ảnh QR...');
          const compressed = await compressImage(file, 600, 600, 0.9);
          currentConfig.qrCode = compressed;
          if (imgPreviewQr) imgPreviewQr.src = compressed;
          if (inpUrlQr) inpUrlQr.value = '';
          syncToPreviewAndStore();
          showToast('Đã cập nhật mã QR mừng cưới!');
        } catch (err) {
          alert('Không thể đọc file ảnh QR.');
        }
      });
    }
    if (inpUrlQr) {
      inpUrlQr.addEventListener('input', () => {
        const val = inpUrlQr.value.trim();
        if (val) {
          currentConfig.qrCode = val;
          if (imgPreviewQr) imgPreviewQr.src = val;
          syncToPreviewAndStore();
        }
      });
    }

    // D. Nút khôi phục ảnh mẫu
    document.querySelectorAll('.btn-default-photo').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-restore');
        if (type === 'hero') {
          currentConfig.heroPhoto = DEFAULT_CONFIG.heroPhoto;
          if (imgPreviewHero) imgPreviewHero.src = DEFAULT_CONFIG.heroPhoto;
          if (inpUrlHero) inpUrlHero.value = DEFAULT_CONFIG.heroPhoto;
          syncToPreviewAndStore();
          showToast('Đã khôi phục ảnh bìa mẫu');
        } else if (type === 'couple') {
          currentConfig.couplePhoto = DEFAULT_CONFIG.couplePhoto;
          if (imgPreviewCouple) imgPreviewCouple.src = DEFAULT_CONFIG.couplePhoto;
          if (inpUrlCouple) inpUrlCouple.value = DEFAULT_CONFIG.couplePhoto;
          syncToPreviewAndStore();
          showToast('Đã khôi phục ảnh đôi mẫu');
        } else if (type === 'qr') {
          currentConfig.qrCode = DEFAULT_CONFIG.qrCode;
          if (imgPreviewQr) imgPreviewQr.src = DEFAULT_CONFIG.qrCode;
          if (inpUrlQr) inpUrlQr.value = DEFAULT_CONFIG.qrCode;
          syncToPreviewAndStore();
          showToast('Đã khôi phục QR mẫu');
        }
      });
    });

    // E. Album ảnh cưới (Multi-Upload)
    if (fileGalleryMulti) {
      fileGalleryMulti.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        showToast(`Đang tải lên và nén ${files.length} ảnh vào album...`);
        let count = 0;
        for (const file of files) {
          try {
            const compressed = await compressImage(file, 800, 950, 0.78);
            if (!currentConfig.gallery) currentConfig.gallery = [];
            currentConfig.gallery.push(compressed);
            count++;
          } catch (err) {
            console.warn('Lỗi ảnh gallery:', err);
          }
        }

        renderGalleryThumbs();
        syncToPreviewAndStore();
        showToast(`Đã thêm thành công ${count} ảnh vào album!`);
        fileGalleryMulti.value = '';
      });
    }

    if (btnRestoreGallery) {
      btnRestoreGallery.addEventListener('click', () => {
        currentConfig.gallery = [...DEFAULT_CONFIG.gallery];
        renderGalleryThumbs();
        syncToPreviewAndStore();
        showToast('Đã khôi phục album ảnh mẫu');
      });
    }

    if (btnClearGallery) {
      btnClearGallery.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả ảnh trong album?')) {
          currentConfig.gallery = [];
          renderGalleryThumbs();
          syncToPreviewAndStore();
          showToast('Đã làm trống album ảnh');
        }
      });
    }
  }

  // 11. Các nút hành động trên Header (Xuất, Nhập, Tạo Link, Xuất HTML)
  function bindHeaderActionListeners() {
    // A. Khôi phục mặc định toàn bộ
    const btnResetDefault = document.getElementById('btn-reset-default');
    if (btnResetDefault) {
      btnResetDefault.addEventListener('click', () => {
        if (confirm('Khôi phục toàn bộ thông tin thiệp về mẫu mặc định ban đầu?')) {
          currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
          localStorage.removeItem('wedding_custom_config');
          populateFormFromConfig(currentConfig);
          syncToPreviewAndStore();
          showToast('Đã khôi phục toàn bộ mẫu mặc định');
        }
      });
    }

    // B. Xuất file cấu hình JSON
    const btnExportJson = document.getElementById('btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        const jsonStr = JSON.stringify(currentConfig, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `thiep-cuoi-${(currentConfig.groomName || 'chu-re')}-${(currentConfig.brideName || 'co-dau')}.json`
          .toLowerCase()
          .replace(/[\s\.]+/g, '-');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Đã xuất file cấu hình JSON!');
      });
    }

    // C. Nhập file cấu hình JSON
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const fileImportJson = document.getElementById('file-import-json');
    if (btnImportTrigger && fileImportJson) {
      btnImportTrigger.addEventListener('click', () => fileImportJson.click());
      fileImportJson.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (imported && typeof imported === 'object') {
              currentConfig = Object.assign({}, DEFAULT_CONFIG, imported);
              populateFormFromConfig(currentConfig);
              syncToPreviewAndStore();
              showToast('Đã nhập file cấu hình thành công!');
            } else {
              alert('File JSON không hợp lệ!');
            }
          } catch (err) {
            alert('Lỗi đọc file JSON: ' + err.message);
          }
        };
        reader.readAsText(file);
        fileImportJson.value = '';
      });
    }

    // D. Xuất file web HTML độc lập (Standalone HTML Export)
    const btnExportHtml = document.getElementById('btn-export-html');
    if (btnExportHtml) {
      btnExportHtml.addEventListener('click', async () => {
        try {
          showToast('Đang tạo file web độc lập...');
          const res = await fetch('index.html');
          if (!res.ok) throw new Error('Không thể đọc file index.html');
          let htmlContent = await res.text();

          // Nhúng script chứa cấu hình trực tiếp vào trang web độc lập
          const injectScript = `\n  <script>window.EMBEDDED_WEDDING_CONFIG = ${JSON.stringify(currentConfig)};</script>\n`;
          htmlContent = htmlContent.replace('</head>', `${injectScript}</head>`);

          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const filename = `thiep-cuoi-${(currentConfig.groomName || 'chu-re')}-${(currentConfig.brideName || 'co-dau')}.html`
            .toLowerCase()
            .replace(/[\s\.]+/g, '-');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('Đã tải xuống file web thiệp cưới độc lập!');
        } catch (err) {
          alert('Lỗi xuất file web: ' + err.message);
        }
      });
    }

    // E. Tạo Link chia sẻ (Share Link Modal)
    if (btnShareLink && shareModal) {
      btnShareLink.addEventListener('click', () => {
        const shareUrl = getInvitationShareUrl(currentConfig);
        if (shareLinkText) shareLinkText.textContent = shareUrl;
        if (btnTestShareLink) btnTestShareLink.href = shareUrl;
        shareModal.classList.add('active');
      });
    }

    if (btnCloseModal && shareModal) {
      btnCloseModal.addEventListener('click', () => {
        shareModal.classList.remove('active');
      });
    }

    if (btnCopyShareLink && shareLinkText) {
      btnCopyShareLink.addEventListener('click', () => {
        const text = shareLinkText.textContent.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            showToast('Đã sao chép link thiệp vào bộ nhớ tạm!');
            shareModal.classList.remove('active');
          });
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('Đã sao chép link thiệp!');
          shareModal.classList.remove('active');
        }
      });
    }

    // F. Nút Xem Full màn hình
    const btnOpenFullscreen = document.getElementById('btn-open-fullscreen');
    if (btnOpenFullscreen) {
      btnOpenFullscreen.addEventListener('click', (e) => {
        e.preventDefault();
        syncToPreviewAndStore();
        window.open('index.html', '_blank');
      });
    }
  }

  // 12. Preview Toolbar: Thay đổi kích thước, Mở cổng, Refresh iframe
  function bindPreviewToolbar() {
    const phoneFrame = document.getElementById('phone-frame');
    const sizeBtns = document.querySelectorAll('.preview-size-btn[data-size]');
    const btnToggleGate = document.getElementById('btn-toggle-preview-gate');
    const btnRefresh = document.getElementById('btn-refresh-preview');

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.getAttribute('data-size');
        if (phoneFrame) {
          if (size === 'tablet') {
            phoneFrame.classList.add('tablet');
          } else {
            phoneFrame.classList.remove('tablet');
          }
        }
      });
    });

    if (btnToggleGate && previewIframe) {
      btnToggleGate.addEventListener('click', () => {
        if (previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: 'OPEN_GATE' }, '*');
          showToast('Đang mở cánh cổng hoàng gia trong bản xem trước...');
        }
      });
    }

    if (btnRefresh && previewIframe) {
      btnRefresh.addEventListener('click', () => {
        previewIframe.src = previewIframe.src;
        showToast('Đang làm mới bản xem trước...');
      });
    }

    // Khi iframe tải xong, truyền cấu hình hiện tại sang để đảm bảo đồng bộ 100%
    if (previewIframe) {
      previewIframe.addEventListener('load', () => {
        setTimeout(() => {
          syncToPreviewAndStore();
        }, 300);
      });
    }
  }

  // 13. Hệ thống Đăng ký, Đăng nhập & Quản lý Danh Sách Thiệp Cưới
  function bindAuthAndInvitationsSystem() {
    // Elements
    const userGuestView = document.getElementById('user-guest-view');
    const userLoggedView = document.getElementById('user-logged-view');
    const btnOpenLogin = document.getElementById('btn-open-login');
    const btnOpenRegister = document.getElementById('btn-open-register');
    const btnUserMenu = document.getElementById('btn-user-menu');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const userDisplayName = document.getElementById('user-display-name');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    const userAvatarInitial = document.getElementById('user-avatar-initial');
    const btnMyInvitations = document.getElementById('btn-my-invitations');
    const btnCreateNewInvitation = document.getElementById('btn-create-new-invitation');
    const btnLogout = document.getElementById('btn-logout');

    const authGuestBanner = document.getElementById('auth-guest-banner');
    const btnBannerAuth = document.getElementById('btn-banner-auth');

    const authModal = document.getElementById('auth-modal');
    const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
    const authTabLogin = document.getElementById('auth-tab-login');
    const authTabRegister = document.getElementById('auth-tab-register');
    const formAuthLogin = document.getElementById('form-auth-login');
    const formAuthRegister = document.getElementById('form-auth-register');
    const authErrorMsg = document.getElementById('auth-error-msg');
    const linkSwitchRegister = document.getElementById('link-switch-register');
    const linkSwitchLogin = document.getElementById('link-switch-login');

    const inpLoginAccount = document.getElementById('auth-login-account');
    const inpLoginPwd = document.getElementById('auth-login-pwd');

    const inpRegFullname = document.getElementById('auth-reg-fullname');
    const inpRegAccount = document.getElementById('auth-reg-account');
    const inpRegPwd = document.getElementById('auth-reg-pwd');
    const inpRegPwd2 = document.getElementById('auth-reg-pwd2');

    const myInvitationsModal = document.getElementById('my-invitations-modal');
    const btnCloseInvModal = document.getElementById('btn-close-invitations-modal');
    const btnCloseInvBottom = document.getElementById('btn-close-invitations-bottom');
    const invitationsContainer = document.getElementById('invitations-container');
    const btnCreateInvAction = document.getElementById('btn-create-inv-action');

    // Helper: Show Error in Auth Modal
    function showAuthError(msg) {
      if (authErrorMsg) {
        authErrorMsg.textContent = msg;
        authErrorMsg.style.display = 'block';
      }
    }

    function clearAuthError() {
      if (authErrorMsg) {
        authErrorMsg.textContent = '';
        authErrorMsg.style.display = 'none';
      }
    }

    // Helper: Switch Auth Tab
    function switchAuthTab(tab) {
      clearAuthError();
      if (tab === 'register') {
        if (authTabLogin) authTabLogin.classList.remove('active');
        if (authTabRegister) authTabRegister.classList.add('active');
        if (formAuthLogin) formAuthLogin.style.display = 'none';
        if (formAuthRegister) formAuthRegister.style.display = 'block';
      } else {
        if (authTabRegister) authTabRegister.classList.remove('active');
        if (authTabLogin) authTabLogin.classList.add('active');
        if (formAuthRegister) formAuthRegister.style.display = 'none';
        if (formAuthLogin) formAuthLogin.style.display = 'block';
      }
    }

    function openAuthModal(tab = 'login') {
      switchAuthTab(tab);
      if (authModal) authModal.classList.add('active');
    }

    function closeAuthModal() {
      if (authModal) authModal.classList.remove('active');
      clearAuthError();
    }

    // Helper: Render User Header / UI
    function updateAuthUI() {
      const session = getCurrentSession();
      if (session) {
        const db = getUsersDB();
        const user = db.find(u => u.id === session.userId);
        if (user) {
          if (userGuestView) userGuestView.style.display = 'none';
          if (userLoggedView) userLoggedView.style.display = 'block';
          if (authGuestBanner) authGuestBanner.style.display = 'none';

          if (userDisplayName) userDisplayName.textContent = user.fullname || 'Người dùng';
          if (dropdownUserName) dropdownUserName.textContent = user.fullname || 'Người dùng';
          if (dropdownUserEmail) dropdownUserEmail.textContent = user.account || '';

          const initial = getAvatarInitial(user.fullname);
          if (userAvatarInitial) userAvatarInitial.textContent = initial;
          return;
        }
      }

      // Guest mode
      if (userGuestView) userGuestView.style.display = 'flex';
      if (userLoggedView) userLoggedView.style.display = 'none';
      if (authGuestBanner) authGuestBanner.style.display = 'flex';
      if (userDropdownMenu) userDropdownMenu.classList.remove('show');
    }

    // Event listeners for open modal buttons
    if (btnOpenLogin) {
      btnOpenLogin.addEventListener('click', () => openAuthModal('login'));
    }
    if (btnOpenRegister) {
      btnOpenRegister.addEventListener('click', () => openAuthModal('register'));
    }
    if (btnBannerAuth) {
      btnBannerAuth.addEventListener('click', () => openAuthModal('register'));
    }
    if (linkSwitchRegister) {
      linkSwitchRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('register');
      });
    }
    if (linkSwitchLogin) {
      linkSwitchLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('login');
      });
    }
    if (authTabLogin) {
      authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    }
    if (authTabRegister) {
      authTabRegister.addEventListener('click', () => switchAuthTab('register'));
    }
    if (btnCloseAuthModal) {
      btnCloseAuthModal.addEventListener('click', closeAuthModal);
    }
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
      });
    }

    // Toggle Password Visibility
    document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
          input.type = 'text';
          if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          }
        } else {
          input.type = 'password';
          if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        }
      });
    });

    // Form Login Submit
    if (formAuthLogin) {
      formAuthLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAuthError();

        const account = (inpLoginAccount ? inpLoginAccount.value.trim() : '');
        const pwd = (inpLoginPwd ? inpLoginPwd.value.trim() : '');

        if (!account || !pwd) {
          showAuthError('Vui lòng nhập đầy đủ thông tin đăng nhập!');
          return;
        }

        const db = getUsersDB();
        const user = db.find(u => (u.account.toLowerCase() === account.toLowerCase() || u.id === account) && u.password === pwd);

        if (!user) {
          showAuthError('Email/Số điện thoại hoặc mật khẩu không chính xác!');
          return;
        }

        // Login thành công
        setCurrentSession(user);
        updateAuthUI();

        // Load active invitation if available
        if (user.invitations && user.invitations.length > 0) {
          const activeInv = user.invitations.find(inv => inv.id === user.activeInvitationId) || user.invitations[0];
          user.activeInvitationId = activeInv.id;
          saveUsersDB(db);
          currentConfig = Object.assign({}, DEFAULT_CONFIG, activeInv.config);
          populateFormFromConfig(currentConfig);
          renderGalleryThumbs();
          syncToPreviewAndStore();
        } else {
          // Lưu trạng thái hiện tại vào tài khoản mới đăng nhập
          saveCurrentConfigToUserAccount();
        }

        closeAuthModal();
        if (inpLoginPwd) inpLoginPwd.value = '';
        showToast(`Đăng nhập thành công! Chào mừng ${user.fullname} trở lại.`);
      });
    }

    // Form Register Submit
    if (formAuthRegister) {
      formAuthRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAuthError();

        const fullname = (inpRegFullname ? inpRegFullname.value.trim() : '');
        const account = (inpRegAccount ? inpRegAccount.value.trim() : '');
        const pwd = (inpRegPwd ? inpRegPwd.value.trim() : '');
        const pwd2 = (inpRegPwd2 ? inpRegPwd2.value.trim() : '');

        if (!fullname || !account || !pwd || !pwd2) {
          showAuthError('Vui lòng điền đầy đủ các thông tin đăng ký!');
          return;
        }

        if (pwd.length < 6) {
          showAuthError('Mật khẩu phải có độ dài tối thiểu từ 6 ký tự!');
          return;
        }

        if (pwd !== pwd2) {
          showAuthError('Mật khẩu xác nhận không trùng khớp!');
          return;
        }

        const db = getUsersDB();
        const existing = db.find(u => u.account.toLowerCase() === account.toLowerCase());
        if (existing) {
          showAuthError('Tài khoản hoặc email này đã tồn tại trên hệ thống!');
          return;
        }

        // Tạo tài khoản mới, đồng thời tự động lưu cấu hình đang làm dở thành thiệp đầu tiên
        const newUserId = 'user_' + Date.now();
        const newInvId = 'inv_' + Date.now();
        const initialTitle = `Thiệp Cưới ${currentConfig.groomName || 'Chú Rể'} & ${currentConfig.brideName || 'Cô Dâu'}`;

        const newUser = {
          id: newUserId,
          fullname: fullname,
          account: account,
          password: pwd,
          createdAt: new Date().toISOString(),
          activeInvitationId: newInvId,
          invitations: [
            {
              id: newInvId,
              title: initialTitle,
              updatedAt: new Date().toISOString(),
              config: JSON.parse(JSON.stringify(currentConfig))
            }
          ]
        };

        db.push(newUser);
        saveUsersDB(db);

        setCurrentSession(newUser);
        updateAuthUI();
        closeAuthModal();

        if (inpRegPwd) inpRegPwd.value = '';
        if (inpRegPwd2) inpRegPwd2.value = '';
        showToast(`Đăng ký thành công! Đã tự động lưu thiệp cưới vào tài khoản.`);
      });
    }

    // User Dropdown Menu Toggle
    if (btnUserMenu && userDropdownMenu) {
      btnUserMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
        if (userLoggedView && !userLoggedView.contains(e.target)) {
          userDropdownMenu.classList.remove('show');
        }
      });
    }

    // Logout
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        clearSession();
        if (userDropdownMenu) userDropdownMenu.classList.remove('show');
        updateAuthUI();
        showToast('Đã đăng xuất tài khoản!');
      });
    }

    // My Invitations Modal Functionality
    function renderUserInvitations() {
      if (!invitationsContainer) return;
      const session = getCurrentSession();
      if (!session) {
        openAuthModal('login');
        return;
      }

      const db = getUsersDB();
      const user = db.find(u => u.id === session.userId);
      if (!user) {
        openAuthModal('login');
        return;
      }

      if (!user.invitations || user.invitations.length === 0) {
        invitationsContainer.innerHTML = `
          <div style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 38px; color: var(--accent-gold); margin-bottom: 12px; opacity: 0.8;"></i>
            <p>Bạn chưa có thiệp cưới nào được lưu.</p>
            <p style="font-size: 12px;">Nhấn nút bên dưới để tạo thiệp cưới đầu tiên!</p>
          </div>
        `;
        return;
      }

      let html = '';
      user.invitations.forEach((inv) => {
        const isCurrent = (inv.id === user.activeInvitationId);
        const thumbUrl = (inv.config && inv.config.heroPhoto) ? inv.config.heroPhoto : 'image/chinh.jpg';
        const weddingDate = (inv.config && inv.config.weddingDate) ? inv.config.weddingDate : 'Chưa định ngày';
        const title = inv.title || 'Thiệp Cưới';
        const timeFormatted = formatTime(inv.updatedAt);

        html += `
          <div class="invitation-card-item ${isCurrent ? 'active' : ''}">
            <div class="invitation-item-info">
              <img src="${thumbUrl}" alt="Thumbnail" class="invitation-thumb-mini" onerror="this.src='image/chinh.jpg'">
              <div>
                <div class="invitation-item-title">
                  ${escapeHtml(title)}
                  ${isCurrent ? '<span class="invitation-item-badge"><i class="fa-solid fa-check"></i> Đang sửa</span>' : ''}
                </div>
                <div class="invitation-item-date">
                  <i class="fa-solid fa-calendar-heart" style="color: var(--accent-gold); margin-right: 4px;"></i>
                  Ngày cưới: <strong>${escapeHtml(weddingDate)}</strong>
                  &bull; <i class="fa-regular fa-clock" style="margin-left: 4px; margin-right: 2px;"></i> ${timeFormatted}
                </div>
              </div>
            </div>
            <div class="invitation-item-actions">
              ${isCurrent
                ? '<button type="button" class="btn-inv-action btn-inv-load" style="opacity: 0.7; cursor: default;"><i class="fa-solid fa-pen-nib"></i> Đang mở</button>'
                : `<button type="button" class="btn-inv-action btn-inv-load btn-load-inv" data-id="${inv.id}"><i class="fa-solid fa-pencil"></i> Mở sửa</button>`
              }
              <button type="button" class="btn-inv-action btn-inv-secondary btn-view-inv" data-id="${inv.id}" title="Xem toàn màn hình thiệp này">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button type="button" class="btn-inv-action btn-inv-secondary btn-share-inv" data-id="${inv.id}" title="Lấy link chia sẻ">
                <i class="fa-solid fa-share-nodes"></i>
              </button>
              ${user.invitations.length > 1
                ? `<button type="button" class="btn-inv-action btn-inv-delete btn-del-inv" data-id="${inv.id}" title="Xóa thiệp cưới này"><i class="fa-solid fa-trash-can"></i></button>`
                : ''
              }
            </div>
          </div>
        `;
      });

      invitationsContainer.innerHTML = html;

      // Event: Load/Switch Invitation
      invitationsContainer.querySelectorAll('.btn-load-inv').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const targetInv = user.invitations.find(i => i.id === id);
          if (targetInv) {
            user.activeInvitationId = targetInv.id;
            saveUsersDB(db);
            currentConfig = Object.assign({}, DEFAULT_CONFIG, targetInv.config);
            populateFormFromConfig(currentConfig);
            renderGalleryThumbs();
            syncToPreviewAndStore();
            if (myInvitationsModal) myInvitationsModal.classList.remove('active');
            showToast(`Đã mở thiệp cưới: ${targetInv.title}`);
          }
        });
      });

      // Event: View Invitation in New Tab
      invitationsContainer.querySelectorAll('.btn-view-inv').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const targetInv = user.invitations.find(i => i.id === id);
          if (targetInv && targetInv.config) {
            const shareUrl = getInvitationShareUrl(targetInv.config);
            window.open(shareUrl, '_blank');
          }
        });
      });

      // Event: Share Invitation Link
      invitationsContainer.querySelectorAll('.btn-share-inv').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const targetInv = user.invitations.find(i => i.id === id);
          if (targetInv && targetInv.config) {
            const shareUrl = getInvitationShareUrl(targetInv.config);
            if (shareLinkText) shareLinkText.textContent = shareUrl;
            if (btnTestShareLink) btnTestShareLink.href = shareUrl;
            if (myInvitationsModal) myInvitationsModal.classList.remove('active');
            if (shareModal) shareModal.classList.add('active');
          }
        });
      });

      // Event: Delete Invitation
      invitationsContainer.querySelectorAll('.btn-del-inv').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const targetInv = user.invitations.find(i => i.id === id);
          if (!targetInv) return;

          if (confirm(`Bạn có chắc chắn muốn xóa "${targetInv.title}" không?`)) {
            user.invitations = user.invitations.filter(i => i.id !== id);
            if (user.activeInvitationId === id) {
              user.activeInvitationId = user.invitations[0].id;
              currentConfig = Object.assign({}, DEFAULT_CONFIG, user.invitations[0].config);
              populateFormFromConfig(currentConfig);
              renderGalleryThumbs();
            }
            saveUsersDB(db);
            syncToPreviewAndStore();
            renderUserInvitations();
            showToast('Đã xóa thiệp cưới!');
          }
        });
      });
    }

    // Open/Close My Invitations Modal
    if (btnMyInvitations) {
      btnMyInvitations.addEventListener('click', () => {
        if (userDropdownMenu) userDropdownMenu.classList.remove('show');
        renderUserInvitations();
        if (myInvitationsModal) myInvitationsModal.classList.add('active');
      });
    }

    if (btnCloseInvModal) {
      btnCloseInvModal.addEventListener('click', () => {
        if (myInvitationsModal) myInvitationsModal.classList.remove('active');
      });
    }

    if (btnCloseInvBottom) {
      btnCloseInvBottom.addEventListener('click', () => {
        if (myInvitationsModal) myInvitationsModal.classList.remove('active');
      });
    }

    if (myInvitationsModal) {
      myInvitationsModal.addEventListener('click', (e) => {
        if (e.target === myInvitationsModal) myInvitationsModal.classList.remove('active');
      });
    }

    // Helper: Create new invitation
    function createNewInvitation() {
      const session = getCurrentSession();
      if (!session) {
        openAuthModal('login');
        return;
      }

      const db = getUsersDB();
      const user = db.find(u => u.id === session.userId);
      if (!user) {
        openAuthModal('login');
        return;
      }

      const count = (user.invitations ? user.invitations.length : 0) + 1;
      const defaultTitle = `Thiệp Cưới Mới #${count} - ${user.fullname || 'Hoàng Gia'}`;
      const title = prompt('Nhập tên cho thiệp cưới mới của bạn:', defaultTitle);
      if (title === null) return; // User cancelled

      const newId = 'inv_' + Date.now();
      const newInv = {
        id: newId,
        title: title.trim() || defaultTitle,
        updatedAt: new Date().toISOString(),
        config: JSON.parse(JSON.stringify(DEFAULT_CONFIG))
      };

      if (!user.invitations) user.invitations = [];
      user.invitations.unshift(newInv);
      user.activeInvitationId = newId;
      saveUsersDB(db);

      currentConfig = JSON.parse(JSON.stringify(newInv.config));
      populateFormFromConfig(currentConfig);
      renderGalleryThumbs();
      syncToPreviewAndStore();

      if (myInvitationsModal) myInvitationsModal.classList.remove('active');
      if (userDropdownMenu) userDropdownMenu.classList.remove('show');

      showToast(`Đã tạo thành công: ${newInv.title}`);
    }

    if (btnCreateNewInvitation) {
      btnCreateNewInvitation.addEventListener('click', createNewInvitation);
    }
    if (btnCreateInvAction) {
      btnCreateInvAction.addEventListener('click', createNewInvitation);
    }

    // Initial Auth UI update
    updateAuthUI();
  }

  // 14. Khởi tạo toàn bộ
  populateFormFromConfig(currentConfig);
  bindTextInputListeners();
  bindImageUploadListeners();
  bindHeaderActionListeners();
  bindPreviewToolbar();
  bindAuthAndInvitationsSystem();

});
