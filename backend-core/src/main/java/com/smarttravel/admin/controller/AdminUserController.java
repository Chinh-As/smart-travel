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

import com.smarttravel.admin.dto.UserAdminResponse;
import com.smarttravel.admin.dto.UserStatusRequest;
import com.smarttravel.admin.service.AdminUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<Page<UserAdminResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "user.createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<UserAdminResponse> response = adminUserService.getUsers(keyword, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody UserStatusRequest request) {
        adminUserService.updateUserStatus(id, request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable UUID id,
            @RequestBody com.smarttravel.admin.dto.RoleUpdateRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal UUID principalId) {
        adminUserService.updateUserRole(id, request, principalId);
        return ResponseEntity.noContent().build();
    }
}
