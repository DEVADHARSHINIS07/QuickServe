package com.smartcanteen.controller;

import com.smartcanteen.dto.ApiResponse;
import com.smartcanteen.dto.DashboardResponse;
import com.smartcanteen.dto.FoodDTOs.FoodCreateUpdateRequest;
import com.smartcanteen.dto.OrderDTOs.RejectOrderRequest;
import com.smartcanteen.model.FoodItem;
import com.smartcanteen.model.Order;
import com.smartcanteen.service.FoodService;
import com.smartcanteen.service.OrderService;
import com.smartcanteen.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private FoodService foodService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @DeleteMapping("/users/all")
    public ResponseEntity<ApiResponse<String>> deleteAllUserData() {
        int resetTokensDeleted = jdbcTemplate.update("DELETE FROM password_reset_tokens");
        int usersDeleted = jdbcTemplate.update("DELETE FROM users WHERE role != 'ADMIN'");
        return ResponseEntity.ok(ApiResponse.ok("Registration data cleared. Deleted " + usersDeleted + " user records and " + resetTokensDeleted + " reset tokens."));
    }

    @DeleteMapping("/users/purge-everything")
    public ResponseEntity<ApiResponse<String>> purgeAllRegistrations() {
        int resetTokensDeleted = jdbcTemplate.update("DELETE FROM password_reset_tokens");
        int usersDeleted = jdbcTemplate.update("DELETE FROM users");
        return ResponseEntity.ok(ApiResponse.ok("All registrations purged completely: " + usersDeleted + " records removed."));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics fetched", reportService.getDashboardMetrics()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok("All canteen orders fetched", orderService.getAllOrdersForAdmin()));
    }

    @PutMapping("/orders/{orderId}/accept")
    public ResponseEntity<ApiResponse<Order>> acceptOrder(@PathVariable String orderId) {
        Order updated = orderService.updateOrderStatus(orderId, "Order Accepted", null);
        return ResponseEntity.ok(ApiResponse.ok("Order accepted", updated));
    }

    @PutMapping("/orders/{orderId}/preparing")
    public ResponseEntity<ApiResponse<Order>> startPreparing(@PathVariable String orderId) {
        Order updated = orderService.updateOrderStatus(orderId, "Preparing", null);
        return ResponseEntity.ok(ApiResponse.ok("Order marked as preparing", updated));
    }

    @PutMapping("/orders/{orderId}/ready")
    public ResponseEntity<ApiResponse<Order>> markReady(@PathVariable String orderId) {
        Order updated = orderService.updateOrderStatus(orderId, "Ready for Pickup", null);
        return ResponseEntity.ok(ApiResponse.ok("Order marked as ready for pickup", updated));
    }

    @PutMapping("/orders/{orderId}/complete")
    public ResponseEntity<ApiResponse<Order>> completeOrder(@PathVariable String orderId) {
        Order updated = orderService.updateOrderStatus(orderId, "Completed", null);
        return ResponseEntity.ok(ApiResponse.ok("Order marked as completed", updated));
    }

    @PutMapping("/orders/{orderId}/reject")
    public ResponseEntity<ApiResponse<Order>> rejectOrder(@PathVariable String orderId, @RequestBody(required = false) RejectOrderRequest req) {
        String reason = (req != null && req.getReason() != null) ? req.getReason() : "Item unavailable in kitchen";
        Order updated = orderService.updateOrderStatus(orderId, "Rejected", reason);
        return ResponseEntity.ok(ApiResponse.ok("Order rejected", updated));
    }

    @PostMapping("/foods")
    public ResponseEntity<ApiResponse<FoodItem>> addFood(@Valid @RequestBody FoodCreateUpdateRequest req) {
        FoodItem food = foodService.createFood(req);
        return ResponseEntity.ok(ApiResponse.ok("New food item created", food));
    }

    @PutMapping("/foods/{foodId}")
    public ResponseEntity<ApiResponse<FoodItem>> updateFood(@PathVariable String foodId, @RequestBody FoodCreateUpdateRequest req) {
        FoodItem updated = foodService.updateFood(foodId, req);
        return ResponseEntity.ok(ApiResponse.ok("Food item updated", updated));
    }

    @DeleteMapping("/foods/{foodId}")
    public ResponseEntity<ApiResponse<Void>> deleteFood(@PathVariable String foodId) {
        foodService.deleteFood(foodId);
        return ResponseEntity.ok(ApiResponse.ok("Food item deleted from menu"));
    }
}
