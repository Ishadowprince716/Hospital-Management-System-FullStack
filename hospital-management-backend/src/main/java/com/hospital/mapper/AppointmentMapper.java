package com.hospital.mapper;

import com.hospital.dto.AppointmentDTO;
import com.hospital.model.Appointment;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AppointmentMapper {

    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "patient.fullName", target = "patientName")
    @Mapping(source = "patient.phoneNumber", target = "patientPhoneNumber")
    @Mapping(source = "doctor.fullName", target = "doctorName")
    @Mapping(source = "doctor.specialization", target = "doctorSpecialization")
    @Mapping(target = "patientAge", expression = "java(calculateAge(appointment.getPatient()))")
    @Mapping(source = "patient.gender", target = "patientGender")
    AppointmentDTO toDTO(Appointment appointment);

    default Integer calculateAge(com.hospital.model.Patient patient) {
        if (patient == null || patient.getDateOfBirth() == null) {
            return null;
        }
        return java.time.Period.between(patient.getDateOfBirth(), java.time.LocalDate.now()).getYears();
    }

    @Mapping(target = "patient", ignore = true) // Requires manual handling or separate service lookup
    @Mapping(target = "doctor", ignore = true)
    Appointment toEntity(AppointmentDTO appointmentDTO);

    @AfterMapping
    default void applyDisplayFallbacks(Appointment appointment, @MappingTarget AppointmentDTO dto) {
        if (appointment == null) {
            return;
        }

        if (isBlank(dto.getPatientName()) && appointment.getPatient() != null) {
            dto.setPatientName(firstNonBlank(appointment.getPatient().getFullName(), appointment.getPatient().getUsername()));
        }

        if (isBlank(dto.getDoctorName()) && appointment.getDoctor() != null) {
            dto.setDoctorName(firstNonBlank(appointment.getDoctor().getFullName(), appointment.getDoctor().getUsername()));
        }

        if (dto.getConsultationFee() == null && appointment.getDoctor() != null) {
            dto.setConsultationFee(appointment.getDoctor().getConsultationFee());
        }
    }

    default String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (!isBlank(value)) {
                return value.trim();
            }
        }
        return null;
    }

    default boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
