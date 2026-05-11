package com.hospital.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/login",
            "/register",
            "/patient",
            "/patient/**",
            "/doctor",
            "/doctor/**",
            "/admin",
            "/admin/**",
            "/telehealth",
            "/telehealth/**"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
