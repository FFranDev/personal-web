package dev.franfdez.personalweb.contact;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> sendContactMessage(
            @Valid @RequestBody ContactRequestDto requestDto,
            HttpServletRequest httpRequest) {

        String clientIp = extractClientIp(httpRequest);
        contactService.processContactRequest(requestDto, clientIp);

        return ResponseEntity.ok(Map.of("message", "Message sent successfully"));
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedHeader = request.getHeader("X-Forwarded-For");
        if (forwardedHeader != null && !forwardedHeader.isBlank()) {
            return forwardedHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}