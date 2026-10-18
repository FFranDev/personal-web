package dev.franfdez.personalweb.blog.service;

import dev.franfdez.personalweb.blog.dto.BlogPageResponseDto;
import dev.franfdez.personalweb.blog.dto.BlogPostResponseDto;
import dev.franfdez.personalweb.blog.dto.CommentRequestDto;
import dev.franfdez.personalweb.blog.dto.CommentResponseDto;
import dev.franfdez.personalweb.blog.model.BlogPost;
import dev.franfdez.personalweb.blog.model.Comment;
import dev.franfdez.personalweb.blog.repository.BlogPostRepository;
import dev.franfdez.personalweb.blog.repository.CommentRepository;
import dev.franfdez.personalweb.common.exception.RateLimitExceededException;
import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BlogService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Duration COMMENT_COOLDOWN = Duration.ofMinutes(1);
    private static final String AUTHOR_DISPLAY_NAME = "Fran";

    private final BlogPostRepository blogPostRepository;
    private final CommentRepository commentRepository;
    private final ImageStorageService imageStorageService;
    private final Map<String, Instant> commentIpMap = new ConcurrentHashMap<>();

    public BlogService(
            BlogPostRepository blogPostRepository,
            CommentRepository commentRepository,
            ImageStorageService imageStorageService) {
        this.blogPostRepository = blogPostRepository;
        this.commentRepository = commentRepository;
        this.imageStorageService = imageStorageService;
    }

    @Transactional(readOnly = true)
    public BlogPageResponseDto getPosts(int page, int size, String search) {
        int safePage = Math.max(0, page - 1); // Convert 1-based UI page to 0-based Spring Pageable
        int safeSize = Math.min(Math.max(1, size), 20);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<BlogPost> postPage;
        if (search != null && !search.isBlank()) {
            postPage = blogPostRepository.searchByTitleOrContent(search.trim(), pageable);
        } else {
            postPage = blogPostRepository.findAll(pageable);
        }

        List<BlogPostResponseDto> postDtos = postPage.getContent().stream()
                .map(this::mapToPostDto)
                .toList();

        return new BlogPageResponseDto(
                postDtos,
                safePage + 1,
                Math.max(1, postPage.getTotalPages()),
                postPage.getTotalElements()
        );
    }

    @Transactional
    public BlogPostResponseDto createPost(String title, String content, List<MultipartFile> images) {
        if (title == null || title.isBlank() || title.length() > 150) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid title up to 150 characters is required");
        }
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post content is required");
        }

        List<String> storedFilenames = imageStorageService.storeImages(images);

        BlogPost post = new BlogPost();
        post.setTitle(title.trim());
        post.setContent(content.trim());
        post.setImageUrls(storedFilenames);

        BlogPost savedPost = blogPostRepository.save(post);
        return mapToPostDto(savedPost);
    }

    @Transactional
    public void deletePost(Long postId) {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        imageStorageService.deleteImages(post.getImageUrls());
        blogPostRepository.delete(post);
    }

    @Transactional
    public CommentResponseDto addComment(
            Long postId,
            CommentRequestDto request,
            boolean isAdmin,
            String clientIp) {

        // 1. Honeypot check for bots
        if (request.website() != null && !request.website().isBlank()) {
            return null;
        }

        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // 2. Only Admin can reply to comments (1-level nesting check)
        if (request.parentId() != null) {
            if (!isAdmin) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the author can reply to comments");
            }
            Comment parent = commentRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found"));
            if (!parent.getBlogPost().getId().equals(postId) || parent.getParentId() != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid parent comment");
            }
        }

        // 3. Visitor validation & IP rate limiting (1 comment per minute for non-admins)
        if (!isAdmin) {
            if (request.authorName() == null || request.authorName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Author alias is required");
            }
            checkCommentRateLimit(clientIp);
        }

        Comment comment = new Comment();
        comment.setBlogPost(post);
        comment.setAuthorName(isAdmin ? AUTHOR_DISPLAY_NAME : request.authorName().trim());
        comment.setAuthor(isAdmin);
        comment.setText(request.text().trim());
        comment.setParentId(request.parentId());

        Comment savedComment = commentRepository.save(comment);
        return mapToCommentDto(savedComment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        commentRepository.deleteByParentId(commentId);
        commentRepository.deleteById(commentId);
    }

    private void checkCommentRateLimit(String clientIp) {
        Instant now = Instant.now();
        Instant lastComment = commentIpMap.get(clientIp);

        if (lastComment != null && Duration.between(lastComment, now).compareTo(COMMENT_COOLDOWN) < 0) {
            throw new RateLimitExceededException("Please wait a minute before posting another comment.");
        }

        commentIpMap.entrySet().removeIf(e -> Duration.between(e.getValue(), now).compareTo(COMMENT_COOLDOWN) >= 0);
        commentIpMap.put(clientIp, now);
    }

    private BlogPostResponseDto mapToPostDto(BlogPost post) {
        List<String> fullImagePaths = post.getImageUrls().stream()
                .map(filename -> "/api/blog/images/" + filename)
                .toList();

        List<CommentResponseDto> commentDtos = post.getComments().stream()
                .map(this::mapToCommentDto)
                .toList();

        return new BlogPostResponseDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt().format(DATE_FORMATTER),
                fullImagePaths,
                commentDtos
        );
    }

    private CommentResponseDto mapToCommentDto(Comment comment) {
        return new CommentResponseDto(
                comment.getId(),
                comment.getAuthorName(),
                comment.isAuthor(),
                comment.getCreatedAt().format(DATE_FORMATTER),
                comment.getText(),
                comment.getParentId()
        );
    }
}