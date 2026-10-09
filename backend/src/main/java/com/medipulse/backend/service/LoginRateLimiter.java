package com.medipulse.backend.service;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(5);
    private final Map<String, AttemptState> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        AttemptState state = attempts.get(key);
        if (state == null) return false;
        if (Instant.now().isAfter(state.firstFailure.plus(WINDOW))) {
            attempts.remove(key);
            return false;
        }
    return state.failures >= MAX_FAILURES;
}

public void recordFailure(String key) {
    attempts.compute(key, (k, state) -> {
        Instant now = Instant.now();
        if (state == null || now.isAfter(state.firstFailure.plus(WINDOW))) return new AttemptState(now, 1);
        return new AttemptState(state.firstFailure, state.failures + 1);
    });
}

public void clear(String key) { attempts.remove(key); }

private record AttemptState(Instant firstFailure, int failures) {}
}
