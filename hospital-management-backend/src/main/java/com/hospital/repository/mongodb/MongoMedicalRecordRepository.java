package com.hospital.repository.mongodb;

import com.hospital.document.MongoMedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MongoMedicalRecordRepository extends MongoRepository<MongoMedicalRecord, String> {
    List<MongoMedicalRecord> findByPatientId(Long patientId);
}
