<?php
/**
 * Gift Activity & Stats File Storage API
 * File: gift_activity.json
 * Persists live gift events across page reloads (F5)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$storageFile = __DIR__ . '/gift_activity.json';

// Default initial activities if file doesn't exist
$defaultActivities = [
    [
        'id' => 'act_1',
        'avatar' => '🌸',
        'sender' => 'Chị Ngọc Lan',
        'gift' => '🌹 Hoa Hồng x99',
        'time' => 'Vừa xong',
        'timestamp' => time() - 30
    ],
    [
        'id' => 'act_2',
        'avatar' => '🎩',
        'sender' => 'Anh Minh Khoa',
        'gift' => '🏎️ Siêu Xe Cưới x10',
        'time' => '1 phút trước',
        'timestamp' => time() - 60
    ],
    [
        'id' => 'act_3',
        'avatar' => '👑',
        'sender' => 'Gia đình Bác Hùng',
        'gift' => '🏰 Lâu Đài Vàng x1',
        'time' => '2 phút trước',
        'timestamp' => time() - 120
    ]
];

$defaultStats = [
    'rose' => 1520,
    'car' => 88,
    'rocket' => 168,
    'castle' => 52
];

function loadData($file, $defaultActivities, $defaultStats) {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        $json = @json_decode($content, true);
        if (is_array($json)) {
            return [
                'activities' => $json['activities'] ?? $defaultActivities,
                'stats' => $json['stats'] ?? $defaultStats
            ];
        }
    }
    return [
        'activities' => $defaultActivities,
        'stats' => $defaultStats
    ];
}

function saveData($file, $data) {
    @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$current = loadData($storageFile, $defaultActivities, $defaultStats);

// Handle POST request (Save new activity)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if ($input && !empty($input['sender']) && !empty($input['gift'])) {
        $newActivity = [
            'id' => 'act_' . time() . '_' . rand(100, 999),
            'avatar' => $input['avatar'] ?? '💖',
            'sender' => strip_tags(trim($input['sender'])),
            'gift' => strip_tags(trim($input['gift'])),
            'time' => 'Vừa xong',
            'timestamp' => time()
        ];

        // Prepend new activity and keep top 25
        array_unshift($current['activities'], $newActivity);
        if (count($current['activities']) > 25) {
            $current['activities'] = array_slice($current['activities'], 0, 25);
        }

        // Increment gift stats if key exists
        if (!empty($input['giftKey']) && isset($current['stats'][$input['giftKey']])) {
            $multiplier = max(1, intval($input['multiplier'] ?? 1));
            $current['stats'][$input['giftKey']] += $multiplier;
        }

        saveData($storageFile, $current);

        echo json_encode([
            'success' => true,
            'message' => 'Đã lưu hoạt động tặng quà vào file thành công',
            'activities' => $current['activities'],
            'stats' => $current['stats']
        ]);
        exit;
    }
}

// Ensure the file is created on first GET
if (!file_exists($storageFile)) {
    saveData($storageFile, $current);
}

// GET request: Return current activities and stats
echo json_encode([
    'success' => true,
    'activities' => $current['activities'],
    'stats' => $current['stats']
]);
