package com.shoestore.inventory.user.infrastructure.adapters.in.web;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LoginAttemptLimiterTests {
    @Test
    void reservesAccountBudgetAtomicallyAcrossAddressesAndAllowsRetryAfterExpiry() {
        var clock = new TestClock();
        var limiter = new LoginAttemptLimiter(clock);
        long accepted = IntStream.range(0, 20).parallel()
                .filter(i -> limiter.reserve(i % 2 == 0 ? "Caja" : "caja", "192.0.2." + i) == 0)
                .count();
        assertEquals(10, accepted);
        assertEquals(300, limiter.reserve("caja", "198.51.100.1"));
        clock.now = clock.now.plusSeconds(300);
        assertEquals(0, limiter.reserve("caja", "198.51.100.1"));
    }

    @Test
    void boundsAttemptsFromOneAddressAcrossAccounts() {
        var limiter = new LoginAttemptLimiter(new TestClock());
        for (int i = 0; i < 60; i++) {
            assertEquals(0, limiter.reserve("caja" + i, "192.0.2.1"));
        }
        assertEquals(300, limiter.reserve("otra", "192.0.2.1"));
        assertEquals(0, limiter.reserve("otra", "192.0.2.2"));
    }

    private static final class TestClock extends Clock {
        private Instant now = Instant.EPOCH;

        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return Clock.fixed(now, zone); }
        @Override public Instant instant() { return now; }
    }
}
