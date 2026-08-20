package com.smarttravel.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseStatus {
    private String status;
    private Long placeCount;
    private Long userCount;
}
