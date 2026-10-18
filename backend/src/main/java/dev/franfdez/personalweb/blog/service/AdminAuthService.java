package dev.franfdez.personalweb.blog.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminAuthService {

    private static final Duration SESSION_DURATION = Duration.ofHours(12);
    private static final String BEARER_PREFIX = "Bearer ";

    @Value("${app.admin.password}")
    private String adminPassword;

    private final Map<String, Instant> activeTokens = new ConcurrentHashMap<>();

    public String login(String password) {
        boolean isMatch = MessageDigest.isEqual(
                adminPassword.getBytes(StandardCharsets.UTF_8),
                password.getBytes(StandardCharsets.UTF_8)
        );

        if (!isMatch) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials");
        }

        String token = UUID.randomUUID().toString();
        activeTokens.put(token, Instant.now().plus(SESSION_DURATION));
        return token;
    }

    public boolean isValidAdminHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return false;
        }

        String token = authHeader.substring(BEARER_PREFIX.length()).trim();
        Instant expiration = activeTokens.get(token);

        if (expiration == null) {
            return false;
        }

        if (Instant.now().isAfter(expiration)) {
            activeTokens.remove(token);
            return false;
        }

        return true;
    }

    public void requireAdmin(String authHeader) {
        if (!isValidAdminHeader(authHeader)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin authorization required");
        }
    }

    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            activeTokens.remove(token);
        }
    }
}