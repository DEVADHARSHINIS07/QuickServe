package com.smartcanteen.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Async
    public void sendEmail(String toEmail, String subject, String messageBody) {
        if (mailSender == null) {
            logger.info("[SIMULATED EMAIL] To: {} | Subject: {} \nBody: {}", toEmail, subject, messageBody);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("canteen.aaacet@gmail.com");
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(messageBody);
            mailSender.send(message);
            logger.info("Email sent successfully to {}", toEmail);
        } catch (Exception ex) {
            logger.error("Failed to send SMTP email to {}: {}. Logging message body instead.", toEmail, ex.getMessage());
            logger.info("[FALLBACK EMAIL LOG] To: {} | Subject: {} \nBody: {}", toEmail, subject, messageBody);
        }
    }

    public void sendRegistrationConfirmation(String email, String name) {
        String subject = "Welcome to AAACET QuickServe Smart Canteen!";
        String body = "Dear " + name + ",\n\n" +
                "Your Smart Canteen account has been successfully registered using your AAACET College Email (" + email + ").\n\n" +
                "You can now log in, skip lines, schedule pickup slots, and order your favorite food items online!\n\n" +
                "Best Regards,\nAAACET Smart Canteen Team";
        sendEmail(email, subject, body);
    }

    public void sendPasswordResetEmail(String email, String resetToken) {
        String subject = "Password Reset Request - AAACET Smart Canteen";
        String body = "Someone requested a password reset for your Smart Canteen account.\n\n" +
                "Your single-use password reset token is: " + resetToken + "\n\n" +
                "If you did not request this reset, please ignore this email.\n\n" +
                "Best Regards,\nAAACET Smart Canteen Security Team";
        sendEmail(email, subject, body);
    }

    public void sendOrderStatusEmail(String email, String name, String orderId, String status, String note) {
        String subject = "Order " + orderId + " Status Update: " + status;
        String body = "Dear " + name + ",\n\n" +
                "Your order #" + orderId + " is now: " + status.toUpperCase() + ".\n" +
                (note != null && !note.isEmpty() ? "Note / Message: " + note + "\n\n" : "\n") +
                "Thank you for using QuickServe Smart Canteen!\n\n" +
                "Best Regards,\nAAACET Canteen Team";
        sendEmail(email, subject, body);
    }
}
