package com.smarttravel.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttravel.auth.dto.AuthResponse;
import com.smarttravel.auth.dto.AuthResult;
import com.smarttravel.auth.service.AuthService;
import com.smarttravel.auth.service.JwtService;
import com.smarttravel.common.enums.Role;
import com.smarttravel.common.exception.BadRequestException;
import com.smarttravel.common.exception.GlobalExceptionHandler;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({AuthControllerTestSecurityConfig.class, GlobalExceptionHandler.class})
@DisplayName("AuthController Integration Tests")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AuthService authService;
    @MockBean JwtService jwtService; // required by JwtAuthenticationFilter in slice

    private static final UUID USER_ID = UUID.randomUUID();

    private AuthResult mockAuthResult() {
        AuthResponse response = new AuthResponse(
                "mock-access-token", USER_ID, "Nguyen Van A", "user@example.com", Role.USER
        );
        return new AuthResult(response, "mock-refresh-token");
    }

    // =========================================================================
    // POST /auth/register
    // =========================================================================

    @Nested
    @DisplayName("POST /auth/register")
    class RegisterEndpointTests {

        @Test
        @DisplayName("Happy path: payload hợp lệ → HTTP 200, body chứa accessToken, Set-Cookie có refreshToken")
        void register_validPayload_returns200WithTokenAndCookie() throws Exception {
            // Arrange
            when(authService.register(any())).thenReturn(mockAuthResult());

            String body = """
                    {
                      "name": "Nguyen Van A",
                      "email": "user@example.com",
                      "password": "password123"
                    }
                    """;

            // Act & Assert
            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("mock-access-token"))
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.email").value("user@example.com"))
                    .andExpect(jsonPath("$.role").value("USER"))
                    // Verify HttpOnly cookie tồn tại
                    .andExpect(header().exists("Set-Cookie"))
                    .andExpect(header().string("Set-Cookie", containsString("refreshToken")))
                    .andExpect(header().string("Set-Cookie", containsString("HttpOnly")));
        }

        @Test
        @DisplayName("Thiếu email: HTTP 400 validation error")
        void register_missingEmail_returns400() throws Exception {
            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "name": "Nguyen Van A", "password": "password123" }
                                    """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Email sai định dạng: HTTP 400 validation error")
        void register_invalidEmailFormat_returns400() throws Exception {
            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "name": "Nguyen Van A", "email": "not-an-email", "password": "password123" }
                                    """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Password ngắn hơn 8 ký tự: HTTP 400 validation error")
        void register_shortPassword_returns400() throws Exception {
            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "name": "Nguyen Van A", "email": "user@example.com", "password": "short" }
                                    """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Email đã tồn tại (service ném BadRequestException): HTTP 400 với message rõ ràng")
        void register_duplicateEmail_returns400WithMessage() throws Exception {
            when(authService.register(any()))
                    .thenThrow(new BadRequestException("Email already in use"));

            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "name": "Nguyen Van A", "email": "user@example.com", "password": "password123" }
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Email already in use"));
        }

        @Test
        @DisplayName("Body rỗng: HTTP 400")
        void register_emptyBody_returns400() throws Exception {
            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }
    }

    // =========================================================================
    // POST /auth/login
    // =========================================================================

    @Nested
    @DisplayName("POST /auth/login")
    class LoginEndpointTests {

        @Test
        @DisplayName("Happy path: credentials đúng → HTTP 200, body chứa accessToken, Set-Cookie có refreshToken")
        void login_validCredentials_returns200WithTokenAndCookie() throws Exception {
            // Arrange
            when(authService.login(any())).thenReturn(mockAuthResult());

            String body = """
                    {
                      "email": "user@example.com",
                      "password": "password123"
                    }
                    """;

            // Act & Assert
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("mock-access-token"))
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.email").value("user@example.com"))
                    .andExpect(jsonPath("$.role").value("USER"))
                    .andExpect(header().exists("Set-Cookie"))
                    .andExpect(header().string("Set-Cookie", containsString("refreshToken")))
                    .andExpect(header().string("Set-Cookie", containsString("HttpOnly")));
        }

        @Test
        @DisplayName("Email không hợp lệ (format): HTTP 400 validation error")
        void login_invalidEmailFormat_returns400() throws Exception {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "email": "not-an-email", "password": "password123" }
                                    """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Thiếu password: HTTP 400 validation error")
        void login_missingPassword_returns400() throws Exception {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "email": "user@example.com" }
                                    """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Sai credentials (service ném BadRequestException): HTTP 400 với message")
        void login_wrongCredentials_returns400WithMessage() throws Exception {
            when(authService.login(any()))
                    .thenThrow(new BadRequestException("Invalid email or password"));

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "email": "user@example.com", "password": "wrongpass" }
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Invalid email or password"));
        }

        @Test
        @DisplayName("Tài khoản bị khóa (service ném BadRequestException): HTTP 400 với message tiếng Việt")
        void login_inactiveAccount_returns400WithMessage() throws Exception {
            when(authService.login(any()))
                    .thenThrow(new BadRequestException("Tài khoản của bạn đã bị khóa."));

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    { "email": "locked@example.com", "password": "password123" }
                                    """))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Tài khoản của bạn đã bị khóa."));
        }

        @Test
        @DisplayName("Body rỗng: HTTP 400")
        void login_emptyBody_returns400() throws Exception {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }
    }
}
