package com.smarttravel.itinerary.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.smarttravel.itinerary.entity.ItineraryDay;

public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, UUID> {
    @Modifying
    @Query("DELETE FROM ItineraryDay d WHERE d.itinerary.id = :itineraryId")
    void deleteByItineraryId(@Param("itineraryId") UUID itineraryId);
}
