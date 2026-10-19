package dev.franfdez.personalweb.blog.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.franfdez.personalweb.blog.dto.BlogPostResponseDto;
import dev.franfdez.personalweb.blog.dto.CommentRequestDto;
import dev.franfdez.personalweb.blog.dto.CommentResponseDto;
import dev.franfdez.personalweb.blog.model.BlogPost;
import dev.franfdez.personalweb.blog.model.Comment;
import dev.franfdez.personalweb.blog.repository.BlogPostRepository;
import dev.franfdez.personalweb.blog.repository.CommentRepository;
import dev.franfdez.personalweb.common.exception.RateLimitExceededException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class BlogServiceTest {

    @Mock
    private BlogPostRepository blogPostRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private BlogService blogService;

    @Test
    void createPost_ValidInput_StoresImagesAndSavesPost() {
        when(imageStorageService.storeImages(any())).thenReturn(List.of("img1.png"));
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(invocation -> {
            BlogPost saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        BlogPostResponseDto result = blogService.createPost("New Post", "Post body content", List.of());

        assertEquals(1L, result.id());
        assertEquals("New Post", result.title());
        assertEquals(List.of("/api/blog/images/img1.png"), result.imageUrls());
        verify(blogPostRepository, times(1)).save(any(BlogPost.class));
    }

    @Test
    void deletePost_ExistingPost_DeletesImagesAndPostEntity() {
        BlogPost existingPost = new BlogPost();
        existingPost.setId(5L);
        existingPost.setImageUrls(List.of("pic1.jpg", "pic2.jpg"));

        when(blogPostRepository.findById(5L)).thenReturn(Optional.of(existingPost));

        blogService.deletePost(5L);

        verify(imageStorageService, times(1)).deleteImages(List.of("pic1.jpg", "pic2.jpg"));
        verify(blogPostRepository, times(1)).delete(existingPost);
    }

    @Test
    void addComment_VisitorAttemptsToReply_ThrowsForbidden() {
        BlogPost post = new BlogPost();
        post.setId(1L);
        when(blogPostRepository.findById(1L)).thenReturn(Optional.of(post));

        CommentRequestDto replyAttempt = new CommentRequestDto("Visitor", "Trying to reply", 10L, "");

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> blogService.addComment(1L, replyAttempt, false, "192.168.1.50")
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(commentRepository, never()).save(any());
    }

    @Test
    void addComment_AdminReplyToRootComment_SavesWithAuthorBadge() {
        BlogPost post = new BlogPost();
        post.setId(1L);

        Comment parentComment = new Comment();
        parentComment.setId(10L);
        parentComment.setBlogPost(post);
        parentComment.setParentId(null);

        when(blogPostRepository.findById(1L)).thenReturn(Optional.of(post));
        when(commentRepository.findById(10L)).thenReturn(Optional.of(parentComment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment saved = invocation.getArgument(0);
            saved.setId(11L);
            return saved;
        });

        CommentRequestDto adminReply = new CommentRequestDto(null, "Author response", 10L, "");
        CommentResponseDto response = blogService.addComment(1L, adminReply, true, "127.0.0.1");

        assertEquals("Fran", response.authorName());
        assertTrue(response.isAuthor());
        assertEquals(10L, response.parentId());
    }

    @Test
    void addComment_VisitorRateLimit_BlocksSecondCommentWithinOneMinute() {
        BlogPost post = new BlogPost();
        post.setId(1L);
        when(blogPostRepository.findById(1L)).thenReturn(Optional.of(post));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> i.getArgument(0));

        CommentRequestDto req = new CommentRequestDto("Laura", "Nice post!", null, "");
        String visitorIp = "10.0.0.88";

        CommentResponseDto first = blogService.addComment(1L, req, false, visitorIp);
        assertFalse(first.isAuthor());

        assertThrows(
                RateLimitExceededException.class,
                () -> blogService.addComment(1L, req, false, visitorIp)
        );
    }

    @Test
    void addComment_HoneypotTriggered_ReturnsNullAndDoesNotSave() {
        CommentRequestDto botComment = new CommentRequestDto("Bot", "Spam link", null, "http://spam.com");

        CommentResponseDto result = blogService.addComment(1L, botComment, false, "10.0.0.99");

        assertNull(result);
        verify(commentRepository, never()).save(any());
    }
}