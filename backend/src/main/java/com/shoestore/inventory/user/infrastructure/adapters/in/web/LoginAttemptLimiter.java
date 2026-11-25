package com.shoestore.inventory.user.infrastructure.adapters.in.web;

import java.time.Clock;
import java.time.Duration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

final class LoginAttemptLimiter {
    private static final long WINDOW_SECONDS = Duration.ofMinutes(5).toSeconds();
    private static final int ACCOUNT_LIMIT = 10;
    private static final int ADDRESS_LIMIT = 60;
    private static final int MAX_KEYS = 10_000;

    private final Clock clock;
    private final Map<String, Window> accounts = new HashMap<>();
    private final Map<String, Window> addresses = new HashMap<>();
    private long nextCleanup;

    LoginAttemptLimiter(Clock clock) {
        this.clock = clock;
    }

    synchronized long reserve(String username, String address) {
        long now = clock.instant().getEpochSecond();
        if (now >= nextCleanup) {
            accounts.values().removeIf(window -> window.endsAt <= now);
            addresses.values().removeIf(window -> window.endsAt <= now);
            nextCleanup = now + 60;
        }
        String account = username.strip().toLowerCase(Locale.ROOT);
        Window accountWindow = accounts.get(account);
        Window addressWindow = addresses.get(address);
        long delay = Math.max(retryAfter(accountWindow, ACCOUNT_LIMIT, now),
                retryAfter(addressWindow, ADDRESS_LIMIT, now));
        if (delay > 0) {
            return delay;
        }
        int newKeys = (accountWindow == null ? 1 : 0) + (addressWindow == null ? 1 : 0);
        if (accounts.size() + addresses.size() + newKeys > MAX_KEYS) {
            return nextCleanup - now;
        }
        accounts.put(account, advance(accountWindow, now));
        addresses.put(address, advance(addressWindow, now));
        return 0;
    }

    private static long retryAfter(Window window, int limit, long now) {
        return window != null && window.endsAt > now && window.count >= limit ? window.endsAt - now : 0;
    }

    private static Window advance(Window window, long now) {
        return window == null || window.endsAt <= now
                ? new Window(now + WINDOW_SECONDS, 1)
                : new Window(window.endsAt, window.count + 1);
    }

    private record Window(long endsAt, int count) {}
}
