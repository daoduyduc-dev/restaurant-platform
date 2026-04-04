package com.restaurant.platform.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when email sending operations fail.
 */
public class EmailException extends BaseException {

    public EmailException(String errorCode, String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, errorCode, message);
    }

    public EmailException(String errorCode, String message, Throwable cause) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, errorCode, message);
        initCause(cause);
    }
}
