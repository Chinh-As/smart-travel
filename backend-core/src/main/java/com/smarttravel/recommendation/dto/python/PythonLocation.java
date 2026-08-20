package com.smarttravel.recommendation.dto.python;

public record PythonLocation(
        String type,
        double lat,
        double lng
) {
    public static PythonLocation coordinates(double lat, double lng) {
        return new PythonLocation("COORDINATES", lat, lng);
    }
}