package com.demo.socialmedia.repository;

import com.demo.socialmedia.model.ReactionsCount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionsCountRepository extends JpaRepository<ReactionsCount, Long> {
    ReactionsCount findByIdAndPostId(Long Id, Long postId);
    ReactionsCount findByPostId(Long postId);
}
