package com.smarttravel.auth.dto;

public record AuthResult(AuthResponse response, String refreshToken) {}
