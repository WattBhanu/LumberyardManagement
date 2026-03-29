package com.lumberyard_backend.dto;

import lombok.Data;

@Data
public class TreatmentRequest {
    private Long timberId;
    private String chemicalType;
    private Double timberQuantity;
    private Double chemicalQuantity;
}
