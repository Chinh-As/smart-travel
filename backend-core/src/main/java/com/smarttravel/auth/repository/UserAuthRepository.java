package com.smarttravel.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smarttravel.auth.entity.UserAuth;

public interface UserAuthRepository extends JpaRepository<UserAuth, UUID> {

    @Query("SELECT ua FROM UserAuth ua JOIN FETCH ua.user u WHERE u.email = :email")
    Optional<UserAuth> findByUserEmailWithUser(@Param("email") String email);

    Optional<UserAuth> findByUserId(UUID userId);

    @Query(value = "SELECT ua FROM UserAuth ua JOIN FETCH ua.user u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR u.email ILIKE CONCAT('%', :keyword, '%') OR u.name ILIKE CONCAT('%', :keyword, '%')) " +
           "AND u.deletedAt IS NULL",
           countQuery = "SELECT COUNT(ua) FROM UserAuth ua JOIN ua.user u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR u.email ILIKE CONCAT('%', :keyword, '%') OR u.name ILIKE CONCAT('%', :keyword, '%')) " +
           "AND u.deletedAt IS NULL")
    Page<UserAuth> searchUsers(@Param("keyword") String keyword, Pageable pageable);

}
