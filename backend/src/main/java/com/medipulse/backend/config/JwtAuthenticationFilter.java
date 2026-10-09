package com.medipulse.backend.config;

import com.medipulse.backend.entity.User;
import com.medipulse.backend.repository.UserRepository;
import com.medipulse.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
    JwtService jwtService,
    UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

@Override
protected void doFilterInternal(
HttpServletRequest request,
HttpServletResponse response,
FilterChain filterChain) throws ServletException, IOException {

    String authHeader = request.getHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        filterChain.doFilter(request, response);
        return;
    }

String token = authHeader.substring(7).trim();

try {
    if (!"access".equals(jwtService.extractType(token))) { filterChain.doFilter(request, response); return; }
    String email = jwtService.extractEmail(token);

    if (email != null &&
    !email.isBlank() &&
    SecurityContextHolder.getContext().getAuthentication() == null) {

        Optional<User> userOptional = userRepository.findByEmail(email.trim().toLowerCase());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            Long tokenUserId = null;

            try {
                tokenUserId = jwtService.extractUserId(token);
            } catch (Exception ignored) {


        }

    if (tokenUserId == null || tokenUserId.equals(user.getUserId())) {

        UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(
        user.getUserId(),
        null,
        List.of(
        new SimpleGrantedAuthority(
        "ROLE_" + user.getRole().name()
        )
        )
        );

        SecurityContextHolder.getContext()
        .setAuthentication(authentication);
    }
}
}
} catch (Exception ignored) {


}

filterChain.doFilter(request, response);
}
}
