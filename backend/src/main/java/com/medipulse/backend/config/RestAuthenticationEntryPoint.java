package com.medipulse.backend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
    HttpServletRequest request,
    HttpServletResponse response,
    AuthenticationException authException) throws IOException, ServletException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String body = "{" +
        "\"timestamp\":\"" + escapeJson(LocalDateTime.now().toString()) + "\"," +
        "\"status\":" + HttpStatus.UNAUTHORIZED.value() + "," +
        "\"error\":\"Unauthorized\"," +
        "\"message\":\"Authentication is required to access this resource\"," +
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
