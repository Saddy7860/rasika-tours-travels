package com.rasika.tours.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation
        .ExceptionHandler;

import org.springframework.web.bind.annotation
        .RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(
            IllegalArgumentException.class)
    public ResponseEntity<ApiError>
    handleIllegalArgument(
            IllegalArgumentException ex) {

        return ResponseEntity
                .badRequest()
                .body(
                        new ApiError(
                                HttpStatus.BAD_REQUEST.value(),
                                ex.getMessage()
                        )
                );
    }

    @ExceptionHandler(
            Exception.class)
    public ResponseEntity<ApiError>
    handleException(
            Exception ex) {

        ex.printStackTrace();

        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .body(
                        new ApiError(
                                HttpStatus
                                        .INTERNAL_SERVER_ERROR
                                        .value(),
                                "An unexpected server error occurred."
                        )
                );
    }
}
