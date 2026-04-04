package com.restaurant.platform.common;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@restaurant.local}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            String resetLink = frontendUrl + "/reset?token=" + resetToken;
            String subject = "Restaurant Platform - Password Reset";
            String body = String.format(
                    "Hello,\n\n" +
                    "You requested a password reset. Click the link below to reset your password:\n\n" +
                    "%s\n\n" +
                    "This link will expire in 15 minutes.\n\n" +
                    "If you didn't request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Restaurant Platform Team",
                    resetLink
            );

            sendEmail(email, subject, body);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
        }
    }

    @Override
    public void sendWelcomeEmail(String email, String userName) {
        try {
            String subject = "Welcome to Restaurant Platform!";
            String body = String.format(
                    "Hello %s,\n\n" +
                    "Welcome to Restaurant Platform! We're glad to have you on board.\n\n" +
                    "You can now:\n" +
                    "- Make reservations at our restaurant\n" +
                    "- Order food online\n" +
                    "- Track your loyalty points\n" +
                    "- View exclusive offers\n\n" +
                    "If you have any questions, feel free to contact us.\n\n" +
                    "Best regards,\n" +
                    "Restaurant Platform Team",
                    userName
            );

            sendEmail(email, subject, body);
            log.info("Welcome email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", email, e);
        }
    }

    @Override
    public void sendPaymentConfirmationEmail(String email, String orderId, String amount) {
        try {
            String subject = "Payment Confirmation - Order #" + orderId;
            String body = String.format(
                    "Hello,\n\n" +
                    "Thank you for your payment!\n\n" +
                    "Order ID: %s\n" +
                    "Amount: %s\n\n" +
                    "Your order has been confirmed and will be prepared shortly.\n" +
                    "You can track your order status on the platform.\n\n" +
                    "Best regards,\n" +
                    "Restaurant Platform Team",
                    orderId, amount
            );

            sendEmail(email, subject, body);
            log.info("Payment confirmation email sent to: {} for order: {}", email, orderId);
        } catch (Exception e) {
            log.error("Failed to send payment confirmation email to: {}", email, e);
        }
    }

    @Override
    public void sendNotificationEmail(String email, String title, String message) {
        try {
            String subject = "Restaurant Platform - " + title;
            String body = String.format(
                    "Hello,\n\n" +
                    "%s\n\n" +
                    "Best regards,\n" +
                    "Restaurant Platform Team",
                    message
            );

            sendEmail(email, subject, body);
            log.info("Notification email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send notification email to: {}", email, e);
        }
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Error sending email to {}: {}", to, e.getMessage());
            log.info("Email would have been: Subject: {}, Body: {}", subject, body);
        }
    }
}
