package com.smarttravel.security;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttravel.common.exception.ApiError;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = allowedOrigins != null ? new java.util.ArrayList<>(allowedOrigins) : new java.util.ArrayList<>();
        if (!origins.contains("https://*.vercel.app")) {
            origins.add("https://*.vercel.app");
        }
        if (!origins.contains("http://localhost:*")) {
            origins.add("http://localhost:*");
        }
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // bắt buộc để cookie refresh token được gửi kèm
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                // CSRF disabled: an toàn vì refresh-token cookie dùng SameSite=Strict (xem
                // AuthController#setRefreshTokenCookie).
                // Nếu đổi SameSite sang Lax/None, PHẢI bật lại CSRF protection cho
                // /auth/refresh và /auth/logout.
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> writeErrorResponse(response,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                "Unauthorized", "Authentication required", request.getRequestURI()))
                        .accessDeniedHandler((request, response, accessDeniedException) -> writeErrorResponse(response,
                                HttpServletResponse.SC_FORBIDDEN,
                                "Forbidden", "You do not have permission to access this resource",
                                request.getRequestURI())))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/places/**", "/api/v1/categories/**",
                                "/api/v1/reviews/places/**")
                        .permitAll()
                        // More-specific POST rule must come before the wildcard ADMIN rule below
                        .requestMatchers(HttpMethod.POST, "/api/v1/places/*/reviews").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/places/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/places/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/places/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private void writeErrorResponse(HttpServletResponse response, int status,
            String error, String message, String path) throws IOException {
        ApiError apiError = ApiError.builder()
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .timestamp(OffsetDateTime.now())
                .build();
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(apiError));
    }

}
