package com.smarttravel.itinerary.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import com.smarttravel.auth.service.JwtService;
import com.smarttravel.common.exception.GlobalExceptionHandler;
import com.smarttravel.itinerary.dto.response.ItineraryGenerateResponse;
import com.smarttravel.itinerary.dto.response.ItineraryResponse;
import com.smarttravel.itinerary.service.ItineraryService;

@WebMvcTest(ItineraryController.class)
@Import({ItineraryControllerTestSecurityConfig.class, GlobalExceptionHandler.class})
class ItineraryControllerTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ITINERARY_ID = UUID.randomUUID();

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ItineraryService itineraryService;

    @MockBean
    private JwtService jwtService;

    @Test
    void getItineraries_authenticatedUser_returnsSavedItineraries() throws Exception {
        when(itineraryService.getUserItineraries(USER_ID)).thenReturn(List.of(response()));

        mockMvc.perform(get("/api/v1/itineraries").with(authentication(userAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(ITINERARY_ID.toString()))
                .andExpect(jsonPath("$[0].title").value("Weekend in HCMC"));
    }

    @Test
    void createItinerary_validPayload_returnsSavedItinerary() throws Exception {
        when(itineraryService.saveItinerary(eq(USER_ID), any())).thenReturn(response());

        mockMvc.perform(post("/api/v1/itineraries")
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Weekend in HCMC\",\"items\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ITINERARY_ID.toString()));

        verify(itineraryService).saveItinerary(eq(USER_ID), any());
    }

    @Test
    void generateItinerary_validPayload_returnsGeneratedSchedule() throws Exception {
        when(itineraryService.generate(any())).thenReturn(ItineraryGenerateResponse.builder()
                .date(LocalDate.of(2026, 7, 18))
                .items(List.of())
                .unscheduledPlaceIds(List.of())
                .build());

        mockMvc.perform(post("/api/v1/itineraries/generate")
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "date": "18-07-2026",
                                  "slots": [{ "startTime": "08:00", "endTime": "11:00" }],
                                  "candidatePlaceIds": ["%s"]
                                }
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date").value("18-07-2026"));

        verify(itineraryService).generate(any());
    }

    @Test
    void updateItinerary_validPayload_usesPathId() throws Exception {
        when(itineraryService.updateItinerary(eq(USER_ID), eq(ITINERARY_ID), any())).thenReturn(response());

        mockMvc.perform(put("/api/v1/itineraries/{id}", ITINERARY_ID)
                        .with(authentication(userAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Weekend in HCMC\",\"items\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Weekend in HCMC"));

        verify(itineraryService).updateItinerary(eq(USER_ID), eq(ITINERARY_ID), any());
    }

    @Test
    void deleteItinerary_authenticatedUser_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/itineraries/{id}", ITINERARY_ID)
                        .with(authentication(userAuth())))
                .andExpect(status().isNoContent());

        verify(itineraryService).deleteItinerary(USER_ID, ITINERARY_ID);
    }

    @Test
    void itineraryEndpoints_unauthenticatedUser_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/itineraries"))
                .andExpect(status().isUnauthorized());
    }

    private UsernamePasswordAuthenticationToken userAuth() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    private ItineraryResponse response() {
        return ItineraryResponse.builder()
                .id(ITINERARY_ID)
                .title("Weekend in HCMC")
                .startDate(LocalDate.of(2026, 7, 18))
                .endDate(LocalDate.of(2026, 7, 18))
                .status("DRAFT")
                .createdAt(OffsetDateTime.now())
                .days(List.of())
                .build();
    }
}
