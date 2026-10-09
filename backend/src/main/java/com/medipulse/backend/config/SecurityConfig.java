package com.medipulse.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    @Value("${app.cors.allowed-origins:http://localhost:5500,http://127.0.0.1:5500}")
    private String allowedOrigins;

    public SecurityConfig(
    JwtAuthenticationFilter jwtAuthenticationFilter,
    RestAuthenticationEntryPoint authenticationEntryPoint,
    RestAccessDeniedHandler accessDeniedHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
    .csrf(csrf -> csrf.disable())
    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
    .sessionManagement(session ->
    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .exceptionHandling(exceptions -> exceptions
    .authenticationEntryPoint(authenticationEntryPoint)
    .accessDeniedHandler(accessDeniedHandler))
    .authorizeHttpRequests(auth -> auth
    .requestMatchers(
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/forgot-password/question",
    "/api/auth/forgot-password/reset",
    "/swagger-ui/**",
    "/v3/api-docs/**"
    ).permitAll()
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
    .anyRequest().authenticated())
    .addFilterBefore(
    jwtAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class);

    return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(java.util.Arrays.stream(allowedOrigins.split(",")).map(String::trim).filter(v -> !v.isBlank()).toList());
    configuration.setAllowedMethods(List.of(
    "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
    ));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(false);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}

@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
}
