package com.smartcanteen.controller;

import com.smartcanteen.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // ============================================================
    // TEST PAYMENT CONTROLLER
    // ============================================================

    @GetMapping("/test")
    public String testPayment() {
        return "Payment Controller Working";
    }

    // ============================================================
    // CREATE RAZORPAY ORDER
    // ============================================================

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestParam int amount) {

        try {

            String order =
                    paymentService.createOrder(amount);

            return ResponseEntity.ok(order);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Unable to create Razorpay order: "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // VERIFY RAZORPAY PAYMENT
    // ============================================================

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(

            @RequestParam String orderId,

            @RequestParam String razorpayOrderId,

            @RequestParam String razorpayPaymentId,

            @RequestParam String razorpaySignature) {

        try {

            boolean verified =
                    paymentService.verifyPayment(
                            orderId,
                            razorpayOrderId,
                            razorpayPaymentId,
                            razorpaySignature
                    );

            if (verified) {

                return ResponseEntity.ok(
                        "Payment verified and saved successfully"
                );

            } else {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Payment verification failed"
                        );
            }

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Verification error: "
                                    + e.getMessage()
                    );
        }
    }
}