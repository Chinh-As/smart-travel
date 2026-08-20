package com.smarttravel.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceStatus {
    private String javaStatus;
    private Integer javaPort;
    private String pythonStatus;
    private Integer pythonPort;
}
