package com.hospital.controller;

import com.hospital.config.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TelehealthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("ICE config endpoint should require authentication")
    void iceConfigShouldRequireAuth() throws Exception {
        mockMvc.perform(get("/api/telehealth/ice-config"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Authenticated user should receive ICE server configuration")
    void iceConfigShouldReturnServersForAuthenticatedUser() throws Exception {
        String token = jwtUtil.generateToken("telehealth_test_doctor", "DOCTOR", 1001L);

        mockMvc.perform(get("/api/telehealth/ice-config")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.iceServers").isArray())
                .andExpect(jsonPath("$.data.turnConfigured").exists());
    }
}
