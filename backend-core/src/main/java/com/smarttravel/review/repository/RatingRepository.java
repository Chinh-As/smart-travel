package com.smarttravel.review.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smarttravel.review.entity.Rating;

public interface RatingRepository extends JpaRepository<Rating, UUID> {

    // Used by admin search panel
    @Query(value = "SELECT r FROM Rating r JOIN FETCH r.user u JOIN FETCH r.place p " +
           "WHERE r.deletedAt IS NULL " +
           "AND (:status IS NULL OR :status = '' OR r.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR u.email ILIKE CONCAT('%', :keyword, '%'))",
           countQuery = "SELECT COUNT(r) FROM Rating r JOIN r.user u " +
           "WHERE r.deletedAt IS NULL " +
           "AND (:status IS NULL OR :status = '' OR r.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR u.email ILIKE CONCAT('%', :keyword, '%'))")
    Page<Rating> searchReviews(@Param("status") String status, @Param("keyword") String keyword, Pageable pageable);

    List<Rating> findByPlaceIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(UUID placeId, String status);

    // Duplicate check: one review per user per place
    Optional<Rating> findByUser_IdAndPlace_Id(UUID userId, UUID placeId);

    // Public listing for a place (excludes soft-deleted)
    Page<Rating> findByPlace_IdAndDeletedAtIsNull(UUID placeId, Pageable pageable);
}

