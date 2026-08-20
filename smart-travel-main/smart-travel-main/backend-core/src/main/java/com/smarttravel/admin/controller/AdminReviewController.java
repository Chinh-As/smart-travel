package com.smarttravel.admin.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.admin.dto.ReviewAdminResponse;
import com.smarttravel.admin.dto.ReviewStatusRequest;
import com.smarttravel.admin.service.AdminUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<Page<ReviewAdminResponse>> getReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewAdminResponse> response = adminUserService.getReviews(status, keyword, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateReviewStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewStatusRequest request) {
        log.info("[REVIEW MODERATION] Admin updated status of review ID: {} to {}", id, request.status());
        adminUserService.updateReviewStatus(id, request);
        return ResponseEntity.noContent().build();
    }
}
