package com.restaurant.platform.common.constant;

public final class ErrorCode {


    public static final String INVALID_INPUT = "";

    private ErrorCode() {}

    // ================= COMMON =================
    public static final String INTERNAL_SERVER_ERROR = "COMMON_500";
    public static final String BAD_REQUEST = "COMMON_400";
    public static final String UNAUTHORIZED = "COMMON_401";
    public static final String FORBIDDEN = "COMMON_403";
    public static final String NOT_FOUND = "COMMON_404";

    // ================= AUTH =================
    public static final String USER_NOT_FOUND = "USER_404";
    public static final String USER_ALREADY_EXISTS = "USER_409";
    public static final String INVALID_CREDENTIALS = "USER_401";
    public static final String ROLE_NOT_FOUND = "ROLE_404";

    // ================= TABLE =================
    public static final String TABLE_NOT_FOUND = "TABLE_404";
    public static final String TABLE_ALREADY_EXISTS = "TABLE_409";
    public static final String TABLE_NOT_AVAILABLE = "TABLE_400";
    public static final String TABLE_CAPACITY_EXCEEDED = "TABLE_400";

    // ================= RESERVATION =================
    public static final String RESERVATION_NOT_FOUND = "RESERVATION_404";
    public static final String RESERVATION_ALREADY_EXISTS = "RESERVATION_409";
    public static final String RESERVATION_TIME_CONFLICT = "RESERVATION_409";
    public static final String RESERVATION_INVALID_TIME = "RESERVATION_400";
    public static final String RESERVATION_INVALID_STATUS = "RESERVATION_400";
    public static final String RESERVATION_ALREADY_CANCELLED = "RESERVATION_400";
    public static final String RESERVATION_INVALID_CAPACITY = "RESERVATION_400";

    // ================= ORDER =================
    public static final String ORDER_NOT_FOUND = "ORDER_404";
    public static final String ORDER_ALREADY_EXISTS = "ORDER_409";
    public static final String ORDER_INVALID_STATUS = "ORDER_400";

    // ================= ORDER ITEM =================
    public static final String ORDER_ITEM_NOT_FOUND = "ORDER_ITEM_404";
    public static final String ORDER_ITEM_INVALID = "ORDER_ITEM_400";
    public static final String MENU_ITEM_NOT_FOUND = "MENU_ITEM_404";

    // ================= PAYMENT =================
    public static final String PAYMENT_FAILED = "PAYMENT_400";
    public static final String PAYMENT_NOT_FOUND = "PAYMENT_404";
    public static final String PAYMENT_ALREADY_COMPLETED = "PAYMENT_409";

    // ================= LOYALTY =================
    public static final String LOYALTY_NOT_FOUND = "LOYALTY_404";
    public static final String LOYALTY_INVALID = "LOYALTY_400";

    // ================= NOTIFICATION =================
    public static final String NOTIFICATION_NOT_FOUND = "NOTIFICATION_404";
    public static final String NOTIFICATION_INVALID = "NOTIFICATION_400";

    // ================= VALIDATION =================
    public static final String VALIDATION_ERROR = "VALIDATION_400";
}