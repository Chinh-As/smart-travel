package com.smarttravel.place.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smarttravel.place.entity.PlaceExternalStats;
import java.util.UUID;
import java.util.Optional;

public interface PlaceExternalStatsRepository extends JpaRepository<PlaceExternalStats, UUID> {
    Optional<PlaceExternalStats> findByPlaceIdAndSourceName(UUID placeId, String sourceName);
}
