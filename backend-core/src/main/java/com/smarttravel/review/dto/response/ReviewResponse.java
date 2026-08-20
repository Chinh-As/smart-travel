package com.smarttravel.review.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private UUID id;
    private UUID placeId;
    private UUID userId;
    private String userEmail;
    private String userName;
    private Integer rating;
    private BigDecimal ratingPoint;
    private List<String> tags;
    private String comment;
    private String reviewContent;
    private String status;
    private OffsetDateTime createdAt;
}

