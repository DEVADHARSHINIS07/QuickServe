package com.smartcanteen.repository;

import com.smartcanteen.model.PasswordResetToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class PasswordResetTokenRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<PasswordResetToken> tokenRowMapper = (rs, rowNum) -> {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(rs.getLong("id"));
        token.setUserId(rs.getLong("user_id"));
        token.setTokenHash(rs.getString("token_hash"));
        token.setExpiresAt(rs.getTimestamp("expires_at"));
        token.setUsed(rs.getBoolean("used"));
        token.setCreatedAt(rs.getTimestamp("created_at"));
        return token;
    };

    public int save(PasswordResetToken resetToken) {
        String sql = "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                resetToken.getUserId(),
                resetToken.getTokenHash(),
                resetToken.getExpiresAt(),
                resetToken.isUsed()
        );
    }

    public Optional<PasswordResetToken> findByTokenHash(String tokenHash) {
        String sql = "SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used = FALSE AND expires_at > CURRENT_TIMESTAMP";
        List<PasswordResetToken> list = jdbcTemplate.query(sql, tokenRowMapper, tokenHash);
        return list.stream().findFirst();
    }

    public int markAsUsed(Long tokenId) {
        String sql = "UPDATE password_reset_tokens SET used = TRUE WHERE id = ?";
        return jdbcTemplate.update(sql, tokenId);
    }
}
