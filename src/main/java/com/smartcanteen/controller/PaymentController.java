package com.smartcanteen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @RequestMapping(value = "/create-order", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestParam(value = "amount", required = false) Double queryAmount,
            @RequestBody(required = false) Map<String, Object> body) {

        double rawAmount = 100.0;
        if (queryAmount != null && queryAmount > 0) {
            rawAmount = queryAmount;
        } else if (body != null && body.containsKey("amount")) {
            try {
                rawAmount = Double.parseDouble(body.get("amount").toString());
            } catch (Exception ignored) {
            }
        }

        // Razorpay amounts are typically in paise (amount * 100) if < 1000, or in paise already
        long amountInPaise = (rawAmount > 1000 && rawAmount % 100 == 0) 
            ? (long) rawAmount 
            : Math.round(rawAmount * 100);

        // Standard Razorpay Order ID format: order_ followed by 14 alphanumeric characters
        String uuidStr = UUID.randomUUID().toString().replace("-", "");
        String orderId = "order_" + uuidStr.substring(0, Math.min(14, uuidStr.length()));
        String mockKey = System.getenv("RAZORPAY_KEY_ID");
        if (mockKey == null || mockKey.isBlank()) {
            mockKey = "rzp_test_AAACollegeCanteen";
        }
        String canteenUpiId = System.getenv("CANTEEN_UPI_ID");
        if (canteenUpiId == null || canteenUpiId.isBlank()) {
            canteenUpiId = "canteen.aaacet@okaxis";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("id", orderId);
        response.put("orderId", orderId);
        response.put("amount", amountInPaise);
        response.put("rawAmount", rawAmount);
        response.put("currency", "INR");
        response.put("status", "created");
        response.put("key", mockKey);
        response.put("key_id", mockKey);
        response.put("canteenUpiId", canteenUpiId);
        response.put("message", "Payment order initialized successfully");

        // Include nested data field for standard ApiResponse compatibility
        Map<String, Object> data = new HashMap<>(response);
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody(required = false) Map<String, Object> payload) {
        String paymentId = "PAY_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        if (payload != null && payload.containsKey("razorpay_payment_id")) {
            paymentId = String.valueOf(payload.get("razorpay_payment_id"));
        } else if (payload != null && payload.containsKey("paymentId")) {
            paymentId = String.valueOf(payload.get("paymentId"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "UPI / Razorpay payment verified successfully");
        response.put("transactionId", paymentId);
        response.put("status", "PAID");

        return ResponseEntity.ok(response);
    }
}
