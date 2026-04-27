<?php
require_once 'config.php';
require_once 'mailer.php';

$results = [];
$results['smtp_pass_length'] = defined('SMTP_PASS') ? strlen(SMTP_PASS) : 'NOT DEFINED';
$results['smtp_pass_first2'] = defined('SMTP_PASS') ? substr(SMTP_PASS, 0, 2) . '***' : 'N/A';

// Test AUTH PLAIN directly
$host = 'ssl://mail.privateemail.com';
$user = defined('SMTP_USER') ? SMTP_USER : '';
$pass = defined('SMTP_PASS') ? SMTP_PASS : '';
$sock = @fsockopen($host, 465, $errno, $errstr, 10);
if ($sock) {
    $read = function() use ($sock) {
        $buf = '';
        while (!feof($sock)) { $line = fgets($sock, 512); $buf .= $line; if (isset($line[3]) && $line[3] === ' ') break; }
        return trim($buf);
    };
    $cmd = function($c) use ($sock, $read) { fwrite($sock, $c . "\r\n"); return $read(); };
    $read();
    $cmd('EHLO birunimap.com');
    $plainResp = $cmd('AUTH PLAIN ' . base64_encode("\0" . $user . "\0" . $pass));
    $results['auth_plain'] = $plainResp;
    $results['auth_plain_ok'] = substr($plainResp, 0, 3) === '235';
    fclose($sock);
} else {
    $results['connect'] = "FAILED: $errstr";
}

// Try sending via actual mailer
$sent = send_email('khosrowshahi93@gmail.com', 'Test', 'BiruniMap SMTP Test', "This is a test from BiruniMap SMTP mailer.\n\nIf you received this, SMTP is working!");
$results['mailer_sent'] = $sent;

echo json_encode($results, JSON_PRETTY_PRINT);
