package com.smarttravel.itinerary.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ItineraryGenerateRequest {
    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate date;

    @NotEmpty
    @Valid
    private List<TimeSlotRequest> slots;

    @NotEmpty
    private List<UUID> candidatePlaceIds;

    @Positive
    private Integer visitDurationMinutes;

    @PositiveOrZero
    private Integer bufferMinutes;

    @Positive
    private Integer maxPlaces;
    
}