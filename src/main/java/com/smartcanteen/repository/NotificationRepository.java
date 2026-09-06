package com.smartcanteen.repository;

import com.smartcanteen.model.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class NotificationRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Notification> notificationRowMapper = (rs, rowNum) -> {
        Notification n = new Notification();
        n.setId(rs.getLong("id"));
        n.setNotificationId(rs.getString("notification_id"));
        n.setRecipientUserId(rs.getString("recipient_user_id"));
        n.setRecipientRole(rs.getString("recipient_role"));
        n.setOrderId(rs.getString("order_id"));
        n.setTitle(rs.getString("title"));
        n.setMessage(rs.getString("message"));
        n.setNotificationType(rs.getString("notification_type"));
        n.setReadStatus(rs.getBoolean("read_status"));
        n.setCreatedAt(rs.getTimestamp("created_at"));
        return n;
    };

    public List<Notification> findByRecipient(String recipientUserId) {
        String sql = "SELECT * FROM notifications WHERE UPPER(recipient_user_id) = UPPER(?) OR recipient_user_id = 'ADMIN' ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, notificationRowMapper, recipientUserId.trim());
    }

    public List<Notification> findUnreadByRecipient(String recipientUserId) {
        String sql = "SELECT * FROM notifications WHERE (UPPER(recipient_user_id) = UPPER(?) OR recipient_user_id = 'ADMIN') AND read_status = FALSE ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, notificationRowMapper, recipientUserId.trim());
    }

    public int save(Notification notification) {
        String sql = "INSERT INTO notifications (notification_id, recipient_user_id, recipient_role, order_id, title, message, notification_type, read_status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                notification.getNotificationId(),
                notification.getRecipientUserId(),
                notification.getRecipientRole(),
                notification.getOrderId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getNotificationType(),
                notification.isReadStatus()
        );
    }

    public int markAsRead(String notificationId, String recipientUserId) {
        String sql = "UPDATE notifications SET read_status = TRUE WHERE notification_id = ? AND (UPPER(recipient_user_id) = UPPER(?) OR recipient_user_id = 'ADMIN')";
        return jdbcTemplate.update(sql, notificationId, recipientUserId.trim());
    }

    public int markAllAsRead(String recipientUserId) {
        String sql = "UPDATE notifications SET read_status = TRUE WHERE UPPER(recipient_user_id) = UPPER(?) OR recipient_user_id = 'ADMIN'";
        return jdbcTemplate.update(sql, recipientUserId.trim());
    }

    public int deleteById(String notificationId, String recipientUserId) {
        String sql = "DELETE FROM notifications WHERE notification_id = ? AND (UPPER(recipient_user_id) = UPPER(?) OR recipient_user_id = 'ADMIN')";
        return jdbcTemplate.update(sql, notificationId, recipientUserId.trim());
    }
}
