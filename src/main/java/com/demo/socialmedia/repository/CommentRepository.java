package com.demo.socialmedia.repository;

import com.demo.socialmedia.model.Comment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository  extends JpaRepository<Comment, Long> {

    List<Comment> findByUserId(Long userId);

    Optional<Comment> findByPostId(Long postId);

    List<Comment> findByPostIdAndUserId(Long postId, Long userId);

    Optional<Comment> findByIdAndPostId(Long commentId, Long postId);
}
