package com.smartcanteen.dto;

import java.math.BigDecimal;
import java.util.List;

public class OrderDTOs {

    public static class OrderItemRequest {
        private String foodId;
        private Integer quantity;

        public String getFoodId() { return foodId; }
        public void setFoodId(String foodId) { this.foodId = foodId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class OrderCreateRequest {
        private List<OrderItemRequest> items;
        private String paymentMethod; // 'UPI' or 'Cash'
        private String requestedReadyDate; // 'Today'
        private String requestedReadyTime; // '13:15'
        private String priority; // 'NORMAL' or 'HIGH'

        public List<OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderItemRequest> items) { this.items = items; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getRequestedReadyDate() { return requestedReadyDate; }
        public void setRequestedReadyDate(String requestedReadyDate) { this.requestedReadyDate = requestedReadyDate; }

        public String getRequestedReadyTime() { return requestedReadyTime; }
        public void setRequestedReadyTime(String requestedReadyTime) { this.requestedReadyTime = requestedReadyTime; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class RejectOrderRequest {
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
