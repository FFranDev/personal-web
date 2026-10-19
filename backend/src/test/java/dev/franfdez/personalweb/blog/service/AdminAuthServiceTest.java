package dev.franfdez.personalweb.blog.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import dev.franfdez.personalweb.common.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

class AdminAuthServiceTest {

    private AdminAuthService adminAuthService;

    @BeforeEach
    void setUp() {
        adminAuthService = new AdminAuthService();
        ReflectionTestUtils.setField(adminAuthService, "adminPassword", "super-secret-pass");
    }

    @Test
    void login_CorrectPassword_ReturnsValidBearerToken() {
        String token = adminAuthService.login("super-secret-pass", "127.0.0.1");

        assertNotNull(token);
        assertTrue(adminAuthService.isValidAdminHeader("Bearer " + token));
    }

    @Test
    void login_WrongPassword_ThrowsUnauthorized() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adminAuthService.login("wrong-pass", "127.0.0.1")
        );

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void login_FiveFailedAttempts_LocksOutIpWithRateLimitException() {
        String attackerIp = "192.168.1.99";

        for (int i = 0; i < 5; i++) {
            assertThrows(
                    ResponseStatusException.class,
                    () -> adminAuthService.login("wrong-pass", attackerIp)
            );
        }

        // 6th attempt must be blocked by brute-force protection even with the right password
        assertThrows(
                RateLimitExceededException.class,
                () -> adminAuthService.login("super-secret-pass", attackerIp)
        );
    }

    @Test
    void logout_ActiveToken_InvalidatesSession() {
        String token = adminAuthService.login("super-secret-pass", "127.0.0.1");
        String authHeader = "Bearer " + token;

        assertTrue(adminAuthService.isValidAdminHeader(authHeader));

        adminAuthService.logout(authHeader);

        assertFalse(adminAuthService.isValidAdminHeader(authHeader));
        assertThrows(
                ResponseStatusException.class,
                () -> adminAuthService.requireAdmin(authHeader)
        );
    }
}