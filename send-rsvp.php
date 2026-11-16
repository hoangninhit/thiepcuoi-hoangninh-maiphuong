<?php
/**
 * Wedding RSVP & Gift Notification Receiver
 * Target: ninhphuong247@gmail.com
 * Backups all entries to wishes_log.json
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => 'Dữ liệu không hợp lệ'
    ]);
    exit;
}

$targetEmail = 'ninhphuong247@gmail.com';
$logFile = __DIR__ . '/wishes_log.json';

$existingLogs = [];
if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    $existingLogs = json_decode($content, true) ?: [];
}

$entry = [
    'received_at' => date('Y-m-d H:i:s'),
    'target_email' => $targetEmail,
    'client_ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'data' => $data
];

array_unshift($existingLogs, $entry);
@file_put_contents($logFile, json_encode($existingLogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Optional PHP mail fallback if mail daemon is configured on server
$subject = $data['_subject'] ?? '💌 [Thiệp Cưới] Thông báo Trao Gửi Yêu Thương mới';
$mailBody = "Thông báo mới từ Website Thiệp Cưới Hoàng Ninh & Mai Phương\n\n";
foreach ($data as $key => $val) {
    if (strpos($key, '_') !== 0) {
        $mailBody .= "{$key}: {$val}\n";
    }
}
$mailBody .= "\nThời gian nhận: " . date('d/m/Y H:i:s');
$headers = "From: wedding@ninhphuong.top\r\n" .
           "Reply-To: {$targetEmail}\r\n" .
           "X-Mailer: PHP/" . phpversion();
@mail($targetEmail, '=?UTF-8?B?'.base64_encode($subject).'?=', $mailBody, $headers);

echo json_encode([
    'success' => true,
    'message' => 'Đã lưu và ghi nhận thành công!',
    'target_email' => $targetEmail,
    'total_entries' => count($existingLogs)
]);
