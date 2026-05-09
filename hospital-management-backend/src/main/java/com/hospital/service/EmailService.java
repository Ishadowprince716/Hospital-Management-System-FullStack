package com.hospital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private JavaMailSender javaMailSender;

    @Autowired(required = false)
    public void setJavaMailSender(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendSimpleMessage(String to, String subject, String text) {
        if (javaMailSender == null) {
            // Mail sender not configured – log and skip silently for local dev
            System.out.println("[EmailService] Mail sender not configured. Skipping email to: " + to + " | Subject: " + subject);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@hospital-management.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        try {
            javaMailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the whole request
            e.printStackTrace();
        }
    }
}
