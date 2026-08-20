package com.smarttravel.place.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceSaveRequest {
    private UUID cityId;

    @NotBlank(message = "Tên địa điểm không được để trống")
    private String name;

    private String description;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @NotNull(message = "Kinh độ (lng) không được để trống")
    private Double lng;

    @NotNull(message = "Vĩ độ (lat) không được để trống")
    private Double lat;

    private String mainImageUrl;

    @Builder.Default
    private Boolean wheelchairAccess = false;

    private String rawOpeningHours;

    private List<UUID> categoryIds;

    private Double rating;

    private Integer reviewCount;

    private String priceLevel;
}
