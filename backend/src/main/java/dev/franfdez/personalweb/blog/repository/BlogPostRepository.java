package dev.franfdez.personalweb.blog.repository;

import dev.franfdez.personalweb.blog.model.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    @Query("SELECT p FROM BlogPost p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<BlogPost> searchByTitleOrContent(@Param("search") String search, Pageable pageable);
}