package com.restaurant.platform.common;

/**
 * Service interface for sending emails in the restaurant platform.
 */
public interface EmailService {

    /**
     * Sends a password reset email to the user.
     *
     * @param email the user's email address
     * @param resetToken the password reset token
     */
    void sendPasswordResetEmail(String email, String resetToken);

    /**
     * Sends a welcome email to a newly registered user.
     *
     * @param email the user's email address
     * @param userName the user's name
     */
    void sendWelcomeEmail(String email, String userName);

    /**
     * Sends a payment confirmation email to the user.
     *
     * @param email the user's email address
     * @param orderId the order ID
     * @param amount the payment amount
     */
    void sendPaymentConfirmationEmail(String email, String orderId, String amount);

    /**
     * Sends a notification email to the user.
     *
     * @param email the user's email address
     * @param title the notification title
     * @param message the notification message
     */
    void sendNotificationEmail(String email, String title, String message);
}
