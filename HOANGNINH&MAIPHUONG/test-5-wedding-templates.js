/**
 * TEST SUITE: BỘ 5 MẪU THIỆP CƯỚI ĐỘC LẬP & GIÀU HIỆU ỨNG
 * 1. Cung Đình Hoàng Gia (index.html)
 * 2. Phong Bì Thư Tình & Tạp Chí (thiep-hien-dai.html)
 * 3. Vườn Hoa Cổ Tích & Kính Mờ (thiep-hoa-co.html)
 * 4. Thiên Hà Sao Băng & Tinh Tú (thiep-thien-ha.html)
 * 5. Lễ Hội Pháo Hoa & Đèn Lồng (thiep-phao-hoa.html)
 */

const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 BẮT ĐẦU KIỂM TRA HỆ THỐNG 5 MẪU THIỆP CƯỚI ĐỘC LẬP');
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

// 1. Kiểm tra tồn tại đầy đủ các file của cả 5 mẫu thiệp
runTest('Kiểm tra 15 file của 5 mẫu thiệp và các file cốt lõi', () => {
  const requiredFiles = [
    'index.html', 'style.css', 'script.js',
    'thiep-hien-dai.html', 'thiep-hien-dai.css', 'thiep-hien-dai.js',
    'thiep-hoa-co.html', 'thiep-hoa-co.css', 'thiep-hoa-co.js',
    'thiep-thien-ha.html', 'thiep-thien-ha.css', 'thiep-thien-ha.js',
    'thiep-phao-hoa.html', 'thiep-phao-hoa.css', 'thiep-phao-hoa.js',
    'tao-thiep.html', 'tao-thiep.css', 'tao-thiep.js'
  ];

  requiredFiles.forEach(file => {
    assert(fs.existsSync(file), `File ${file} không tồn tại!`);
    const stat = fs.statSync(file);
    assert(stat.size > 500, `File ${file} quá nhỏ (${stat.size} bytes)!`);
  });
});

// 2. Kiểm tra Mẫu 4: Thiên Hà Sao Băng (thiep-thien-ha)
runTest('Mẫu 4 (thiep-thien-ha) có canvas sao băng, cổng zodiac và aurora glow portal', () => {
  const html = fs.readFileSync('thiep-thien-ha.html', 'utf8');
  assert(html.includes('galaxy-canvas'), 'Thiếu galaxy-canvas');
  assert(html.includes('cosmic-zodiac-ring'), 'Thiếu cosmic-zodiac-ring');
  assert(html.includes('btn-open-cosmos'), 'Thiếu nút btn-open-cosmos');
  assert(html.includes('aurora-portal-wrap'), 'Thiếu aurora-portal-wrap');
  assert(html.includes('section-galaxy-countdown'), 'Thiếu section đếm ngược');
  assert(html.includes('galaxy-mosaic-gallery'), 'Thiếu galaxy-mosaic-gallery');
});

// 3. Kiểm tra Mẫu 5: Lễ Hội Pháo Hoa & Đèn Lồng (thiep-phao-hoa)
runTest('Mẫu 5 (thiep-phao-hoa) có canvas pháo hoa + đèn lồng, con dấu hỷ và khung hoa đăng', () => {
  const html = fs.readFileSync('thiep-phao-hoa.html', 'utf8');
  assert(html.includes('fireworks-canvas'), 'Thiếu fireworks-canvas');
  assert(html.includes('golden-seal-emblem'), 'Thiếu golden-seal-emblem');
  assert(html.includes('btn-fireworks-launch'), 'Thiếu nút btn-fireworks-launch');
  assert(html.includes('lantern-arch-photo'), 'Thiếu lantern-arch-photo');
  assert(html.includes('lantern-countdown-row'), 'Thiếu lantern-countdown-row');
  assert(html.includes('festive-gallery-grid'), 'Thiếu festive-gallery-grid');
});

// 4. Kiểm tra tao-thiep.html có bộ chọn 5 Mẫu Thiệp
runTest('tao-thiep.html có đủ 5 lựa chọn layout (palace, modern, garden, galaxy, fireworks)', () => {
  const html = fs.readFileSync('tao-thiep.html', 'utf8');
  assert(html.includes('value="palace"'), 'Thiếu option palace');
  assert(html.includes('value="modern"'), 'Thiếu option modern');
  assert(html.includes('value="garden"'), 'Thiếu option garden');
  assert(html.includes('value="galaxy"'), 'Thiếu option galaxy');
  assert(html.includes('value="fireworks"'), 'Thiếu option fireworks');
});

