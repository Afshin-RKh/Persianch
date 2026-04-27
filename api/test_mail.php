<?php
require_once 'config.php';

$results = [];

// Check if constants are defined
$results['smtp_host_defined'] = defined('SMTP_HOST') ? SMTP_HOST : 'NOT DEFINED';
$results['smtp_port_defined'] = defined('SMTP_PORT') ? SMTP_PORT : 'NOT DEFINED';
$results['smtp_user_defined'] = defined('SMTP_USER') ? SMTP_USER : 'NOT DEFINED';
$results['smtp_pass_defined'] = defined('SMTP_PASS') ? (strlen(SMTP_PASS) > 0 ? 'SET (' . strlen(SMTP_PASS) . ' chars)' : 'EMPTY') : 'NOT DEFINED';

// Test fsockopen on port 465
$sock465 = @fsockopen('ssl://mail.privateemail.com', 465, $errno, $errstr, 10);
$results['fsockopen_465'] = $sock465 ? 'OK' : "FAILED: $errstr ($errno)";
if ($sock465) fclose($sock465);

// Test fsockopen on port 587
$sock587 = @fsockopen('mail.privateemail.com', 587, $errno, $errstr, 10);
$results['fsockopen_587'] = $sock587 ? 'OK' : "FAILED: $errstr ($errno)";
if ($sock587) fclose($sock587);

// Test PHP mail() — send to real address
$mailResult = @mail('khosrowshahi93@gmail.com', 'BiruniMap Test', 'This is a test email from BiruniMap server.', "From: noreply@birunimap.com\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8");
$results['php_mail_returned'] = $mailResult ? 'true (check inbox+spam)' : 'false';

// Test full SMTP auth on port 465
$host = 'ssl://mail.privateemail.com';
$user = defined('SMTP_USER') ? SMTP_USER : '';
$pass = defined('SMTP_PASS') ? SMTP_PASS : '';
$sock = @fsockopen($host, 465, $errno, $errstr, 10);
if ($sock) {
    $log = [];
    $read = function() use ($sock, &$log) {
        $buf = '';
        while (!feof($sock)) { $line = fgets($sock, 512); $buf .= $line; if (isset($line[3]) && $line[3] === ' ') break; }
        $log[] = 'S: ' . trim($buf);
        return $buf;
    };
    $cmd = function($c) use ($sock, $read, &$log) { $log[] = 'C: ' . $c; fwrite($sock, $c . "\r\n"); return $read(); };
    $read();
    $cmd('EHLO birunimap.com');
    $cmd('AUTH LOGIN');
    $cmd(base64_encode($user));
    $resp = $cmd(base64_encode($pass));
    $results['smtp_auth_response'] = trim($resp);
    $results['smtp_auth_ok'] = substr(trim($resp), 0, 3) === '235';
    $results['smtp_log'] = $log;
    fclose($sock);
} else {
    $results['smtp_full_test'] = "Connection failed: $errstr";
}

echo json_encode($results, JSON_PRETTY_PRINT);
