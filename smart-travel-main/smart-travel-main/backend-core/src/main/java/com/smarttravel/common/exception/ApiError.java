package com.smarttravel.common.exception;

import java.time.OffsetDateTime;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ApiError {
    private int status;
    private String error;
    private String message;
    private String path;
    private OffsetDateTime timestamp;
}
