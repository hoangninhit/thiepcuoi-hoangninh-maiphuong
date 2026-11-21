/**
 * CÔNG CỤ TẠO & TÙY BIẾN THIỆP CƯỚI HOÀNG GIA (TAO-THIEP.JS)
 * Quản lý trạng thái, nén ảnh HTML5 Canvas, gửi postMessage thời gian thực tới Iframe
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Dữ liệu mặc định ban đầu (Hoàng Ninh & Mai Phương)
  const DEFAULT_CONFIG = {
    groomName: 'HOÀNG NINH',
    brideName: 'MAI PHƯƠNG',
    weddingDate: '18 . 12 . 2026',
    lunarDate: '10 tháng 11 năm Bính Ngọ',
    heroPhoto: 'image/chinh.jpg',
    couplePhoto: 'image/188A6221.JPG',
    qrCode: 'image/qr_acb.svg',
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

  // State hiện tại (được tải từ localStorage nếu đã lưu trước đó)
  let currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  try {
    const saved = localStorage.getItem('wedding_custom_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        currentConfig = Object.assign({}, DEFAULT_CONFIG, parsed);
        if (parsed.events) currentConfig.events = Object.assign({}, DEFAULT_CONFIG.events, parsed.events);
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

  // Bank elements
  const inpBankName = document.getElementById('inp-bank-name');
  const inpAccountNumber = document.getElementById('inp-account-number');
  const inpAccountHolder = document.getElementById('inp-account-holder');
  const inpTransferNote = document.getElementById('inp-transfer-note');

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

  // 4. Tab Switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
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

    // Photos
    if (imgPreviewHero) imgPreviewHero.src = cfg.heroPhoto || DEFAULT_CONFIG.heroPhoto;
    if (inpUrlHero) inpUrlHero.value = cfg.heroPhoto || '';

    if (imgPreviewCouple) imgPreviewCouple.src = cfg.couplePhoto || DEFAULT_CONFIG.couplePhoto;
    if (inpUrlCouple) inpUrlCouple.value = cfg.couplePhoto || '';

    if (imgPreviewQr) imgPreviewQr.src = cfg.qrCode || DEFAULT_CONFIG.qrCode;
    if (inpUrlQr) inpUrlQr.value = cfg.qrCode || '';

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
  }

  // 10. Xử lý tải ảnh lên (Upload & Nén ảnh tự động)
  function bindImageUploadListeners() {
    // A. Ảnh bìa Hero
    if (fileHeroPhoto) {
      fileHeroPhoto.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          showToast('Đang xử lý ảnh bìa...');
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
          showToast('Đang xử lý ảnh đôi...');
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

        showToast(`Đang tải lên ${files.length} ảnh vào album...`);
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

  // 11. Các nút hành động trên Header (Xuất, Nhập, Tạo Link)
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

    // D. Tạo Link chia sẻ (Share Link Modal)
    if (btnShareLink && shareModal) {
      btnShareLink.addEventListener('click', () => {
        // Tạo chuỗi cấu hình nén Base64
        // Để URL không bị quá dài do chứa ảnh Base64 dung lượng lớn, tạo một bản rút gọn các trường văn bản + link ảnh online
        const shareData = {
          groomName: currentConfig.groomName,
          brideName: currentConfig.brideName,
          weddingDate: currentConfig.weddingDate,
          lunarDate: currentConfig.lunarDate,
          groomParents: currentConfig.groomParents,
          groomAddress: currentConfig.groomAddress,
          brideParents: currentConfig.brideParents,
          brideAddress: currentConfig.brideAddress,
          bankName: currentConfig.bankName,
          accountNumber: currentConfig.accountNumber,
          accountHolder: currentConfig.accountHolder,
          transferNote: currentConfig.transferNote,
          events: currentConfig.events
        };

        // Nếu ảnh là URL (không phải Base64 quá dài) thì kèm vào URL
        if (currentConfig.heroPhoto && !currentConfig.heroPhoto.startsWith('data:')) {
          shareData.heroPhoto = currentConfig.heroPhoto;
        }
        if (currentConfig.couplePhoto && !currentConfig.couplePhoto.startsWith('data:')) {
          shareData.couplePhoto = currentConfig.couplePhoto;
        }
        if (currentConfig.qrCode && !currentConfig.qrCode.startsWith('data:')) {
          shareData.qrCode = currentConfig.qrCode;
        }

        const encodedJson = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
        const baseUrl = window.location.origin + window.location.pathname.replace('tao-thiep.html', 'index.html');
        const shareUrl = `${baseUrl}?cfg=${encodedJson}`;

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
          // Fallback
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
  }

  // 12. Preview Toolbar: Thay đổi kích thước & Refresh iframe
  function bindPreviewToolbar() {
    const phoneFrame = document.getElementById('phone-frame');
    const sizeBtns = document.querySelectorAll('.preview-size-btn');
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

  // 13. Khởi tạo toàn bộ
  populateFormFromConfig(currentConfig);
  bindTextInputListeners();
  bindImageUploadListeners();
  bindHeaderActionListeners();
  bindPreviewToolbar();

});
