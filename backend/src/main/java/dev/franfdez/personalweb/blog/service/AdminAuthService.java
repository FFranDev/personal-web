package dev.franfdez.personalweb.blog.service;

import dev.franfdez.personalweb.common.exception.RateLimitExceededException;
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
    private static final Duration LOGIN_LOCKOUT_DURATION = Duration.ofMinutes(15);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final String BEARER_PREFIX = "Bearer ";

    @Value("${app.admin.password}")
    private String adminPassword;

    private final Map<String, Instant> activeTokens = new ConcurrentHashMap<>();
    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    private record LoginAttempt(int count, Instant lastAttempt) {}

    public String login(String password, String clientIp) {
        Instant now = Instant.now();
        purgeExpiredState(now);

        LoginAttempt attempt = loginAttempts.get(clientIp);
        if (attempt != null && attempt.count() >= MAX_FAILED_ATTEMPTS) {
            if (Duration.between(attempt.lastAttempt(), now).compareTo(LOGIN_LOCKOUT_DURATION) < 0) {
                throw new RateLimitExceededException("Too many failed login attempts. Try again in 15 minutes.");
            }
            loginAttempts.remove(clientIp);
        }

        boolean isMatch = MessageDigest.isEqual(
                adminPassword.getBytes(StandardCharsets.UTF_8),
                password.getBytes(StandardCharsets.UTF_8)
        );

        if (!isMatch) {
            int newCount = (attempt == null) ? 1 : attempt.count() + 1;
            loginAttempts.put(clientIp, new LoginAttempt(newCount, now));
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials");
        }

        loginAttempts.remove(clientIp);
        String token = UUID.randomUUID().toString();
        activeTokens.put(token, now.plus(SESSION_DURATION));
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

    private void purgeExpiredState(Instant now) {
        activeTokens.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
        loginAttempts.entrySet().removeIf(entry ->
                Duration.between(entry.getValue().lastAttempt(), now).compareTo(LOGIN_LOCKOUT_DURATION) >= 0
        );
    }
}