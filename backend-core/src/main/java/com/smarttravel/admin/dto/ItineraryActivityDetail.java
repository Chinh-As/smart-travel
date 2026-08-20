package com.smarttravel.admin.dto;

import java.time.LocalTime;

public record ItineraryActivityDetail(
        LocalTime startTime,
        LocalTime endTime,
        String placeName,
        String note
) {}
