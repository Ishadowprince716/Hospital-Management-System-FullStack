package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.model.User;
import com.hospital.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(searchService.searchUsers(q)));
    }

    @PostMapping("/reindex")
    public ResponseEntity<ApiResponse<String>> reindex() {
        try {
            searchService.reindex();
            return ResponseEntity.ok(ApiResponse.success("Reindexing successful"));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.internalServerError().body(ApiResponse.error("Reindexing failed: " + e.getMessage()));
        }
    }
}
