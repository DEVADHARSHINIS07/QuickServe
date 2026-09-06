package com.smartcanteen.controller;

import com.smartcanteen.dto.ApiResponse;
import com.smartcanteen.dto.OrderDTOs.*;
import com.smartcanteen.model.Order;
import com.smartcanteen.security.UserPrincipal;
import com.smartcanteen.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> placeOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OrderCreateRequest req) {
        Order order = orderService.createOrder(currentUser, req);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully", order));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<Order>>> getMyOrders(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Order> orders = orderService.getStudentOrders(currentUser.getStudentId());
        return ResponseEntity.ok(ApiResponse.ok("Order history fetched", orders));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Order>> getOrderDetails(@PathVariable String orderId) {
        Order order = orderService.getOrderDetails(orderId);
        return ResponseEntity.ok(ApiResponse.ok("Order details fetched", order));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<Order>> cancelOrder(
            @PathVariable String orderId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Order updated = orderService.updateOrderStatus(orderId, "Cancelled", "Cancelled by student");
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully", updated));
    }
}
