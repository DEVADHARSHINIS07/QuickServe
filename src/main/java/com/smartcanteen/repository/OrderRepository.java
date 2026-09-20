package com.smartcanteen.repository;

import com.smartcanteen.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class OrderRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Order> orderRowMapper = (rs, rowNum) -> {
        Order order = new Order();
        order.setId(rs.getLong("id"));
        order.setOrderId(rs.getString("order_id"));
        order.setUserId(rs.getLong("user_id"));
        order.setStudentId(rs.getString("student_id"));
        order.setStudentName(rs.getString("student_name"));
        order.setStudentMobile(rs.getString("student_mobile"));
        order.setSubtotal(rs.getBigDecimal("subtotal"));
        order.setTotalAmount(rs.getBigDecimal("total_amount"));
        order.setPaymentMethod(rs.getString("payment_method"));
        order.setPaymentStatus(rs.getString("payment_status"));
        order.setTransactionId(rs.getString("transaction_id"));
        order.setRequestedReadyDate(rs.getString("requested_ready_date"));
        order.setRequestedReadyTime(rs.getString("requested_ready_time"));
        order.setPriority(rs.getString("priority"));
        order.setOrderStatus(rs.getString("order_status"));
        order.setRejectionReason(rs.getString("rejection_reason"));
        order.setRefundStatus(rs.getString("refund_status"));
        order.setRefundAmount(rs.getBigDecimal("refund_amount"));
        order.setRefundTransactionId(rs.getString("refund_transaction_id"));
        order.setQueueNumber(rs.getString("queue_number"));
        order.setCreatedAt(rs.getTimestamp("created_at"));
        order.setAcceptedAt(rs.getTimestamp("accepted_at"));
        order.setPreparingAt(rs.getTimestamp("preparing_at"));
        order.setReadyAt(rs.getTimestamp("ready_at"));
        order.setCompletedAt(rs.getTimestamp("completed_at"));
        order.setCancelledAt(rs.getTimestamp("cancelled_at"));
        order.setUpdatedAt(rs.getTimestamp("updated_at"));
        return order;
    };

    public Optional<Order> findByOrderId(String orderId) {
        String sql = "SELECT * FROM orders WHERE order_id = ?";
        List<Order> list = jdbcTemplate.query(sql, orderRowMapper, orderId);
        return list.stream().findFirst();
    }

    public List<Order> findByStudentId(String studentId) {
        String sql = "SELECT * FROM orders WHERE UPPER(student_id) = UPPER(?) ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, orderRowMapper, studentId.trim());
    }

    public List<Order> findAllOrders() {
        String sql = "SELECT * FROM orders ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, orderRowMapper);
    }

    public List<Order> findTodayOrders() {
        String sql = "SELECT * FROM orders WHERE DATE(created_at) = CURRENT_DATE() ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, orderRowMapper);
    }

    public int save(Order order) {
        String sql = "INSERT INTO orders (order_id, user_id, student_id, student_name, student_mobile, subtotal, total_amount, " +
                     "payment_method, payment_status, transaction_id, requested_ready_date, requested_ready_time, priority, " +
                     "order_status, queue_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                order.getOrderId(),
                order.getUserId(),
                order.getStudentId(),
                order.getStudentName(),
                order.getStudentMobile(),
                order.getSubtotal(),
                order.getTotalAmount(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getTransactionId(),
                order.getRequestedReadyDate(),
                order.getRequestedReadyTime(),
                order.getPriority(),
                order.getOrderStatus(),
                order.getQueueNumber()
        );
    }

    public int updateStatus(String orderId, String newStatus, String timestampColumn, String rejectionReason) {
        String sql = "UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP";
        if (timestampColumn != null) {
            sql += ", " + timestampColumn + " = CURRENT_TIMESTAMP";
        }
        if (rejectionReason != null) {
            sql += ", rejection_reason = ?";
            sql += " WHERE order_id = ?";
            return jdbcTemplate.update(sql, newStatus, rejectionReason, orderId);
        } else {
            sql += " WHERE order_id = ?";
            return jdbcTemplate.update(sql, newStatus, orderId);
        }
    }

    public int updateRefund(String orderId, String refundStatus, BigDecimal amount, String refundTxId) {
        String sql = "UPDATE orders SET refund_status = ?, refund_amount = ?, refund_transaction_id = ?, payment_status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?";
        return jdbcTemplate.update(sql, refundStatus, amount, refundTxId, orderId);
    }

    public int updatePayment(String orderId, String paymentStatus, String transactionId, String paymentMethod, String orderStatus) {
        String sql = "UPDATE orders SET payment_status = ?, transaction_id = ?, payment_method = ?, order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?";
        return jdbcTemplate.update(sql, paymentStatus, transactionId, paymentMethod, orderStatus, orderId);
    }

    public BigDecimal getTodayTotalRevenue() {
        String sql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE() AND order_status != 'Rejected' AND order_status != 'Cancelled'";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class);
    }

    public BigDecimal getTodayUpiRevenue() {
        String sql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE() AND payment_method = 'UPI' AND order_status != 'Rejected' AND order_status != 'Cancelled'";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class);
    }

    public BigDecimal getTodayCashRevenue() {
        String sql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE() AND payment_method = 'Cash' AND order_status != 'Rejected' AND order_status != 'Cancelled'";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class);
    }

    public int getTodayOrdersCount() {
        String sql = "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE()";
        Integer cnt = jdbcTemplate.queryForObject(sql, Integer.class);
        return cnt != null ? cnt : 0;
    }

    public int getStatusCount(String status) {
        String sql = "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE() AND order_status = ?";
        Integer cnt = jdbcTemplate.queryForObject(sql, Integer.class, status);
        return cnt != null ? cnt : 0;
    }
}
