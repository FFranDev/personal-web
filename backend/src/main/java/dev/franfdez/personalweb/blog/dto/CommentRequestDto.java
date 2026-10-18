package dev.franfdez.personalweb.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequestDto(
        @Size(max = 60, message = "Alias cannot exceed 60 characters")
        String authorName,

        @NotBlank(message = "Comment text is required")
        @Size(max = 600, message = "Comment cannot exceed 600 characters")
        String text,

        Long parentId,

        // Honeypot field for bots
        String website
) {}