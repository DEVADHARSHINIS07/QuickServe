package com.smartcanteen.repository;

import com.smartcanteen.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUserId(rs.getString("user_id"));
        user.setStudentId(rs.getString("student_id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        user.setMobile(rs.getString("mobile"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setRole(rs.getString("role"));
        user.setAccountStatus(rs.getString("account_status"));
        user.setEmailVerified(rs.getBoolean("email_verified"));
        user.setCreatedAt(rs.getTimestamp("created_at"));
        user.setUpdatedAt(rs.getTimestamp("updated_at"));
        return user;
    };

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email.trim());
        return count != null && count > 0;
    }

    public boolean existsByStudentId(String studentId) {
        String sql = "SELECT COUNT(*) FROM users WHERE UPPER(student_id) = UPPER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, studentId.trim());
        return count != null && count > 0;
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";
        List<User> users = jdbcTemplate.query(sql, userRowMapper, email.trim());
        return users.stream().findFirst();
    }

    public Optional<User> findByStudentId(String studentId) {
        String sql = "SELECT * FROM users WHERE UPPER(student_id) = UPPER(?)";
        List<User> users = jdbcTemplate.query(sql, userRowMapper, studentId.trim());
        return users.stream().findFirst();
    }

    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        List<User> users = jdbcTemplate.query(sql, userRowMapper, id);
        return users.stream().findFirst();
    }

    public int save(User user) {
        String sql = "INSERT INTO users (user_id, student_id, name, email, mobile, password_hash, role, account_status, email_verified) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                user.getUserId(),
                user.getStudentId(),
                user.getName(),
                user.getEmail().toLowerCase().trim(),
                user.getMobile(),
                user.getPasswordHash(),
                user.getRole(),
                user.getAccountStatus() != null ? user.getAccountStatus() : "ACTIVE",
                user.isEmailVerified()
        );
    }

    public int updatePassword(Long userId, String newPasswordHash) {
        String sql = "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, newPasswordHash, userId);
    }
}
