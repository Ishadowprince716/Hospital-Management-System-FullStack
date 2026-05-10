package com.hospital.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hospital.dto.AppointmentDTO;
import com.hospital.mapper.AppointmentMapper;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.service.AppointmentService;
import com.hospital.config.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.http.MediaType;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AppointmentService appointmentService;

    @Mock
    private AppointmentMapper appointmentMapper;

    @Mock
    private JwtUtil jwtUtil;

    private Appointment mockAppointment;
    private AppointmentDTO mockAppointmentDTO;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc = MockMvcBuilders.standaloneSetup(new AppointmentController(
                appointmentService,
                appointmentMapper,
                jwtUtil))
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();

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
    public void testGetAppointmentById() throws Exception {
        when(appointmentService.getAppointmentById(1L)).thenReturn(mockAppointment);
        when(appointmentMapper.toDTO(mockAppointment)).thenReturn(mockAppointmentDTO);

        mockMvc.perform(get("/api/appointments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
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
