package com.smarttravel.review.entity;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.smarttravel.place.entity.Place;
import com.smarttravel.review.converter.TagsConverter;
import com.smarttravel.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "ratings",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_rating_user_place",
        columnNames = {"user_id", "place_id"}
    )
)
@Getter
@Setter
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "rating_point", nullable = false)
    private java.math.BigDecimal ratingPoint;

    @Column(name = "review_content")
    private String reviewContent;

    // Stored as JSON string: ["tag1","tag2"]
    @Convert(converter = TagsConverter.class)
    @Column(name = "tags", columnDefinition = "TEXT")
    private List<String> tags;

    @Column(nullable = false)
    private String status = "APPROVED"; // PENDING, APPROVED, HIDDEN

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}

