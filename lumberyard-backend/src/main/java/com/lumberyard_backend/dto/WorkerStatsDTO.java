package com.lumberyard_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkerStatsDTO {
    @JsonProperty("totalWorkers")
    private long totalWorkers;
    
    @JsonProperty("activeWorkers")
    private long activeWorkers;
    
    @JsonProperty("inactiveWorkers")
    private long inactiveWorkers;
}
