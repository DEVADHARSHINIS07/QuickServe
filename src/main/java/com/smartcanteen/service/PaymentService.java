package com.smartcanteen.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.smartcanteen.repository.OrderRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private OrderRepository orderRepository;

    // ============================================================
    // CREATE RAZORPAY ORDER
    // ============================================================

    public String createOrder(int amount) throws Exception {

        RazorpayClient razorpayClient =
                new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();

        // Amount is in rupees, Razorpay needs paise
        orderRequest.put("amount", amount * 100);
        orderRequest.put("currency", "INR");
        orderRequest.put(
                "receipt",
                "receipt_" + System.currentTimeMillis()
        );

        Order order = razorpayClient.orders.create(orderRequest);

        return order.toString();
    }

    // ============================================================
    // VERIFY RAZORPAY PAYMENT
    // ============================================================

    public boolean verifyPayment(
            String orderId,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) throws Exception {

        // Razorpay signature verification payload
        String payload =
                razorpayOrderId + "|" + razorpayPaymentId;

        String generatedSignature =
                com.razorpay.Utils.getHash(
                        payload,
                        razorpayKeySecret
                );

        boolean verified =
                generatedSignature.equals(razorpaySignature);

        // If Razorpay payment is genuine,
        // update payment details in our database
        if (verified) {

            int updatedRows = orderRepository.updatePayment(
                    orderId,
                    "PAID",
                    razorpayPaymentId,
                    razorpayOrderId,
                    razorpaySignature
            );

            return updatedRows > 0;
        }

        return false;
    }
}