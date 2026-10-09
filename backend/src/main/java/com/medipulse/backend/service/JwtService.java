package com.medipulse.backend.service;
import io.jsonwebtoken.Claims;import io.jsonwebtoken.Jwts;import io.jsonwebtoken.security.Keys;import org.springframework.beans.factory.annotation.Value;import org.springframework.stereotype.Service;import javax.crypto.SecretKey;import java.nio.charset.StandardCharsets;import java.util.Date;
@Service public class JwtService{
    private final SecretKey key;private final long expirationTime;private final long refreshExpirationTime;
    public JwtService(@Value("${app.jwt.secret}")String secret,@Value("${app.jwt.expiration-ms:3600000}")long expirationTime,@Value("${app.jwt.refresh-expiration-ms:604800000}")long refreshExpirationTime){if(secret==null||secret.getBytes(StandardCharsets.UTF_8).length<32)throw new IllegalArgumentException("JWT secret must be at least 32 bytes long");key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));this.expirationTime=expirationTime;this.refreshExpirationTime=refreshExpirationTime;}
    public String generateToken(Long userId,String email,String role){return build(userId,email,role,expirationTime,"access");}
    public String generateRefreshToken(Long userId,String email,String role){return build(userId,email,role,refreshExpirationTime,"refresh");}
    private String build(Long userId,String email,String role,long ttl,String type){Date now=new Date();return Jwts.builder().subject(email).claim("userId",userId).claim("role",role).claim("type",type).issuedAt(now).expiration(new Date(now.getTime()+ttl)).signWith(key).compact();}
    public String extractEmail(String token){return extractAllClaims(token).getSubject();}
    public String extractRole(String token){return extractAllClaims(token).get("role",String.class);}
    public Long extractUserId(String token){return extractAllClaims(token).get("userId",Long.class);}
    public String extractType(String token){return extractAllClaims(token).get("type",String.class);}
    private Claims extractAllClaims(String token){return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();}
}
