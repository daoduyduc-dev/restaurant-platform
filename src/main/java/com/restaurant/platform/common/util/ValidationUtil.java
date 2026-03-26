package com.restaurant.platform.common.util;


import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;

public final class ValidationUtil {

    private ValidationUtil() {}

    public static void notNull(Object value, String fieldName) {
        if (value == null) {
            throw new BadRequestException(
                    ErrorCode.BAD_REQUEST,
                    fieldName + " must not be null"
            );
        }
    }

    public static void notBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    ErrorCode.BAD_REQUEST,
                    fieldName + " must not be empty"
            );
        }
    }
}
