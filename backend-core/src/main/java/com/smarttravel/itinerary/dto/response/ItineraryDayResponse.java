package com.smarttravel.itinerary.dto.response;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ItineraryDayResponse {
    private UUID id;
    private LocalDate tripDate;
    private int dayIndex;
    private List<ItineraryItemResponse> items;
}
