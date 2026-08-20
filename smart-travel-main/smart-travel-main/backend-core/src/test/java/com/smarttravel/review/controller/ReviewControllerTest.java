package com.smarttravel.review.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttravel.common.exception.GlobalExceptionHandler;
import com.smarttravel.common.exception.ResourceNotFoundException;
import com.smarttravel.review.dto.request.ReviewRequest;
import com.smarttravel.review.dto.response.ReviewResponse;
import com.smarttravel.review.service.ReviewService;

import com.smarttravel.auth.service.JwtService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReviewController.class)
@Import({ReviewControllerTestSecurityConfig.class, GlobalExceptionHandler.class})
class ReviewControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean ReviewService reviewService;
    @MockBean JwtService jwtService;  // needed by JwtAuthenticationFilter (@Component in slice)

    private static final UUID PLACE_ID = UUID.randomUUID();
    private static final UUID USER_ID  = UUID.randomUUID();

    private UsernamePasswordAuthenticationToken userAuth() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    void createReview_validRequest_returns201() throws Exception {
        ReviewRequest req = new ReviewRequest();
        req.setRating(4);
        req.setTags(List.of("Sach se", "An toan"));
        req.setComment("Rat thich!");

        ReviewResponse resp = ReviewResponse.builder()
                .id(UUID.randomUUID()).placeId(PLACE_ID).userId(USER_ID)
                .userName("Test User").rating(4)
                .tags(List.of("Sach se", "An toan")).comment("Rat thich!")
                .status("APPROVED").createdAt(OffsetDateTime.now()).build();

        when(reviewService.createReview(eq(PLACE_ID), any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/places/{id}/reviews", PLACE_ID)
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.tags[0]").value("Sach se"))
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void createReview_missingRating_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/places/{id}/reviews", PLACE_ID)
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"comment\":\"test\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReview_ratingOutOfRange_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/places/{id}/reviews", PLACE_ID)
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":6}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReview_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/places/{id}/reviews", PLACE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":3}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createReview_duplicateReview_returns409() throws Exception {
        when(reviewService.createReview(eq(PLACE_ID), any()))
                .thenThrow(new IllegalStateException("already reviewed"));

        mockMvc.perform(post("/api/v1/places/{id}/reviews", PLACE_ID)
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":3}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("already reviewed"));
    }

    @Test
    void createReview_placeNotFound_returns404() throws Exception {
        when(reviewService.createReview(eq(PLACE_ID), any()))
                .thenThrow(new ResourceNotFoundException("Place not found"));

        mockMvc.perform(post("/api/v1/places/{id}/reviews", PLACE_ID)
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":3}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getReviews_public_returns200() throws Exception {
        ReviewResponse resp = ReviewResponse.builder()
                .id(UUID.randomUUID()).placeId(PLACE_ID).userId(USER_ID)
                .userName("Test User").rating(5).tags(List.of("View dep"))
                .comment("Tuyet voi!").status("APPROVED").createdAt(OffsetDateTime.now()).build();

        when(reviewService.getReviews(eq(PLACE_ID), eq(0), eq(10)))
                .thenReturn(new PageImpl<>(List.of(resp)));

        mockMvc.perform(get("/api/v1/places/{id}/reviews", PLACE_ID)
                        .param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].rating").value(5))
                .andExpect(jsonPath("$.content[0].tags[0]").value("View dep"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getReviews_placeNotFound_returns404() throws Exception {
        when(reviewService.getReviews(eq(PLACE_ID), anyInt(), anyInt()))
                .thenThrow(new ResourceNotFoundException("Place not found"));

        mockMvc.perform(get("/api/v1/places/{id}/reviews", PLACE_ID))
                .andExpect(status().isNotFound());
    }
}
