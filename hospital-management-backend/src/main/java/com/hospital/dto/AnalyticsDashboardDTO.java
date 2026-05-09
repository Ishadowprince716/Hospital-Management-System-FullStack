package com.hospital.dto;

import java.util.Map;

public class AnalyticsDashboardDTO {
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private double totalRevenue;

    // For Charts
    private Map<String, Long> appointmentsByStatus;
    private Map<String, Long> appointmentsByMonth;
    private Map<String, Double> revenueByMonth;
    private Map<String, Double> revenueByDepartment;
    private Map<String, Long> patientAgeDistribution;

    // Constructors
    public AnalyticsDashboardDTO() {
    }

    // Getters and Setters
    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Map<String, Long> getAppointmentsByStatus() {
        return appointmentsByStatus;
    }

    public void setAppointmentsByStatus(Map<String, Long> appointmentsByStatus) {
        this.appointmentsByStatus = appointmentsByStatus;
    }

    public Map<String, Long> getAppointmentsByMonth() {
        return appointmentsByMonth;
    }

    public void setAppointmentsByMonth(Map<String, Long> appointmentsByMonth) {
        this.appointmentsByMonth = appointmentsByMonth;
    }

    public Map<String, Double> getRevenueByMonth() {
        return revenueByMonth;
    }

    public void setRevenueByMonth(Map<String, Double> revenueByMonth) {
        this.revenueByMonth = revenueByMonth;
    }

    public Map<String, Double> getRevenueByDepartment() {
        return revenueByDepartment;
    }

    public void setRevenueByDepartment(Map<String, Double> revenueByDepartment) {
        this.revenueByDepartment = revenueByDepartment;
    }

    public Map<String, Long> getPatientAgeDistribution() {
        return patientAgeDistribution;
    }

    public void setPatientAgeDistribution(Map<String, Long> patientAgeDistribution) {
        this.patientAgeDistribution = patientAgeDistribution;
    }
}
