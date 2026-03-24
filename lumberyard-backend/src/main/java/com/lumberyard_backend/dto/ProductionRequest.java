package com.lumberyard_backend.dto;

import lombok.Data;

@Data
public class ProductionRequest {
    private Long timberId;
    private String processType;
    private Double amount;
}
