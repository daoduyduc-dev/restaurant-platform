package com.restaurant.platform.common.exception;

import com.restaurant.platform.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ================= BUSINESS EXCEPTION =================
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ApiResponse<Void>> handleBaseException(BaseException ex) {

        return ResponseEntity
                .status(ex.getStatus())
                .body(new ApiResponse<>(
                        false,
                        ex.getMessage(),
                        null
                ));
    }

    // ================= VALIDATION =================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException ex
    ) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Validation error");

        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, message, null));
    }

    // ================= SECURITY =================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied() {
        return ResponseEntity.status(403)
                .body(new ApiResponse<>(false, "Access denied", null));
    }

    // ================= UNKNOWN =================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedException(Exception ex) {

        ex.printStackTrace();

        return ResponseEntity.status(500)
                .body(new ApiResponse<>(
                        false,
                        "Internal server error",
                        null
                ));
    }
}