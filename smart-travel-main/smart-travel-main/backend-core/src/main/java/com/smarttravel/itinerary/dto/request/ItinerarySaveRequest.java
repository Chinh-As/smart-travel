package com.smarttravel.itinerary.dto.request;

import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ItinerarySaveRequest(
                UUID id,

                @NotBlank(message = "Title is required") String title,

                @NotNull(message = "Items list cannot be null") @Valid List<ItineraryItemSaveRequest> items) {
}
