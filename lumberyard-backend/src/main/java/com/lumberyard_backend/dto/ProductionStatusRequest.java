package com.lumberyard_backend.dto;

import com.lumberyard_backend.entity.ProductionStatus;
import lombok.Data;

@Data
public class ProductionStatusRequest {
    private ProductionStatus status;
}
