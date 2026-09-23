package com.smartcanteen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("backend", "Spring Boot (Port 8080)");

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            status.put("database", "CONNECTED");
            status.put("dbProductName", metaData.getDatabaseProductName());
            status.put("dbProductVersion", metaData.getDatabaseProductVersion());
            status.put("jdbcUrl", metaData.getURL());
            status.put("dbUser", metaData.getUserName());

            String activeDb = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
            status.put("activeDatabaseName", activeDb);

            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            status.put("userCount", userCount);

            List<Map<String, Object>> users = jdbcTemplate.queryForList(
                "SELECT id, user_id, student_id, name, email, role, created_at FROM users LIMIT 10"
            );
            status.put("registeredUsers", users);

            List<String> tables = jdbcTemplate.queryForList("SHOW TABLES", String.class);
            status.put("tablesInDatabase", tables);

            status.put("message", "Spring Boot is connected to " + metaData.getDatabaseProductName() + " at " + metaData.getURL());
        } catch (Exception e) {
            status.put("database", "DISCONNECTED");
            status.put("error", e.getMessage());
            status.put("cause", e.getCause() != null ? e.getCause().getMessage() : "Unknown");
            status.put("hint", "Check spring.datasource.password and spring.datasource.username in src/main/resources/application.properties");
        }

        return ResponseEntity.ok(status);
    }

    @org.springframework.web.bind.annotation.PostMapping("/clear-users")
    @GetMapping("/clear-users")
    public ResponseEntity<Map<String, Object>> clearAllUsersDirectly() {
        Map<String, Object> res = new HashMap<>();
        try {
            int resetTokens = jdbcTemplate.update("DELETE FROM password_reset_tokens");
            int deletedUsers = jdbcTemplate.update("DELETE FROM users WHERE role != 'ADMIN'");
            res.put("success", true);
            res.put("message", "Cleared " + deletedUsers + " student/registration records and " + resetTokens + " reset tokens.");
            res.put("remainingUsers", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class));
        } catch (Exception e) {
            res.put("success", false);
            res.put("error", e.getMessage());
        }
        return ResponseEntity.ok(res);
    }

    @org.springframework.web.bind.annotation.PostMapping("/purge-all-users")
    @GetMapping("/purge-all-users")
    public ResponseEntity<Map<String, Object>> purgeAllUsers() {
        Map<String, Object> res = new HashMap<>();
        try {
            jdbcTemplate.update("DELETE FROM password_reset_tokens");
            int deleted = jdbcTemplate.update("DELETE FROM users");
            res.put("success", true);
            res.put("message", "All user accounts purged: " + deleted + " records deleted.");
            res.put("remainingUsers", 0);
        } catch (Exception e) {
            res.put("success", false);
            res.put("error", e.getMessage());
        }
        return ResponseEntity.ok(res);
    }
}
