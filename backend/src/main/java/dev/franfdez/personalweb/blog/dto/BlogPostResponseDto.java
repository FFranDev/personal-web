package dev.franfdez.personalweb.blog.dto;

import java.util.List;

public record BlogPostResponseDto(
        Long id,
        String title,
        String content,
        String createdAt,
        List<String> imageUrls,
        List<CommentResponseDto> comments
) {}