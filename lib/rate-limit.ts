// Simple in-memory rate limiter
// For production, use Upstash or similar service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries
  if (entry && entry.resetTime < now) {
    rateLimitStore.delete(identifier);
    return { success: true, remaining: maxRequests };
  }

  // First request or after reset
  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1 };
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { success: false, remaining: 0, retryAfter };
  }

  // Increment counter
  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);
