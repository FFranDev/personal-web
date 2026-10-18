package dev.franfdez.personalweb.blog.dto;

public record CommentResponseDto(
        Long id,
        String authorName,
        boolean isAuthor,
        String createdAt,
        String text,
        Long parentId
) {}