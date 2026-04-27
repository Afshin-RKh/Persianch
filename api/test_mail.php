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

// Test PHP mail()
$mailResult = @mail('noreply@birunimap.com', 'Test', 'Test body', 'From: noreply@birunimap.com');
$results['php_mail_returned'] = $mailResult ? 'true' : 'false';

echo json_encode($results, JSON_PRETTY_PRINT);