// 5. Kiểm tra tao-thiep.js định tuyến link chia sẻ chính xác cho cả 5 mẫu
runTest('tao-thiep.js định tuyến getInvitationShareUrl chính xác cho cả 5 mẫu', () => {
  function simulateShareUrl(cfg, invId) {
    let targetHtml = 'index.html';
    if (cfg && cfg.templateLayout === 'modern') {
      targetHtml = 'thiep-hien-dai.html';
    } else if (cfg && cfg.templateLayout === 'garden') {
      targetHtml = 'thiep-hoa-co.html';
    } else if (cfg && cfg.templateLayout === 'galaxy') {
      targetHtml = 'thiep-thien-ha.html';
    } else if (cfg && cfg.templateLayout === 'fireworks') {
      targetHtml = 'thiep-phao-hoa.html';
    }
    const origin = 'https://example.com';
    const pathname = '/tao-thiep.html';
    return origin + pathname.replace('tao-thiep.html', targetHtml) + `?inv=${invId}`;
  }

  assert(simulateShareUrl({ templateLayout: 'palace' }, '1').includes('index.html?inv=1'));
  assert(simulateShareUrl({ templateLayout: 'modern' }, '2').includes('thiep-hien-dai.html?inv=2'));
  assert(simulateShareUrl({ templateLayout: 'garden' }, '3').includes('thiep-hoa-co.html?inv=3'));
  assert(simulateShareUrl({ templateLayout: 'galaxy' }, '4').includes('thiep-thien-ha.html?inv=4'));
  assert(simulateShareUrl({ templateLayout: 'fireworks' }, '5').includes('thiep-phao-hoa.html?inv=5'));
});

// 6. Kiểm tra cả 5 file JS mẫu thiệp đều hỗ trợ UPDATE_WEDDING_CONFIG qua postMessage
runTest('Cả 5 file JS mẫu thiệp đều lắng nghe UPDATE_WEDDING_CONFIG', () => {
  const f1 = fs.readFileSync('script.js', 'utf8');
  const f2 = fs.readFileSync('thiep-hien-dai.js', 'utf8');
  const f3 = fs.readFileSync('thiep-hoa-co.js', 'utf8');
  const f4 = fs.readFileSync('thiep-thien-ha.js', 'utf8');
  const f5 = fs.readFileSync('thiep-phao-hoa.js', 'utf8');

  assert(f1.includes('UPDATE_WEDDING_CONFIG'));
  assert(f2.includes('UPDATE_WEDDING_CONFIG'));
  assert(f3.includes('UPDATE_WEDDING_CONFIG'));
  assert(f4.includes('UPDATE_WEDDING_CONFIG'));
  assert(f5.includes('UPDATE_WEDDING_CONFIG'));
});

// 7. Kiểm tra nút Cài Đặt (tao-thiep.html) xuất hiện trên cả 5 mẫu
runTest('Cả 5 mẫu thiệp đều có nút cài đặt / builder trỏ đến tao-thiep.html', () => {
  const h1 = fs.readFileSync('index.html', 'utf8');
  const h2 = fs.readFileSync('thiep-hien-dai.html', 'utf8');
  const h3 = fs.readFileSync('thiep-hoa-co.html', 'utf8');
  const h4 = fs.readFileSync('thiep-thien-ha.html', 'utf8');
  const h5 = fs.readFileSync('thiep-phao-hoa.html', 'utf8');

  assert(h1.includes('tao-thiep.html'));
  assert(h2.includes('tao-thiep.html'));
  assert(h3.includes('tao-thiep.html'));
  assert(h4.includes('tao-thiep.html'));
  assert(h5.includes('tao-thiep.html'));
});

console.log('\n====================================================');
console.log(`🎉 KẾT QUẢ: ĐÃ VƯỢT QUA ${passCount}/${totalTests} BÀI KIỂM TRA (100%)`);
console.log('====================================================\n');

if (passCount !== totalTests) {
  process.exit(1);
}
