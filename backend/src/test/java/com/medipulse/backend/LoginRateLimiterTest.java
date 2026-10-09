package com.medipulse.backend;
import com.medipulse.backend.service.LoginRateLimiter;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class LoginRateLimiterTest{
    @Test void blocksAfterFiveFailures(){LoginRateLimiter limiter=new LoginRateLimiter();String key="127.0.0.1:test@example.com";for(int i=0;i<5;i++)assertFalse(limiter.isBlocked(key));for(int i=0;i<5;i++)limiter.recordFailure(key);assertTrue(limiter.isBlocked(key));limiter.clear(key);assertFalse(limiter.isBlocked(key));}
}
