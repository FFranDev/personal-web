package dev.franfdez.personalweb.blog.repository;

import dev.franfdez.personalweb.blog.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    void deleteByParentId(Long parentId);
}