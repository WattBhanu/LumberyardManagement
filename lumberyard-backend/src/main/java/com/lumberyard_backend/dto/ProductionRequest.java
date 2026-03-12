package com.lumberyard_backend.dto;

public class ProductionRequest {
    private String timberCode;
    private String processType;
    private double amount;

    public String getTimberCode() {
        return timberCode;
    }

    public void setTimberCode(String timberCode) {
        this.timberCode = timberCode;
    }

    public String getProcessType() {
        return processType;
    }

    public void setProcessType(String processType) {
        this.processType = processType;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}
