package com.hospital.mapper;

import com.hospital.dto.AppointmentDTO;
import com.hospital.model.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(source = "doctor.id", target = "doctorId")
    @Mapping(source = "patient.fullName", target = "patientName")
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
}
