package dev.franfdez.personalweb.contact;

import dev.franfdez.personalweb.common.exception.RateLimitExceededException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    private static final Duration COOLDOWN = Duration.ofMinutes(2);
    
    private final EmailService emailService;
    private final Map<String, Instant> ipLastRequestMap = new ConcurrentHashMap<>();

    public ContactService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void processContactRequest(ContactRequestDto request, String clientIp) {
        // Honeypot check: silently ignore if bot filled the hidden field
        if (request.website() != null && !request.website().isBlank()) {
            return;
        }

        // Rate limit check by IP
        Instant now = Instant.now();
        Instant lastRequest = ipLastRequestMap.get(clientIp);

        if (lastRequest != null && Duration.between(lastRequest, now).compareTo(COOLDOWN) < 0) {
            throw new RateLimitExceededException("Please wait a few minutes before sending another message.");
        }

        // Clean up expired entries to keep memory clean
        ipLastRequestMap.entrySet().removeIf(entry -> Duration.between(entry.getValue(), now).compareTo(COOLDOWN) >= 0);

        // Send email and record timestamp on success
        emailService.sendContactEmail(request);
        ipLastRequestMap.put(clientIp, now);
    }
}