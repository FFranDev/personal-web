package dev.franfdez.personalweb.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequestDto(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 150, message = "Email cannot exceed 150 characters")
        String email,

        @NotBlank(message = "Subject is required")
        @Size(max = 150, message = "Subject cannot exceed 150 characters")
        String subject,

        @NotBlank(message = "Message is required")
        @Size(max = 1500, message = "Message cannot exceed 1500 characters")
        String message,

        // Honeypot field: no @NotBlank
        String website
) {}