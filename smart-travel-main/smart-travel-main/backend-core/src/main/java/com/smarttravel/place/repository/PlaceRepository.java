package com.smarttravel.place.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smarttravel.place.entity.Place;

public interface PlaceRepository extends JpaRepository<Place, UUID> {

    @Query(value = """
            SELECT p.*
            FROM places p
            LEFT JOIN place_categories pc ON pc.place_id = p.id
            LEFT JOIN place_external_stats pes ON pes.place_id = p.id
            WHERE p.deleted_at IS NULL
              AND (:keyword IS NULL OR p.name ILIKE '%' || :keyword || '%' OR p.address ILIKE '%' || :keyword || '%' OR p.name ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%' OR p.address ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%')
              AND (:hasLocation = FALSE OR ST_DWithin(
                      CAST(p.geom AS geography),
                      CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
                      :radiusMeters
                  ))
              AND (:categoryIds IS NULL OR pc.category_id = ANY(CAST(:categoryIds AS uuid[])))
            GROUP BY p.id
            ORDER BY
              CASE WHEN :hasLocation THEN
                ST_Distance(
                    CAST(p.geom AS geography),
                    CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography)
                )
              ELSE 0 END ASC NULLS LAST
            """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id)
            FROM places p
            LEFT JOIN place_categories pc ON pc.place_id = p.id
            WHERE p.deleted_at IS NULL
              AND (:keyword IS NULL OR p.name ILIKE '%' || :keyword || '%' OR p.address ILIKE '%' || :keyword || '%' OR p.name ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%' OR p.address ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%')
              AND (:hasLocation = FALSE OR ST_DWithin(
                      CAST(p.geom AS geography),
                      CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
                      :radiusMeters
                  ))
              AND (:categoryIds IS NULL OR pc.category_id = ANY(CAST(:categoryIds AS uuid[])))
            """,
            nativeQuery = true)
    Page<Place> searchSortByDistance(
            @Param("keyword") String keyword,
            @Param("hasLocation") boolean hasLocation,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters,
            @Param("categoryIds") String categoryIds,
            Pageable pageable
    );

    @Query(value = """
            SELECT p.*
            FROM places p
            LEFT JOIN place_categories pc ON pc.place_id = p.id
            LEFT JOIN place_external_stats pes ON pes.place_id = p.id
            WHERE p.deleted_at IS NULL
              AND (:keyword IS NULL OR p.name ILIKE '%' || :keyword || '%' OR p.address ILIKE '%' || :keyword || '%' OR p.name ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%' OR p.address ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%')
              AND (:hasLocation = FALSE OR ST_DWithin(
                      CAST(p.geom AS geography),
                      CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
                      :radiusMeters
                  ))
              AND (:categoryIds IS NULL OR pc.category_id = ANY(CAST(:categoryIds AS uuid[])))
            GROUP BY p.id
            ORDER BY MAX(pes.rating) DESC NULLS LAST
            """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id)
            FROM places p
            LEFT JOIN place_categories pc ON pc.place_id = p.id
            WHERE p.deleted_at IS NULL
              AND (:keyword IS NULL OR p.name ILIKE '%' || :keyword || '%' OR p.address ILIKE '%' || :keyword || '%' OR p.name ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%' OR p.address ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%')
              AND (:hasLocation = FALSE OR ST_DWithin(
                      CAST(p.geom AS geography),
                      CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
                      :radiusMeters
                  ))
              AND (:categoryIds IS NULL OR pc.category_id = ANY(CAST(:categoryIds AS uuid[])))
            """,
            nativeQuery = true)
    Page<Place> searchSortByRating(
            @Param("keyword") String keyword,
            @Param("hasLocation") boolean hasLocation,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters,
            @Param("categoryIds") String categoryIds,
            Pageable pageable
    );

    @Query(value = """
            SELECT p.*
            FROM places p
            LEFT JOIN place_categories pc ON pc.place_id = p.id
            LEFT JOIN place_prices pp ON pp.place_id = p.id
            WHERE p.deleted_at IS NULL
              AND (:keyword IS NULL OR p.name ILIKE '%' || :keyword || '%' OR p.address ILIKE '%' || :keyword || '%' OR p.name ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%' OR p.address ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%')
              AND (:hasLocation = FALSE OR ST_DWithin(
                      CAST(p.geom AS geography),
                      CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
                      :radiusMeters
                  ))
              AND (:categoryIds IS NULL OR pc.category_id = ANY(CAST(:categoryIds AS uuid[])))
            GROUP BY p.id
            ORDER BY MIN(pp.price) ASC NULLS LAST
            """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id)
            FROM places p
            LEFT JOIN place_categories pc ON pc.place_id = p.id
            WHERE p.deleted_at IS NULL
              AND (:keyword IS NULL OR p.name ILIKE '%' || :keyword || '%' OR p.address ILIKE '%' || :keyword || '%' OR p.name ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%' OR p.address ILIKE '%' || REPLACE(:keyword, ' ', '%') || '%')
              AND (:hasLocation = FALSE OR ST_DWithin(
                      CAST(p.geom AS geography),
                      CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
                      :radiusMeters
                  ))
              AND (:categoryIds IS NULL OR pc.category_id = ANY(CAST(:categoryIds AS uuid[])))
            """,
            nativeQuery = true)
    Page<Place> searchSortByPrice(
            @Param("keyword") String keyword,
            @Param("hasLocation") boolean hasLocation,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters,
            @Param("categoryIds") String categoryIds,
            Pageable pageable
    );

    @Query("SELECT p FROM Place p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Place> findActiveById(@Param("id") UUID id);

    @Query("SELECT COUNT(p) FROM Place p WHERE p.deletedAt IS NULL")
    long countActive();
}
