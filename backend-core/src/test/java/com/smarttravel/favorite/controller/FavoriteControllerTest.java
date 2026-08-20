package com.smarttravel.favorite.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import com.smarttravel.common.exception.GlobalExceptionHandler;
import com.smarttravel.favorite.dto.FavoriteResponse;
import com.smarttravel.favorite.service.FavoriteService;

@WebMvcTest(FavoriteController.class)
@Import({FavoriteControllerTest.TestSecurityConfig.class, GlobalExceptionHandler.class})
public class FavoriteControllerTest {

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FavoriteService favoriteService;

    @MockBean
    private com.smarttravel.auth.service.JwtService jwtService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID PLACE_ID = UUID.randomUUID();

    private UsernamePasswordAuthenticationToken userAuth() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    public void getFavorites_shouldReturnList() throws Exception {
        FavoriteResponse response = FavoriteResponse.builder()
                .id(UUID.randomUUID())
                .userId(USER_ID)
                .placeId(PLACE_ID)
                .createdAt(LocalDateTime.now())
                .build();

        when(favoriteService.getFavorites(USER_ID)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/favorites")
                .with(authentication(userAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].placeId").value(PLACE_ID.toString()))
                .andExpect(jsonPath("$[0].userId").value(USER_ID.toString()));
    }

    @Test
    public void addFavorite_shouldCreateAndReturnFavorite() throws Exception {
        FavoriteResponse response = FavoriteResponse.builder()
                .id(UUID.randomUUID())
                .userId(USER_ID)
                .placeId(PLACE_ID)
                .createdAt(LocalDateTime.now())
                .build();

        when(favoriteService.addFavorite(USER_ID, PLACE_ID)).thenReturn(response);

        mockMvc.perform(post("/api/favorites")
                .with(authentication(userAuth()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"placeId\": \"" + PLACE_ID + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.placeId").value(PLACE_ID.toString()));
    }

    @Test
    public void addFavorite_whenDuplicate_shouldReturnConflict() throws Exception {
        when(favoriteService.addFavorite(eq(USER_ID), any()))
                .thenThrow(new IllegalStateException("Địa điểm này đã được thêm vào danh sách yêu thích."));

        mockMvc.perform(post("/api/favorites")
                .with(authentication(userAuth()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"placeId\": \"" + PLACE_ID + "\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Địa điểm này đã được thêm vào danh sách yêu thích."));
    }

    @Test
    public void removeFavorite_shouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/favorites/{placeId}", PLACE_ID)
                .with(authentication(userAuth())))
                .andExpect(status().isNoContent());

        verify(favoriteService).removeFavorite(USER_ID, PLACE_ID);
    }

    @Test
    public void removeFavorite_whenNotFound_shouldReturnNotFound() throws Exception {
        doThrow(new NoSuchElementException("Không tìm thấy mục yêu thích để xóa."))
                .when(favoriteService).removeFavorite(USER_ID, PLACE_ID);

        mockMvc.perform(delete("/api/favorites/{placeId}", PLACE_ID)
                .with(authentication(userAuth())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Không tìm thấy mục yêu thích để xóa."));
    }

    @Test
    public void checkFavorite_shouldReturnStatus() throws Exception {
        when(favoriteService.isFavorite(USER_ID, PLACE_ID)).thenReturn(true);

        mockMvc.perform(get("/api/favorites/check/{placeId}", PLACE_ID)
                .with(authentication(userAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFavorite").value(true));
    }
}
