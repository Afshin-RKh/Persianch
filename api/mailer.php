<?php
/**
 * SMTP mailer — no library required.
 * Reads SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM from constants
 * defined in .env.php (loaded by config.php).
 */

function send_email(string $toEmail, string $toName, string $subject, string $body): bool {
    if (defined('SMTP_HOST') && SMTP_HOST) {
        return _smtp_send($toEmail, $toName, $subject, $body);
    }
    // Fallback: PHP mail()
    $from    = defined('SMTP_FROM') ? SMTP_FROM : 'BiruniMap <noreply@birunimap.com>';
    $headers = "From: $from\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8";
    return @mail($toEmail, $subject, $body, $headers);
}

function _smtp_send(string $toEmail, string $toName, string $subject, string $body): bool {
    $host = SMTP_HOST;
    $port = defined('SMTP_PORT') ? (int)SMTP_PORT : 587;
    $user = defined('SMTP_USER') ? SMTP_USER : '';
    $pass = defined('SMTP_PASS') ? SMTP_PASS : '';
    $from = defined('SMTP_FROM') ? SMTP_FROM : "BiruniMap <$user>";

    if (preg_match('/^(.*?)\s*<([^>]+)>$/', $from, $m)) {
        $fromAddr = trim($m[2]);
    } else {
        $fromAddr = $from;
    }

    try {
        $ssl    = ($port === 465);
        $target = ($ssl ? 'ssl://' : '') . $host;
        $sock   = @fsockopen($target, $port, $errno, $errstr, 10);
        if (!$sock) {
            error_log("[BiruniMap mailer] fsockopen failed: $errstr ($errno) — host=$target port=$port");
            return false;
        }

        $read = function() use ($sock) {
            $buf = '';
            while (!feof($sock)) {
                $line = fgets($sock, 512);
                $buf .= $line;
                if (isset($line[3]) && $line[3] === ' ') break;
            }
            return $buf;
        };
        $cmd = function(string $c) use ($sock, $read) {
            fwrite($sock, $c . "\r\n");
            return $read();
        };

        $read(); // greeting
        $ehlo = $cmd('EHLO birunimap.com');

        if (!$ssl && strpos($ehlo, 'STARTTLS') !== false) {
            $cmd('STARTTLS');
            stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $cmd('EHLO birunimap.com');
        }

        $cmd('AUTH LOGIN');
        $cmd(base64_encode($user));
        $resp = $cmd(base64_encode($pass));
        if (substr(trim($resp), 0, 3) !== '235') {
            error_log("[BiruniMap mailer] SMTP AUTH failed: $resp");
            fclose($sock);
            return false;
        }

        $cmd("MAIL FROM:<$fromAddr>");
        $cmd("RCPT TO:<$toEmail>");
        $cmd('DATA');

        $toField = $toName ? "$toName <$toEmail>" : $toEmail;
        $message = "Date: " . date('r') . "\r\n"
                 . "From: $from\r\n"
                 . "To: $toField\r\n"
                 . "Subject: $subject\r\n"
                 . "MIME-Version: 1.0\r\n"
                 . "Content-Type: text/plain; charset=utf-8\r\n"
                 . "\r\n"
                 . $body . "\r\n.\r\n";

        $resp = $cmd($message);
        $cmd('QUIT');
        fclose($sock);

        return substr(trim($resp), 0, 3) === '250';
    } catch (Throwable $e) {
        return false;
    }
}
