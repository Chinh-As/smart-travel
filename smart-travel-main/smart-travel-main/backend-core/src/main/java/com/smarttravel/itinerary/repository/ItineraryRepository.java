package com.smarttravel.itinerary.repository;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.smarttravel.itinerary.entity.Itinerary;

import java.util.List;
import java.util.Optional;

public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {

    @Query(value = "SELECT i FROM Itinerary i JOIN i.user u WHERE i.deletedAt IS NULL " +
           "AND (:keyword IS NULL OR :keyword = '' OR u.email ILIKE CONCAT('%', :keyword, '%'))",
           countQuery = "SELECT COUNT(i) FROM Itinerary i JOIN i.user u WHERE i.deletedAt IS NULL " +
           "AND (:keyword IS NULL OR :keyword = '' OR u.email ILIKE CONCAT('%', :keyword, '%'))")
    Page<Itinerary> searchItineraries(@Param("keyword") String keyword, Pageable pageable);

    Optional<Itinerary> findByUserIdAndDeletedAtIsNull(UUID userId);

    List<Itinerary> findAllByUserIdAndDeletedAtIsNull(UUID userId);
}
