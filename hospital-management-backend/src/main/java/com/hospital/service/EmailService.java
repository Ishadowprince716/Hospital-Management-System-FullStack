package com.hospital.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private JavaMailSender javaMailSender;

    @Autowired(required = false)
    public void setJavaMailSender(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @CircuitBreaker(name = "emailService", fallbackMethod = "sendSimpleMessageFallback")
    public void sendSimpleMessage(String to, String subject, String text) {
        if (javaMailSender == null) {
            logger.info("[EmailService] Mail sender not configured. Skipping email to: {} | Subject: {}", to, subject);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@hospital-management.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        javaMailSender.send(message);
    }

    public void sendSimpleMessageFallback(String to, String subject, String text, Throwable t) {
        logger.error("[CircuitBreaker] EmailService is open/failed. Skipping email to: {}. Reason: {}", to, t.getMessage());
    }
}
