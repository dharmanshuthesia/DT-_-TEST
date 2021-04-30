package com.demo.socialmedia.repository;

import com.demo.socialmedia.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    //to register
    boolean existsByEmailAddress(String userEmailAddress);
    User findByEmailAddress(String userEmailAddress);
}
