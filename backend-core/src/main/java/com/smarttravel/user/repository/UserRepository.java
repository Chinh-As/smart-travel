package com.smarttravel.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smarttravel.user.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    /** True if username is taken by someone OTHER than the given user id */
    boolean existsByUsernameAndIdNot(String username, UUID id);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL")
    long countActive();
}
