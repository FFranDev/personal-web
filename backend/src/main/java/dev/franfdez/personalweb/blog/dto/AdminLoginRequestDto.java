package dev.franfdez.personalweb.blog.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequestDto(
        @NotBlank(message = "Password is required")
        String password
) {}