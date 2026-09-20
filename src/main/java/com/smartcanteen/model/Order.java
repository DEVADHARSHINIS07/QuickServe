package com.smartcanteen.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Order {
    private Long id;
    private String orderId;
    private Long userId;
    private String studentId;
    private String studentName;
    private String studentMobile;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private String paymentMethod; // 'UPI', 'Cash'
    private String paymentStatus; // 'PAID', 'PENDING', 'REFUNDED'
    private String transactionId;
    private String requestedReadyDate;
    private String requestedReadyTime;
    private String priority; // 'HIGH', 'NORMAL'
    private String orderStatus; // 'Order Placed', 'Order Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Rejected', 'Cancelled'
    private String rejectionReason;
    private String refundStatus;
    private BigDecimal refundAmount;
    private String refundTransactionId;
    private String queueNumber;
    private Timestamp createdAt;
    private Timestamp acceptedAt;
    private Timestamp preparingAt;
    private Timestamp readyAt;
    private Timestamp completedAt;
    private Timestamp cancelledAt;
    private Timestamp updatedAt;

    private List<OrderItem> items = new ArrayList<>();

    public Order() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentMobile() { return studentMobile; }
    public void setStudentMobile(String studentMobile) { this.studentMobile = studentMobile; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getRequestedReadyDate() { return requestedReadyDate; }
    public void setRequestedReadyDate(String requestedReadyDate) { this.requestedReadyDate = requestedReadyDate; }

    public String getRequestedReadyTime() { return requestedReadyTime; }
    public void setRequestedReadyTime(String requestedReadyTime) { this.requestedReadyTime = requestedReadyTime; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getRefundStatus() { return refundStatus; }
    public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getRefundTransactionId() { return refundTransactionId; }
    public void setRefundTransactionId(String refundTransactionId) { this.refundTransactionId = refundTransactionId; }

    public String getQueueNumber() { return queueNumber; }
    public void setQueueNumber(String queueNumber) { this.queueNumber = queueNumber; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(Timestamp acceptedAt) { this.acceptedAt = acceptedAt; }

    public Timestamp getPreparingAt() { return preparingAt; }
    public void setPreparingAt(Timestamp preparingAt) { this.preparingAt = preparingAt; }

    public Timestamp getReadyAt() { return readyAt; }
    public void setReadyAt(Timestamp readyAt) { this.readyAt = readyAt; }

    public Timestamp getCompletedAt() { return completedAt; }
    public void setCompletedAt(Timestamp completedAt) { this.completedAt = completedAt; }

    public Timestamp getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Timestamp cancelledAt) { this.cancelledAt = cancelledAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
