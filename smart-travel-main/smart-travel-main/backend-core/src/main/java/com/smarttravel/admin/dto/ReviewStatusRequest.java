package com.smarttravel.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ReviewStatusRequest(
        @NotBlank(message = "Trạng thái kiểm duyệt không được để trống")
        @Pattern(regexp = "PENDING|APPROVED|HIDDEN", message = "Trạng thái phải là PENDING, APPROVED hoặc HIDDEN")
        String status
) {}
