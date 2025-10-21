<?php
// === Configuration de base ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// === Connexion à ta base de données ===
$host = "localhost";
$user = "root";       // ⚠️ à adapter selon Hostinger
$pass = "";           // ⚠️ à adapter
$db   = "triple7";    // ⚠️ nom de ta base

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// === Route simple pour récupérer les events ===
$uri = strtok($_SERVER["REQUEST_URI"], "?");

if ($uri === "/api/events") {
    $sql = "SELECT id, title, description, image_url AS image, event_date AS date, start_time AS time, category, price 
            FROM events 
            WHERE isActive = 1 
            ORDER BY event_date ASC";
    $res = $conn->query($sql);
    $events = [];

    while ($row = $res->fetch_assoc()) {
        $events[] = $row;
    }

    echo json_encode(["events" => $events], JSON_UNESCAPED_UNICODE);
    exit;
}

// === Route pour les gagnants (optionnelle) ===
if ($uri === "/api/winners") {
    $sql = "SELECT name, game, image_url FROM winners ORDER BY created_at DESC LIMIT 20";
    $res = $conn->query($sql);
    $winners = [];

    while ($row = $res->fetch_assoc()) {
        $winners[] = $row;
    }

    echo json_encode(["winners" => $winners], JSON_UNESCAPED_UNICODE);
    exit;
}

// === 404 fallback ===
http_response_code(404);
echo json_encode(["error" => "Unknown endpoint"]);
