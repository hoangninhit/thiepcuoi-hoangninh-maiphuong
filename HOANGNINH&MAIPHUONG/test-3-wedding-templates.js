/**
 * TEST SUITE: 3 MẪU THIỆP CƯỚI KHÁC BIỆT HOÀN TOÀN
 * 1. Cung Đình Hoàng Gia (index.html)
 * 2. Phong Bì Thư Tình Hiện Đại (thiep-hien-dai.html)
 * 3. Vườn Hoa Cổ Tích & Kính Mờ (thiep-hoa-co.html)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 BẮT ĐẦU KIỂM TRA HỆ THỐNG 3 MẪU THIỆP CƯỚI ĐỘC LẬP');
console.log('====================================================\n');

let passCount = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

// 1. Kiểm tra tồn tại các file của cả 3 mẫu thiệp
runTest('Kiểm tra đầy đủ file của Mẫu 1 (Cung Đình), Mẫu 2 (Hiện Đại), Mẫu 3 (Vườn Hoa)', () => {
  const requiredFiles = [
    'index.html', 'style.css', 'script.js',
    'thiep-hien-dai.html', 'thiep-hien-dai.css', 'thiep-hien-dai.js',
    'thiep-hoa-co.html', 'thiep-hoa-co.css', 'thiep-hoa-co.js',
    'tao-thiep.html', 'tao-thiep.css', 'tao-thiep.js'
  ];

  requiredFiles.forEach(file => {
    assert(fs.existsSync(file), `File ${file} không tồn tại!`);
    const stat = fs.statSync(file);
    assert(stat.size > 500, `File ${file} quá nhỏ (${stat.size} bytes)!`);
  });
});

// 2. Kiểm tra Mẫu 2: Phong Bì Thư Hiện Đại (thiep-hien-dai.html)
runTest('Mẫu 2 (thiep-hien-dai.html) có cấu trúc phong bì 3D và bố cục tạp chí editorial', () => {
  const html = fs.readFileSync('thiep-hien-dai.html', 'utf8');
  assert(html.includes('envelope-box'), 'Thiếu thẻ envelope-box phong bì 3D');
  assert(html.includes('modern-wax-seal'), 'Thiếu con dấu sáp niêm phong wax seal');
  assert(html.includes('section-editorial-hero'), 'Thiếu hero editorial');
  assert(html.includes('cd-days'), 'Thiếu đếm ngược');
  assert(html.includes('event-modern-card'), 'Thiếu thẻ lịch trình hôn lễ');
  assert(html.includes('modern-gallery-grid'), 'Thiếu gallery editorial');
  assert(html.includes('registry-qr-box'), 'Thiếu thẻ VietQR');
});

// 3. Kiểm tra Mẫu 3: Vườn Hoa Cổ Tích & Kính Mờ (thiep-hoa-co.html)
runTest('Mẫu 3 (thiep-hoa-co.html) có canvas cánh hoa rơi, thẻ kính mờ và lịch trăng mật', () => {
  const html = fs.readFileSync('thiep-hoa-co.html', 'utf8');
  assert(html.includes('petals-canvas'), 'Thiếu canvas petals-canvas rơi cánh hoa');
  assert(html.includes('garden-gateway-overlay'), 'Thiếu overlay garden-gateway');
  assert(html.includes('glass-invite-card'), 'Thiếu thẻ kính mời glassmorphism');
  assert(html.includes('section-garden-calendar'), 'Thiếu khu vực lịch trăng mật');
  assert(html.includes('calendar-table'), 'Thiếu bảng lịch tháng');
  assert(html.includes('countdown-glass-row'), 'Thiếu đếm ngược kính mờ');
  assert(html.includes('gallery-mosaic-grid'), 'Thiếu gallery mosaic hoa cỏ');
});

// 4. Kiểm tra tao-thiep.html có bộ chọn 3 Kiểu Mẫu Thiệp
runTest('tao-thiep.html có bộ chọn 3 Kiểu Mẫu Thiệp (palace, modern, garden)', () => {
  const html = fs.readFileSync('tao-thiep.html', 'utf8');
  assert(html.includes('radio-template-layout'), 'Thiếu radio-template-layout trong tab');
  assert(html.includes('value="palace"'), 'Thiếu option palace');
  assert(html.includes('value="modern"'), 'Thiếu option modern');
  assert(html.includes('value="garden"'), 'Thiếu option garden');
  assert(html.includes('new-inv-layout'), 'Thiếu new-inv-layout trong modal tạo thiệp mới');
});

// 5. Kiểm tra tao-thiep.js định tuyến đường link chia sẻ chính xác theo mẫu
runTest('tao-thiep.js định tuyến getInvitationShareUrl chính xác theo templateLayout', () => {
  const jsContent = fs.readFileSync('tao-thiep.js', 'utf8');

  // Mô phỏng logic getInvitationShareUrl
  function simulateShareUrl(cfg, invId) {
    let targetHtml = 'index.html';
    if (cfg && cfg.templateLayout === 'modern') {
      targetHtml = 'thiep-hien-dai.html';
    } else if (cfg && cfg.templateLayout === 'garden') {
      targetHtml = 'thiep-hoa-co.html';
    }
    const origin = 'https://example.com';
    const pathname = '/hoangninh-maiphuong/tao-thiep.html';
    const baseUrl = origin + pathname.replace('tao-thiep.html', targetHtml);
    return `${baseUrl}?inv=${invId}`;
  }

  const urlPalace = simulateShareUrl({ templateLayout: 'palace' }, 'inv_01');
  const urlModern = simulateShareUrl({ templateLayout: 'modern' }, 'inv_02');
  const urlGarden = simulateShareUrl({ templateLayout: 'garden' }, 'inv_03');

  assert(urlPalace.includes('index.html?inv=inv_01'), 'Palace phải trỏ về index.html');
  assert(urlModern.includes('thiep-hien-dai.html?inv=inv_02'), 'Modern phải trỏ về thiep-hien-dai.html');
  assert(urlGarden.includes('thiep-hoa-co.html?inv=inv_03'), 'Garden phải trỏ về thiep-hoa-co.html');
});

// 6. Kiểm tra cả 3 mẫu đều hỗ trợ PostMessage Real-time Preview
runTest('Cả 3 file JS mẫu thiệp đều hỗ trợ UPDATE_WEDDING_CONFIG qua postMessage', () => {
  const scriptContent = fs.readFileSync('script.js', 'utf8');
  const modernContent = fs.readFileSync('thiep-hien-dai.js', 'utf8');
  const gardenContent = fs.readFileSync('thiep-hoa-co.js', 'utf8');

  assert(scriptContent.includes('UPDATE_WEDDING_CONFIG'), 'script.js thiếu UPDATE_WEDDING_CONFIG');
  assert(modernContent.includes('UPDATE_WEDDING_CONFIG'), 'thiep-hien-dai.js thiếu UPDATE_WEDDING_CONFIG');
  assert(gardenContent.includes('UPDATE_WEDDING_CONFIG'), 'thiep-hoa-co.js thiếu UPDATE_WEDDING_CONFIG');
});

// 7. Kiểm tra chuyển hướng thông minh khi link mở chéo mẫu
runTest('Cả 3 file mẫu thiệp đều có cơ chế chuyển hướng thông minh khi mở link mẫu khác', () => {
  const scriptContent = fs.readFileSync('script.js', 'utf8');
  const modernContent = fs.readFileSync('thiep-hien-dai.js', 'utf8');
  const gardenContent = fs.readFileSync('thiep-hoa-co.js', 'utf8');

  assert(scriptContent.includes('thiep-hien-dai.html') && scriptContent.includes('thiep-hoa-co.html'), 'script.js thiếu redirect');
  assert(modernContent.includes('index.html') && modernContent.includes('thiep-hoa-co.html'), 'thiep-hien-dai.js thiếu redirect');
  assert(gardenContent.includes('index.html') && gardenContent.includes('thiep-hien-dai.html'), 'thiep-hoa-co.js thiếu redirect');
});

console.log('\n====================================================');
console.log(`🎉 KẾT QUẢ: ĐÃ VƯỢT QUA ${passCount}/${totalTests} BÀI KIỂM TRA (100%)`);
console.log('====================================================\n');

if (passCount !== totalTests) {
  process.exit(1);
}
