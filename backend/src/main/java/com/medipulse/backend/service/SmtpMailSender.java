package com.medipulse.backend.service;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

public class SmtpMailSender {

    private static final int TIMEOUT_MS = 15000;

    public static void send(String host, int port, boolean ssl, boolean starttls,
                            String username, String password, String from,
                            List<String> recipients, String subject, String body) throws IOException {
        if (recipients == null || recipients.isEmpty()) {
            throw new IllegalArgumentException("No recipients");
        }
        Socket socket = connect(host, port, ssl);
        try {
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(socket.getInputStream(), StandardCharsets.US_ASCII));
            OutputStream out = socket.getOutputStream();
            expect(reader, 220);
            sendLine(out, "EHLO medipulse");
            String extensions = readReply(reader, 250);
            if (!ssl && starttls && extensions.toUpperCase().contains("STARTTLS")) {
                sendLine(out, "STARTTLS");
                expect(reader, 220);
                SSLSocket tls = (SSLSocket) ((SSLSocketFactory) SSLSocketFactory.getDefault())
                        .createSocket(socket, host, port, true);
                tls.setSoTimeout(TIMEOUT_MS);
                tls.startHandshake();
                socket = tls;
                reader = new BufferedReader(
                        new InputStreamReader(socket.getInputStream(), StandardCharsets.US_ASCII));
                out = socket.getOutputStream();
                sendLine(out, "EHLO medipulse");
                extensions = readReply(reader, 250);
            }
            if (username != null && !username.isBlank()) {
                if (!extensions.toUpperCase().contains("AUTH")) {
                    throw new IOException("SMTP server does not advertise AUTH");
                }
                sendLine(out, "AUTH LOGIN");
                expect(reader, 334);
                sendLine(out, base64(username));
                expect(reader, 334);
                sendLine(out, base64(password == null ? "" : password));
                expect(reader, 235);
            }
            sendLine(out, "MAIL FROM:<" + fromAddress(from) + ">");
            expect(reader, 250);
            for (String to : recipients) {
                sendLine(out, "RCPT TO:<" + to.trim() + ">");
                expect(reader, 250);
            }
            sendLine(out, "DATA");
            expect(reader, 354);
            StringBuilder data = new StringBuilder();
            data.append("From: ").append(from).append("\r\n");
            data.append("To: ").append(String.join(", ", recipients)).append("\r\n");
            data.append("Subject: ").append(subject).append("\r\n");
            data.append("Content-Type: text/plain; charset=UTF-8\r\n\r\n");
            for (String line : body.split("\n", -1)) {
                if (line.startsWith(".")) {
                    data.append('.');
                }
                data.append(line).append("\r\n");
            }
            data.append(".\r\n");
            out.write(data.toString().getBytes(StandardCharsets.UTF_8));
            out.flush();
            expect(reader, 250);
            sendLine(out, "QUIT");
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {
            }
        }
    }

    private static Socket connect(String host, int port, boolean ssl) throws IOException {
        if (ssl) {
            SSLSocket socket = (SSLSocket) ((SSLSocketFactory) SSLSocketFactory.getDefault())
                    .createSocket();
            socket.setSoTimeout(TIMEOUT_MS);
            socket.connect(new InetSocketAddress(host, port), TIMEOUT_MS);
            socket.startHandshake();
            return socket;
        }
        Socket socket = new Socket();
        socket.setSoTimeout(TIMEOUT_MS);
        socket.connect(new InetSocketAddress(host, port), TIMEOUT_MS);
        return socket;
    }

    private static void sendLine(OutputStream out, String line) throws IOException {
        out.write((line + "\r\n").getBytes(StandardCharsets.US_ASCII));
        out.flush();
    }

    private static String readReply(BufferedReader reader, int expected) throws IOException {
        StringBuilder full = new StringBuilder();
        String line = reader.readLine();
        if (line == null || line.length() < 3) {
            throw new IOException("Empty SMTP reply");
        }
        full.append(line);
        while (line.length() > 3 && line.charAt(3) == '-') {
            line = reader.readLine();
            if (line == null) {
                break;
            }
            full.append('\n').append(line);
        }
        int code;
        try {
            code = Integer.parseInt(full.substring(0, 3));
        } catch (NumberFormatException e) {
            throw new IOException("Invalid SMTP reply: " + full);
        }
        if (code != expected) {
            throw new IOException("SMTP error, expected " + expected + " but got: " + full);
        }
        return full.toString();
    }

    private static void expect(BufferedReader reader, int code) throws IOException {
        readReply(reader, code);
    }

    private static String base64(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private static String fromAddress(String from) {
        int start = from.lastIndexOf('<');
        int end = from.lastIndexOf('>');
        if (start >= 0 && end > start) {
            return from.substring(start + 1, end).trim();
        }
        return from.trim();
    }
}
