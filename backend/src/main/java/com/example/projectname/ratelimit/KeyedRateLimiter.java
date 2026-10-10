package com.example.projectname.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A keyed set of independent in-memory token buckets (one per distinct key: an IP, or a
 * credential+IP pair).
 *
 * <p>In-memory and per-instance by design, not backed by a shared cache: adding Redis solely for
 * rate limiting would be new operational infrastructure for a single-instance deployment. If you
 * run several replicas, swap this class for a distributed implementation (Bucket4j supports several
 * backends) and keep the {@code tryConsume} contract. Each bucket refills fully at the start of
 * every window rather than trickling continuously, which is simpler to reason about and to test
 * than a smooth refill.
 */
public class KeyedRateLimiter {

  private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
  private final RateLimitProperties.Rule rule;

  public KeyedRateLimiter(RateLimitProperties.Rule rule) {
    this.rule = rule;
  }

  public boolean tryConsume(String key) {
    return buckets.computeIfAbsent(key, unused -> newBucket()).tryConsume(1);
  }

  private Bucket newBucket() {
    Bandwidth limit =
        Bandwidth.classic(
            rule.getCapacity(),
            Refill.intervally(rule.getCapacity(), Duration.ofMinutes(rule.getPeriodMinutes())));
    return Bucket.builder().addLimit(limit).build();
  }
}
