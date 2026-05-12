package com.hospital.common;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private ErrorPayload error;
    @Builder.Default
    private String requestId = resolveRequestId();
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorPayload {
        private String code;
        private String details;
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Operation successful")
                .data(data)
                .error(null)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .error(null)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return error(message, "BAD_REQUEST", null);
    }

    public static <T> ApiResponse<T> error(String message, String code, String details) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ErrorPayload.builder()
                        .code(code)
                        .details(details)
                        .build())
                .build();
    }

    private static String resolveRequestId() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            HttpServletRequest request = servletAttributes.getRequest();
            Object requestId = request.getAttribute("requestId");
            if (requestId != null) {
                return String.valueOf(requestId);
            }
        }
        return "n/a";
    }
}
