package com.hospital.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Value("${TWILIO_ACCOUNT_SID:}")
    private String accountSid;

    @Value("${TWILIO_AUTH_TOKEN:}")
    private String authToken;

    @Value("${TWILIO_PHONE_NUMBER:}")
    private String fromNumber;

    private boolean isEnabled = false;

    @PostConstruct
    public void init() {
        if (isValid(accountSid) && isValid(authToken) && isValid(fromNumber)) {
            try {
                Twilio.init(accountSid, authToken);
                isEnabled = true;
                logger.info("Twilio SMS Service initialized successfully.");
            } catch (Exception e) {
                logger.error("Failed to initialize Twilio SMS Service: " + e.getMessage());
                isEnabled = false;
            }
        } else {
            logger.warn("Twilio SMS Service is disabled. Missing configuration.");
        }
    }

    public boolean sendSms(String to, String messageBody) {
        if (!isEnabled) {
            logger.warn("Attempted to send SMS but service is disabled.");
            return false;
        }

        try {
            Message message = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromNumber),
                    messageBody)
                    .create();
            logger.info("SMS sent successfully: " + message.getSid());
            return true;
        } catch (Exception e) {
            logger.error("Error sending SMS to " + to + ": " + e.getMessage());
            return false;
        }
    }

    private boolean isValid(String value) {
        return value != null && !value.trim().isEmpty() && !value.contains("INSERT_YOUR");
    }
}
