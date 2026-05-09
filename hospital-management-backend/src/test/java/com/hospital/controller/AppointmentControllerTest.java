package com.hospital.controller;

import com.hospital.dto.AppointmentDTO;
import com.hospital.mapper.AppointmentMapper;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.service.AppointmentService;
import com.hospital.config.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private AppointmentMapper appointmentMapper;

    @MockBean
    private JwtUtil jwtUtil;

    private Appointment mockAppointment;
    private AppointmentDTO mockAppointmentDTO;

    @BeforeEach
    void setUp() {
        Patient patient = new Patient();
        patient.setId(1L);
        patient.setFullName("John Patient");

        Doctor doctor = new Doctor();
        doctor.setId(1L);
        doctor.setFullName("Dr. Smith");

        mockAppointment = new Appointment();
        mockAppointment.setId(1L);
        mockAppointment.setPatient(patient);
        mockAppointment.setDoctor(doctor);
        mockAppointment.setAppointmentDate(LocalDate.now());
        mockAppointment.setAppointmentTime(LocalTime.now());
        mockAppointment.setStatus("SCHEDULED");

        mockAppointmentDTO = new AppointmentDTO();
        mockAppointmentDTO.setId(1L);
        mockAppointmentDTO.setPatientId(1L);
        mockAppointmentDTO.setDoctorId(1L);
        mockAppointmentDTO.setPatientName("John Patient");
        mockAppointmentDTO.setDoctorName("Dr. Smith");
        mockAppointmentDTO.setAppointmentDate(LocalDate.now());
        mockAppointmentDTO.setAppointmentTime(LocalTime.now());
        mockAppointmentDTO.setStatus("SCHEDULED");
    }

    @Test
    @WithMockUser
    public void testBookAppointment() throws Exception {
        when(appointmentService.bookAppointment(anyLong(), anyLong(), any(), any(), anyString(), anyString()))
                .thenReturn(mockAppointment);
        when(appointmentMapper.toDTO(any(Appointment.class))).thenReturn(mockAppointmentDTO);

        String jsonRequest = """
                {
                    "patientId": 1,
                    "doctorId": 1,
                    "date": "2024-12-30",
                    "time": "10:00:00",
                    "reason": "Checkup",
                    "type": "CONSULTATION"
                }
                """;

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.message").value("Appointment booked successfully"));
    }

    @Test
    @WithMockUser
    public void testGetAppointmentById() throws Exception {
        when(appointmentService.getAppointmentById(1L)).thenReturn(mockAppointment);
        when(appointmentMapper.toDTO(mockAppointment)).thenReturn(mockAppointmentDTO);

        mockMvc.perform(get("/api/appointments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser
    public void testGetPatientAppointments() throws Exception {
        java.util.List<Appointment> list = new java.util.ArrayList<>();
        list.add(mockAppointment);
        org.springframework.data.domain.Page<Appointment> page = new org.springframework.data.domain.PageImpl<>(list);
        when(appointmentService.getPatientAppointments(eq(1L), any())).thenReturn(page);
        when(appointmentMapper.toDTO(any(Appointment.class))).thenReturn(mockAppointmentDTO);

        mockMvc.perform(get("/api/appointments/patient/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(1));
    }

    @Test
    @WithMockUser
    public void testCancelAppointment() throws Exception {
        mockAppointment.setStatus("CANCELLED");
        mockAppointmentDTO.setStatus("CANCELLED");
        
        when(appointmentService.cancelAppointment(1L)).thenReturn(mockAppointment);
        when(appointmentMapper.toDTO(mockAppointment)).thenReturn(mockAppointmentDTO);

        mockMvc.perform(patch("/api/appointments/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @WithMockUser
    public void testUpdateAppointmentStatus() throws Exception {
        mockAppointment.setStatus("COMPLETED");
        mockAppointmentDTO.setStatus("COMPLETED");

        when(appointmentService.updateAppointmentStatus(eq(1L), eq("COMPLETED"))).thenReturn(mockAppointment);
        when(appointmentMapper.toDTO(mockAppointment)).thenReturn(mockAppointmentDTO);

        mockMvc.perform(patch("/api/appointments/1/status")
                .param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }
}
