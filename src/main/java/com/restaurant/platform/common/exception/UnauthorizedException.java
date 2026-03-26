package com.restaurant.platform.common.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends BaseException{

    public UnauthorizedException(String errorCode, String message) {
        super(HttpStatus.UNAUTHORIZED, errorCode, message);
    }
}
