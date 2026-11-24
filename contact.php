<?php
/**
 * Nova — contact / lead-capture endpoint.
 *
 * Plain dependency-free PHP: runs on any cheap shared host or locally with
 *   php -S localhost:8000
 * It does NOT run on GitHub Pages (static hosting) — there the frontend
 * falls back to a clearly-labelled demo success state and never fakes a send.
 *
 * POST JSON: { "name": "...", "email": "...", "company": "...", "message": "..." }
 * (Form-encoded POST bodies are also accepted.)
 * On success: HTTP 200 + {"ok":true}
 * On validation error: HTTP 422 + {"ok":false,"errors":{"field":"message"}}
 * Leads are appended to data/leads.json (one JSON array, file-locked).
 */

header('Content-Type: application/json; charset=utf-8');

// Only POST is allowed.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

// Accept a JSON body, falling back to a normal form POST.
$input = [];
$raw = file_get_contents('php://input');
if ($raw !== '' && $raw !== false) {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $input = $decoded;
    }
}
if (empty($input)) {
    $input = $_POST;
}

$name    = isset($input['name'])    ? trim((string) $input['name'])    : '';
$email   = isset($input['email'])   ? trim((string) $input['email'])   : '';
$company = isset($input['company']) ? trim((string) $input['company']) : '';
$message = isset($input['message']) ? trim((string) $input['message']) : '';

// --- Validation (mirrors the client-side checks in script.js) ---
$errors = [];
if (strlen($name) < 2) {
    $errors['name'] = 'Please enter your name.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid work email.';
}
if (strlen($message) < 10) {
    $errors['message'] = 'Tell us a little more (at least 10 characters).';
}
if (strlen($company) > 120) {
    $errors['company'] = 'Company name is too long.';
}
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// --- Append the lead to data/leads.json (file-locked) ---
$dataDir  = __DIR__ . '/data';
$dataFile = $dataDir . '/leads.json';

if (!is_dir($dataDir) && !mkdir($dataDir, 0755, true) && !is_dir($dataDir)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not create data directory.']);
    exit;
}

$lead = [
    'name'    => $name,
    'email'   => $email,
    'company' => $company,
    'message' => $message,
    'created' => gmdate('c'),
    'ip'      => $_SERVER['REMOTE_ADDR'] ?? null,
];

$fp = fopen($dataFile, 'c+');
if ($fp === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not open leads file.']);
    exit;
}
if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not lock leads file.']);
    exit;
}

$contents = stream_get_contents($fp);
$leads = ($contents !== '' && $contents !== false) ? json_decode($contents, true) : null;
if (!is_array($leads)) {
    $leads = [];
}
$leads[] = $lead;

rewind($fp);
ftruncate($fp, 0);
fwrite($fp, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode(['ok' => true]);
