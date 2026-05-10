package com.hospital.service;

import com.hospital.model.User;
import jakarta.persistence.EntityManager;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SearchService {

    private final EntityManager entityManager;

    public SearchService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public List<User> searchUsers(String query) {
        SearchSession searchSession = Search.session(entityManager.unwrap(org.hibernate.Session.class));

        return searchSession.search(User.class)
                .where(f -> f.match()
                        .fields("fullName", "username", "email", "phoneNumber")
                        .matching(query)
                        .fuzzy(2)) // Allows for typos
                .fetchHits(20);
    }

    /**
     * Initializes the Lucene index. 
     * In a production environment, this would be part of a startup or migration task.
     */
    public void reindex() throws InterruptedException {
        SearchSession searchSession = Search.session(entityManager.unwrap(org.hibernate.Session.class));
        searchSession.massIndexer().startAndWait();
    }
}
