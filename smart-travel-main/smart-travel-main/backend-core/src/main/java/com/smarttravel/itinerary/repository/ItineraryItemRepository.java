package com.smarttravel.itinerary.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.smarttravel.itinerary.entity.ItineraryItem;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, UUID> {
}
