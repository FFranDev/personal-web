package dev.franfdez.personalweb.blog.dto;

import java.util.List;

public record BlogPageResponseDto(
        List<BlogPostResponseDto> posts,
        int currentPage,
        int totalPages,
        long totalElements
) {}