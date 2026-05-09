package com.hospital.config;

import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.hospital.model.AuditRevisionEntity;

public class AuditRevisionListener implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        AuditRevisionEntity auditEntity = (AuditRevisionEntity) revisionEntity;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated()) {
            auditEntity.setModifiedBy(auth.getName());
        } else {
            auditEntity.setModifiedBy("SYSTEM");
        }
    }
}
