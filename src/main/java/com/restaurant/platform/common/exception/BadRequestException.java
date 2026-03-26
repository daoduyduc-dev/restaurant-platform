package com.restaurant.platform.common.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends BaseException{

    public BadRequestException(String errorCode, String message) {
        super(HttpStatus.BAD_REQUEST, errorCode, message);
    }
}
