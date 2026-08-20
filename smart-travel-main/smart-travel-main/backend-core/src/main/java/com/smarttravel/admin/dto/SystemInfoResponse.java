package com.smarttravel.admin.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemInfoResponse {
    private String appVersion;
    private String buildTime;
    private DatabaseStatus database;
    private ServiceStatus services;
    private LocalDateTime lastUpdated;
}
