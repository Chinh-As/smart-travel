package com.smarttravel.admin.controller;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import com.smarttravel.admin.dto.DatabaseStatus;
import com.smarttravel.admin.dto.ServiceStatus;
import com.smarttravel.admin.dto.SystemInfoResponse;
import com.smarttravel.place.repository.PlaceRepository;
import com.smarttravel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/system-info")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class SystemInfoController {

    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final RestClient restClient;

    @GetMapping
    public ResponseEntity<SystemInfoResponse> getSystemInfo() {
        SystemInfoResponse info = new SystemInfoResponse();
        info.setAppVersion("1.0.0");
        info.setBuildTime("2026-07-17");

        // Database health & counts
        long placeCount = 0;
        long userCount = 0;
        String dbStatusStr = "connected";
        try {
            placeCount = placeRepository.count();
            userCount = userRepository.count();
        } catch (Exception e) {
            log.error("Failed to query database status: {}", e.getMessage());
            dbStatusStr = "disconnected";
        }
        info.setDatabase(new DatabaseStatus(dbStatusStr, placeCount, userCount));

        // Services health
        String javaStatus = "running";
        String pythonStatus = checkFastApiStatus();
        info.setServices(new ServiceStatus(
            javaStatus, 8000,
            pythonStatus, 5000
        ));

        info.setLastUpdated(LocalDateTime.now());
        return ResponseEntity.ok(info);
    }

    private String checkFastApiStatus() {
        try {
            ResponseEntity<Void> response = restClient.get()
                .uri("/health")
                .retrieve()
                .toBodilessEntity();
            return response.getStatusCode().is2xxSuccessful() ? "running" : "stopped";
        } catch (Exception e) {
            log.warn("FastAPI health check failed: {}", e.getMessage());
            return "stopped";
        }
    }

}
