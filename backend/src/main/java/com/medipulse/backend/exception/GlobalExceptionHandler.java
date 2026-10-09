package com.medipulse.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorizedException(
    UnauthorizedException ex,
    HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

@ExceptionHandler(ForbiddenException.class)
public ResponseEntity<ApiError> handleForbiddenException(
ForbiddenException ex,
HttpServletRequest request) {
    return buildError(HttpStatus.FORBIDDEN, ex.getMessage(), request);
}

@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<ApiError> handleAccessDeniedException(
AccessDeniedException ex,
HttpServletRequest request) {
    return buildError(
    HttpStatus.FORBIDDEN,
    "You do not have permission to access this resource",
    request);
}

@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ApiError> handleResourceNotFoundException(
ResourceNotFoundException ex,
HttpServletRequest request) {
    return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
}

@ExceptionHandler(NoResourceFoundException.class)
public ResponseEntity<ApiError> handleNoResourceFoundException(
NoResourceFoundException ex,
HttpServletRequest request) {
    return buildError(HttpStatus.NOT_FOUND, "No handler found for " + ex.getResourcePath(), request);
}

@ExceptionHandler(ConflictException.class)
public ResponseEntity<ApiError> handleConflictException(
ConflictException ex,
HttpServletRequest request) {
    return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
}

@ExceptionHandler(DataIntegrityViolationException.class)
public ResponseEntity<ApiError> handleDataIntegrityViolation(
DataIntegrityViolationException ex,
HttpServletRequest request) {
    return buildError(
    HttpStatus.CONFLICT,
    "The request conflicts with existing data",
    request);
}

@ExceptionHandler(IllegalArgumentException.class)
public ResponseEntity<ApiError> handleIllegalArgumentException(
IllegalArgumentException ex,
HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
}

@ExceptionHandler(MethodArgumentTypeMismatchException.class)
public ResponseEntity<ApiError> handleTypeMismatch(
MethodArgumentTypeMismatchException ex,
HttpServletRequest request) {
    return buildError(
    HttpStatus.BAD_REQUEST,
    "Invalid value for '" + ex.getName() + "'",
    request);
}

@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiError> handleValidationException(
MethodArgumentNotValidException ex,
HttpServletRequest request) {

    String message = ex.getBindingResult().getFieldErrors().stream()
    .findFirst()
    .map(error -> error.getField() + ": " + error.getDefaultMessage())
    .orElse("Request validation failed");

    return buildError(HttpStatus.BAD_REQUEST, message, request);
}

@ExceptionHandler(HttpMessageNotReadableException.class)
public ResponseEntity<ApiError> handleUnreadableMessage(
HttpMessageNotReadableException ex,
HttpServletRequest request) {
    return buildError(
    HttpStatus.BAD_REQUEST,
    "Request body is missing or contains invalid JSON",
    request);
}

@ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
public ResponseEntity<ApiError> handleMaxUploadSize(
org.springframework.web.multipart.MaxUploadSizeExceededException ex,
HttpServletRequest request) {
    return buildError(HttpStatus.BAD_REQUEST, "File must be 10MB or smaller", request);
}

@ExceptionHandler(Exception.class)
public ResponseEntity<ApiError> handleGeneralException(
Exception ex,
HttpServletRequest request) {
    return buildError(
    HttpStatus.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred",
    request);
}

private ResponseEntity<ApiError> buildError(
HttpStatus status,
String message,
HttpServletRequest request) {

    ApiError error = new ApiError(
    LocalDateTime.now(),
    status.value(),
    status.getReasonPhrase(),
    message,
    request.getRequestURI()
    );

    return ResponseEntity.status(status).body(error);
}
}
