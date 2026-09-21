package com.smartcanteen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("backend", "Spring Boot (Port 8080)");

        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            status.put("database", "CONNECTED");
            status.put("mysqlStatus", "OK (SELECT 1 returned " + result + ")");
            status.put("userCountInMySQL", userCount);
            status.put("message", "Spring Boot is successfully connected to MySQL database 'smart_canteen'!");
        } catch (Exception e) {
            status.put("database", "DISCONNECTED");
            status.put("error", e.getMessage());
            status.put("cause", e.getCause() != null ? e.getCause().getMessage() : "Unknown");
            status.put("hint", "Check spring.datasource.password and spring.datasource.username in src/main/resources/application.properties");
        }

        return ResponseEntity.ok(status);
    }
}
