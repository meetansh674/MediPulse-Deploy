package com.medipulse.backend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(
    HttpServletRequest request,
    HttpServletResponse response,
    AccessDeniedException accessDeniedException) throws IOException, ServletException {

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String body = "{" +
        "\"timestamp\":\"" + escapeJson(LocalDateTime.now().toString()) + "\"," +
        "\"status\":" + HttpStatus.FORBIDDEN.value() + "," +
        "\"error\":\"Forbidden\"," +
        "\"message\":\"You do not have permission to access this resource\"," +
        "\"path\":\"" + escapeJson(request.getRequestURI()) + "\"" +
        "}";

        response.getWriter().write(body);
    }

private String escapeJson(String value) {
    if (value == null) {
        return "";
    }
return value
.replace("\\", "\\\\")
.replace("\"", "\\\"")
.replace("\n", "\\n")
.replace("\r", "\\r")
.replace("\t", "\\t");
}
}
