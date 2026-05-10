package com.hospital.dto;

public record UserDto(Long id,
                      String username,
                      String fullName,
                      String role) { }
