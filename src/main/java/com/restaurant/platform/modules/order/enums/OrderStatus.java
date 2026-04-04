package com.restaurant.platform.modules.order.enums;

public enum OrderStatus {
    OPEN,           // Order created, not yet sent to kitchen
    PENDING,        // Sent to kitchen, waiting to start cooking
    COOKING,        // Kitchen is preparing the order
    READY,          // Ready to be served
    SERVED,         // Delivered to customer
    PAID,           // Payment completed
    CANCELED        // Order canceled
}
