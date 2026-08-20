package com.smarttravel.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalPlaces;
    private long totalUsers;
    private long totalItineraries;
    private long totalFavorites;
}
