package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.Bill;
import com.hospital.service.BillService;
import com.hospital.service.StripeService;
import com.stripe.model.PaymentIntent;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BillService billService;

    @MockBean
    private StripeService stripeService;

    @Test
    @WithMockUser
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
    @WithMockUser
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
