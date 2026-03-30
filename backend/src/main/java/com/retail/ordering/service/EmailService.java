package com.retail.ordering.service;

import com.retail.ordering.dto.OrderDTO;
import com.retail.ordering.dto.OrderItemDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String mailFrom;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String mailFrom) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
    }

    /**
     * Send order confirmation email with order details
     */
    public void sendOrderConfirmation(String recipientEmail, String userName, OrderDTO orderDTO) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(recipientEmail);
            helper.setSubject("Order Confirmation - Order #" + orderDTO.getId());
            
            // Create HTML email content
            String htmlContent = buildOrderConfirmationEmail(userName, orderDTO);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Order confirmation email sent successfully to: {}", recipientEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send order confirmation email to: {}", recipientEmail, e);
            // Don't throw exception - order should not fail if email fails
        } catch (Exception e) {
            logger.error("Unexpected error while sending order confirmation email", e);
        }
    }

    /**
     * Send order status update email
     */
    public void sendOrderStatusUpdate(String recipientEmail, String userName, Long orderId, String newStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(recipientEmail);
            helper.setSubject("Order Update - Order #" + orderId + " is " + newStatus);
            
            String htmlContent = buildOrderStatusUpdateEmail(userName, orderId, newStatus);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Order status update email sent successfully to: {}", recipientEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send order status update email to: {}", recipientEmail, e);
        } catch (Exception e) {
            logger.error("Unexpected error while sending order status update email", e);
        }
    }

    /**
     * Build HTML email content for order status update
     */
    private String buildOrderStatusUpdateEmail(String userName, Long orderId, String status) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head>\n");
        html.append("    <style>\n");
        html.append("        body { font-family: Arial, sans-serif; color: #333; }\n");
        html.append("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n");
        html.append("        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }\n");
        html.append("        .content { border: 1px solid #ddd; padding: 20px; }\n");
        html.append("        .footer { background-color: #ecf0f1; padding: 20px; border-radius: 0 0 5px 5px; text-align: center; font-size: 12px; }\n");
        html.append("        .status-badge { display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; border-radius: 4px; font-weight: bold; }\n");
        html.append("    </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("    <div class=\"container\">\n");
        html.append("        <div class=\"header\">\n");
        html.append("            <h1>Order Status Update</h1>\n");
        html.append("        </div>\n");
        html.append("        <div class=\"content\">\n");
        html.append("            <p>Hi <strong>").append(userName).append("</strong>,</p>\n");
        html.append("            <p>We have an update for your order:</p>\n");
        html.append("            <p style=\"margin: 20px 0;\">\n");
        html.append("                <strong>Order ID:</strong> #").append(orderId).append("<br/>\n");
        html.append("                <strong>New Status:</strong> <span class=\"status-badge\">").append(status).append("</span>\n");
        html.append("            </p>\n");
        
        String statusMessage = getStatusMessage(status);
        html.append("            <p>").append(statusMessage).append("</p>\n");
        
        html.append("            <p>You can track your order anytime in your account or contact us if you have any questions.</p>\n");
        html.append("        </div>\n");
        html.append("        <div class=\"footer\">\n");
        html.append("            <p>&copy; 2024 Retail Ordering System. All rights reserved.</p>\n");
        html.append("        </div>\n");
        html.append("    </div>\n");
        html.append("</body>\n");
        html.append("</html>\n");
        
        return html.toString();
    }

    /**
     * Get a user-friendly message for each status
     */
    private String getStatusMessage(String status) {
        return switch (status.toUpperCase()) {
            case "PENDING" -> "Your order has been received and is being processed.";
            case "CONFIRMED" -> "Your order has been confirmed and will be shipped soon.";
            case "SHIPPED" -> "Great news! Your order has been shipped. Tracking details will follow.";
            case "DELIVERED" -> "Your order has been delivered. We hope you enjoy your purchase!";
            case "CANCELLED" -> "Your order has been cancelled. If you didn't request this, please contact us immediately.";
            default -> "Your order status has been updated to: " + status;
        };
    }

    /**
     * Build HTML email content for order confirmation
     */
    private String buildOrderConfirmationEmail(String userName, OrderDTO orderDTO) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head>\n");
        html.append("    <style>\n");
        html.append("        body { font-family: Arial, sans-serif; color: #333; }\n");
        html.append("        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n");
        html.append("        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }\n");
        html.append("        .content { border: 1px solid #ddd; padding: 20px; }\n");
        html.append("        .footer { background-color: #ecf0f1; padding: 20px; border-radius: 0 0 5px 5px; text-align: center; font-size: 12px; }\n");
        html.append("        .order-details { margin: 20px 0; } \n");
        html.append("        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }\n");
        html.append("        .items-table th { background-color: #34495e; color: white; padding: 10px; text-align: left; }\n");
        html.append("        .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }\n");
        html.append("        .total-row { background-color: #ecf0f1; font-weight: bold; }\n");
        html.append("        .status { padding: 10px; background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 4px; }\n");
        html.append("    </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("    <div class=\"container\">\n");
        html.append("        <div class=\"header\">\n");
        html.append("            <h1>Order Confirmation</h1>\n");
        html.append("            <p>Thank you for your order!</p>\n");
        html.append("        </div>\n");
        html.append("        <div class=\"content\">\n");
        html.append("            <p>Hello <strong>").append(userName).append("</strong>,</p>\n");
        html.append("            <p>We're excited to fulfill your order. Below are the details:</p>\n");
        
        html.append("            <div class=\"order-details\">\n");
        html.append("                <div><strong>Order ID:</strong> #").append(orderDTO.getId()).append("</div>\n");
        html.append("                <div><strong>Order Date:</strong> ").append(
            orderDTO.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy HH:mm"))
        ).append("</div>\n");
        html.append("                <div class=\"status\"><strong>Status:</strong> ").append(orderDTO.getStatus()).append("</div>\n");
        html.append("            </div>\n");
        
        html.append("            <h3>Order Items:</h3>\n");
        html.append("            <table class=\"items-table\">\n");
        html.append("                <thead>\n");
        html.append("                    <tr>\n");
        html.append("                        <th>Product</th>\n");
        html.append("                        <th>Quantity</th>\n");
        html.append("                        <th>Price</th>\n");
        html.append("                        <th>Subtotal</th>\n");
        html.append("                    </tr>\n");
        html.append("                </thead>\n");
        html.append("                <tbody>\n");
        
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemDTO item : orderDTO.getItems()) {
            BigDecimal itemSubtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);
            
            html.append("                    <tr>\n");
            html.append("                        <td>").append(item.getProductName()).append("</td>\n");
            html.append("                        <td>").append(item.getQuantity()).append("</td>\n");
            html.append("                        <td>$").append(String.format("%.2f", item.getPrice())).append("</td>\n");
            html.append("                        <td>$").append(String.format("%.2f", itemSubtotal)).append("</td>\n");
            html.append("                    </tr>\n");
        }
        
        html.append("                    <tr class=\"total-row\">\n");
        html.append("                        <td colspan=\"3\" style=\"text-align: right;\">Total Amount:</td>\n");
        html.append("                        <td>$").append(String.format("%.2f", orderDTO.getTotalAmount())).append("</td>\n");
        html.append("                    </tr>\n");
        html.append("                </tbody>\n");
        html.append("            </table>\n");
        
        html.append("            <p><strong>What's next?</strong></p>\n");
        html.append("            <ul>\n");
        html.append("                <li>Your order is being prepared</li>\n");
        html.append("                <li>You will receive a shipping notification when your order is on the way</li>\n");
        html.append("                <li>Track your order status anytime in your account</li>\n");
        html.append("            </ul>\n");
        
        html.append("            <p>If you have any questions, please don't hesitate to contact our support team.</p>\n");
        html.append("        </div>\n");
        html.append("        <div class=\"footer\">\n");
        html.append("            <p>&copy; 2024 Retail Ordering System. All rights reserved.</p>\n");
        html.append("            <p>This is an automated email. Please do not reply to this message.</p>\n");
        html.append("        </div>\n");
        html.append("    </div>\n");
        html.append("</body>\n");
        html.append("</html>\n");
        
        return html.toString();
    }
}
