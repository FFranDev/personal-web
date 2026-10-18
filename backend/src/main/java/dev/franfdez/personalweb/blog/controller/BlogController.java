package dev.franfdez.personalweb.blog.controller;

import dev.franfdez.personalweb.blog.dto.AdminLoginRequestDto;
import dev.franfdez.personalweb.blog.dto.BlogPageResponseDto;
import dev.franfdez.personalweb.blog.dto.BlogPostResponseDto;
import dev.franfdez.personalweb.blog.dto.CommentRequestDto;
import dev.franfdez.personalweb.blog.dto.CommentResponseDto;
import dev.franfdez.personalweb.blog.service.AdminAuthService;
import dev.franfdez.personalweb.blog.service.BlogService;
import dev.franfdez.personalweb.blog.service.ImageStorageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/blog")
public class BlogController {

    private final BlogService blogService;
    private final AdminAuthService adminAuthService;
    private final ImageStorageService imageStorageService;

    public BlogController(
            BlogService blogService,
            AdminAuthService adminAuthService,
            ImageStorageService imageStorageService) {
        this.blogService = blogService;
        this.adminAuthService = adminAuthService;
        this.imageStorageService = imageStorageService;
    }

    @GetMapping("/posts")
    public ResponseEntity<BlogPageResponseDto> getPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        return ResponseEntity.ok(blogService.getPosts(page, size, search));
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        Resource resource = imageStorageService.loadImageAsResource(filename);
        String contentType = "image/png";
        try {
            String detected = Files.probeContentType(Paths.get(resource.getURI()));
            if (detected != null) {
                contentType = detected;
            }
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<Map<String, String>> adminLogin(@Valid @RequestBody AdminLoginRequestDto request) {
        String token = adminAuthService.login(request.password());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/admin/logout")
    public ResponseEntity<Void> adminLogout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        adminAuthService.logout(authHeader);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BlogPostResponseDto> createPost(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        adminAuthService.requireAdmin(authHeader);
        BlogPostResponseDto created = blogService.createPost(title, content, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @PathVariable Long postId) {

        adminAuthService.requireAdmin(authHeader);
        blogService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponseDto> addComment(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequestDto requestDto,
            HttpServletRequest httpRequest) {

        boolean isAdmin = adminAuthService.isValidAdminHeader(authHeader);
        String clientIp = extractClientIp(httpRequest);
        CommentResponseDto created = blogService.addComment(postId, requestDto, isAdmin, clientIp);

        if (created == null) {
            // Silently return 200 OK if honeypot was triggered
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @PathVariable Long commentId) {

        adminAuthService.requireAdmin(authHeader);
        blogService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedHeader = request.getHeader("X-Forwarded-For");
        if (forwardedHeader != null && !forwardedHeader.isBlank()) {
            return forwardedHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}