package dev.franfdez.personalweb.contact;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import dev.franfdez.personalweb.common.exception.RateLimitExceededException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ContactService contactService;

    @Test
    void processContactRequest_ValidRequest_SendsEmail() {
        ContactRequestDto request = new ContactRequestDto(
                "Carlos",
                "carlos@example.com",
                "Project Inquiry",
                "Hello Fran, I would like to discuss a backend role.",
                ""
        );

        assertDoesNotThrow(() -> contactService.processContactRequest(request, "192.168.1.10"));
        verify(emailService, times(1)).sendContactEmail(request);
    }

    @Test
    void processContactRequest_HoneypotFilled_SilentlyIgnoresAndDoesNotSendEmail() {
        ContactRequestDto botRequest = new ContactRequestDto(
                "SpamBot",
                "bot@spam.com",
                "Cheap SEO",
                "Click here",
                "http://malicious-site.com"
        );

        assertDoesNotThrow(() -> contactService.processContactRequest(botRequest, "192.168.1.20"));
        verify(emailService, never()).sendContactEmail(botRequest);
    }

    @Test
    void processContactRequest_SameIpWithinCooldown_ThrowsRateLimitExceededException() {
        ContactRequestDto request = new ContactRequestDto(
                "Ana",
                "ana@example.com",
                "First message",
                "Testing rate limit",
                null
        );
        String clientIp = "10.0.0.5";

        contactService.processContactRequest(request, clientIp);

        assertThrows(
                RateLimitExceededException.class,
                () -> contactService.processContactRequest(request, clientIp)
        );
        verify(emailService, times(1)).sendContactEmail(request);
    }
}