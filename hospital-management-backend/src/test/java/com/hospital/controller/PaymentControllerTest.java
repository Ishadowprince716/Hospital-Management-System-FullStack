package com.hospital.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hospital.model.Bill;
import com.hospital.service.BillService;
import com.hospital.service.StripeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class PaymentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BillService billService;

    @Mock
    private StripeService stripeService;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc = MockMvcBuilders.standaloneSetup(new PaymentController(billService, stripeService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    public void testCreatePaymentIntent_BillNotFound() throws Exception {
        when(billService.getBillById(anyLong())).thenThrow(new RuntimeException("Bill not found"));

        String jsonRequest = "{\"billId\": 999, \"amount\": 1000, \"description\": \"Test\"}";

        mockMvc.perform(post("/api/payments/create-intent")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Bill not found")));
    }

    @Test
    public void testConfirmPayment_Success() throws Exception {
        Bill mockBill = new Bill();
        mockBill.setId(1L);
        mockBill.setStatus("PAID");
        mockBill.setAmount(100.0);

        when(billService.recordPayment(eq(1L), any(), anyString(), anyString())).thenReturn(mockBill);

        mockMvc.perform(post("/api/payments/confirm/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Payment confirmed successfully"))
                .andExpect(jsonPath("$.data.status").value("PAID"));
    }
}
