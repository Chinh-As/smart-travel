package com.smarttravel.admin.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.admin.dto.ItineraryAdminResponse;
import com.smarttravel.admin.dto.ItineraryDetailAdminResponse;
import com.smarttravel.admin.service.AdminUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/itineraries")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class AdminItineraryController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<Page<ItineraryAdminResponse>> getItineraries(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ItineraryAdminResponse> response = adminUserService.getItineraries(keyword, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItineraryDetailAdminResponse> getItineraryDetails(@PathVariable UUID id) {
        ItineraryDetailAdminResponse response = adminUserService.getItineraryDetails(id);
        return ResponseEntity.ok(response);
    }
}
