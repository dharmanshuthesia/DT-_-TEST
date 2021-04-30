package com.demo.socialmedia.repository;

import com.demo.socialmedia.model.Reactions;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionsRepository extends JpaRepository<Reactions, Long> {
    boolean existsByUserIdAndPostId(Long userId, Long postId);
}
