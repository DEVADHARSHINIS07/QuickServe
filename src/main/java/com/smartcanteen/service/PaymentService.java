package com.smartcanteen.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;

import com.smartcanteen.model.Order;
import com.smartcanteen.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private OrderRepository orderRepository;

    @Value("${razorpay.key.id:rzp_test_AAACollegeCanteen}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:secret_AAACollegeCanteen}")
    private String razorpayKeySecret;

    public com.razorpay.Order createRazorpayOrder(Double amount, String receipt) throws RazorpayException {
        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        // Convert to paise (e.g., Rs 100 -> 10000 paise)
        long amountInPaise = Math.round(amount * 100);
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt);
        orderRequest.put("payment_capture", 1);

        com.razorpay.Order order = razorpay.orders.create(orderRequest);
        return order;
    }

    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            return Utils.verifyPaymentSignature(options, razorpayKeySecret);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean processPaymentVerification(String orderId, String razorpayPaymentId, String razorpayOrderId, String razorpaySignature) {
        boolean isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (isValid) {
            orderRepository.updatePayment(orderId, "PAID", razorpayPaymentId, "UPI", "Order Accepted");
            return true;
        } else {
            orderRepository.updatePayment(orderId, "FAILED", razorpayPaymentId, "UPI", "Order Placed");
            return false;
        }
    }
}
