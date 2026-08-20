package com.smarttravel.review.dto.request;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record ReviewSaveRequest(
    @NotNull(message = "ID địa điểm không được để trống")
    UUID placeId,

    @NotNull(message = "Điểm đánh giá không được để trống")
    @DecimalMin(value = "1.0", message = "Điểm đánh giá phải từ 1.0")
    @DecimalMax(value = "5.0", message = "Điểm đánh giá tối đa là 5.0")
    BigDecimal ratingPoint,

    String reviewContent
) {}
