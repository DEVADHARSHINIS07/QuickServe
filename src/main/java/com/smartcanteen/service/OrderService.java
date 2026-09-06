package com.smartcanteen.service;

import com.smartcanteen.dto.OrderDTOs.*;
import com.smartcanteen.exception.CustomExceptions.*;
import com.smartcanteen.model.*;
import com.smartcanteen.repository.*;
import com.smartcanteen.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Order createOrder(UserPrincipal currentUser, OrderCreateRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty when placing an order.");
        }

        User user = userRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Student user account not found."));

        // 1. Calculate Total Amount & Validate Stock
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String orderId = "SC" + datePrefix + String.format("%03d", (int)(Math.random() * 900 + 100));

        for (OrderItemRequest itemReq : req.getItems()) {
            FoodItem food = foodRepository.findByFoodId(itemReq.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found: " + itemReq.getFoodId()));

            if (food.getStockQuantity() < itemReq.getQuantity() || "OUT_OF_STOCK".equalsIgnoreCase(food.getAvailabilityStatus())) {
                throw new OutOfStockException("Insufficient stock for item '" + food.getName() + "'. Available: " + food.getStockQuantity());
            }

            BigDecimal itemTotal = food.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            // Deduct stock in DB
            int newStock = food.getStockQuantity() - itemReq.getQuantity();
            String newAvail = newStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
            foodRepository.updateStock(food.getFoodId(), newStock, newAvail);

            // Create Order Item record preserving historical price
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(orderId);
            orderItem.setFoodId(food.getFoodId());
            orderItem.setFoodName(food.getName());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(food.getPrice());
            orderItem.setTotalPrice(itemTotal);
            orderItem.setImageUrl(food.getImageUrl());
            orderItem.setVeg(food.isVeg());

            orderItems.add(orderItem);
        }

        // 2. Build Order Header
        Order order = new Order();
        order.setOrderId(orderId);
        order.setUserId(user.getId());
        order.setStudentId(user.getStudentId());
        order.setStudentName(user.getName());
        order.setStudentMobile(user.getMobile());
        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal);
        order.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "UPI");
        order.setPaymentStatus("UPI".equalsIgnoreCase(order.getPaymentMethod()) ? "PAID" : "PENDING");
        order.setTransactionId("UPI".equalsIgnoreCase(order.getPaymentMethod()) ? "TXN_" + System.currentTimeMillis() : null);
        order.setRequestedReadyDate(req.getRequestedReadyDate() != null ? req.getRequestedReadyDate() : "Today");
        order.setRequestedReadyTime(req.getRequestedReadyTime() != null ? req.getRequestedReadyTime() : "13:00");
        order.setPriority(req.getPriority() != null ? req.getPriority() : "NORMAL");
        order.setOrderStatus("Order Placed");
        order.setQueueNumber("A-" + (int)(Math.random() * 89 + 10));

        orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);
        order.setItems(orderItems);

        // 3. Send Notifications
        notificationService.createNotification(user.getStudentId(), "STUDENT", orderId,
                "Order Placed #" + orderId,
                "Your order for " + subtotal + " INR has been placed successfully. Slot: " + order.getRequestedReadyTime(),
                "order_placed");

        notificationService.createNotification("ADMIN", "ADMIN", orderId,
                "New Order Received #" + orderId,
                "Student " + user.getName() + " (" + user.getStudentId() + ") placed order #" + orderId + " (" + req.getPaymentMethod() + ")",
                "order_placed");

        emailService.sendOrderStatusEmail(user.getEmail(), user.getName(), orderId, "Order Placed", "Requested Pickup: " + order.getRequestedReadyTime());

        return order;
    }

    public List<Order> getStudentOrders(String studentId) {
        List<Order> orders = orderRepository.findByStudentId(studentId);
        for (Order o : orders) {
            o.setItems(orderItemRepository.findByOrderId(o.getOrderId()));
        }
        return orders;
    }

    public List<Order> getAllOrdersForAdmin() {
        List<Order> orders = orderRepository.findAllOrders();
        for (Order o : orders) {
            o.setItems(orderItemRepository.findByOrderId(o.getOrderId()));
        }
        return orders;
    }

    public Order getOrderDetails(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        order.setItems(orderItemRepository.findByOrderId(orderId));
        return order;
    }

    @Transactional
    public Order updateOrderStatus(String orderId, String newStatus, String rejectionReason) {
        Order order = getOrderDetails(orderId);
        String timestampCol = null;

        if ("Order Accepted".equalsIgnoreCase(newStatus)) timestampCol = "accepted_at";
        else if ("Preparing".equalsIgnoreCase(newStatus)) timestampCol = "preparing_at";
        else if ("Ready for Pickup".equalsIgnoreCase(newStatus)) timestampCol = "ready_at";
        else if ("Completed".equalsIgnoreCase(newStatus)) timestampCol = "completed_at";
        else if ("Rejected".equalsIgnoreCase(newStatus) || "Cancelled".equalsIgnoreCase(newStatus)) timestampCol = "cancelled_at";

        orderRepository.updateStatus(orderId, newStatus, timestampCol, rejectionReason);

        // If Rejected/Cancelled, auto refund if UPI
        if (("Rejected".equalsIgnoreCase(newStatus) || "Cancelled".equalsIgnoreCase(newStatus)) && "UPI".equalsIgnoreCase(order.getPaymentMethod())) {
            String refTx = "REFUND_" + System.currentTimeMillis();
            orderRepository.updateRefund(orderId, "COMPLETED", order.getTotalAmount(), refTx);

            notificationService.createNotification(order.getStudentId(), "STUDENT", orderId,
                    "Refund Initiated & Completed",
                    "INR " + order.getTotalAmount() + " refund processed for rejected order #" + orderId + ". Ref: " + refTx,
                    "refund");
        }

        // Notify Student
        notificationService.createNotification(order.getStudentId(), "STUDENT", orderId,
                "Order Status: " + newStatus,
                "Your order #" + orderId + " status changed to: " + newStatus + (rejectionReason != null ? " (" + rejectionReason + ")" : ""),
                "order_updated");

        User studentUser = userRepository.findByStudentId(order.getStudentId()).orElse(null);
        if (studentUser != null) {
            emailService.sendOrderStatusEmail(studentUser.getEmail(), studentUser.getName(), orderId, newStatus, rejectionReason);
        }

        return getOrderDetails(orderId);
    }
}
