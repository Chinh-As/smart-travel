package com.smarttravel.itinerary.dto.request;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ItineraryItemSaveRequest(
        @NotNull(message = "Place ID is required")
        UUID placeId,
        
        int dayIndex,
        
        @NotBlank(message = "Start time is required")
        String startTime,
        
        @NotBlank(message = "End time is required")
        String endTime,
        
        String note
) {}
