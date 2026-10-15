import { createHash } from "node:crypto";
const buckets = new Map<string, { count: number; expires: number }>();
export async function protect(request: Request, data: FormData) {
  if (data.get("website")) throw new Error("Unable to accept this request.");
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const production = process.env.NODE_ENV === "production";
  if (
    production &&
    (!secret ||
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN)
  )
    throw new Error(
      "Request service is not configured. Please try again later.",
    );
  if (secret) {
    const token = data.get("cf-turnstile-response");
    if (typeof token !== "string" || !token)
      throw new Error("Please complete the security check.");
    const body = new URLSearchParams({ secret, response: token });
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body, signal: AbortSignal.timeout(10000) },
    );
    const result = await response.json();
    if (!response.ok || !result.success)
      throw new Error("Security check expired. Please reload and try again.");
    const expectedHost = new URL(
      process.env.NEXT_PUBLIC_SITE_URL || request.url,
    ).hostname;
    if (result.hostname !== expectedHost)
      throw new Error("Security check hostname mismatch.");
  }
  // Trust only the client-IP header overwritten by the selected hosting provider.
  const clientIpHeader = process.env.DEPLOYMENT_PLATFORM === 'netlify' ? 'x-nf-client-connection-ip' : 'x-real-ip';
  const ip = request.headers.get(clientIpHeader) || "local";
  const customer = String(data.get("email") || "").toLowerCase();
  const keys = [`ip:${ip}`, `email:${customer}`].map(
    (value) =>
      "request-rate:" + createHash("sha256").update(value).digest("hex"),
  );
  for (const key of keys) {
    const url = process.env.UPSTASH_REDIS_REST_URL,
      token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          "EVAL",
          'local n = redis.call("INCR", KEYS[1]); if n == 1 then redis.call("EXPIRE", KEYS[1], 600) end; return n',
          1,
          key,
        ]),
        signal: AbortSignal.timeout(10000),
      });
      const result = await response.json();
      if (!response.ok || result.error || typeof result.result !== "number")
        throw new Error("Request service temporarily unavailable.");
      if (result.result > 5)
        throw new Error("Too many requests. Please try again in 10 minutes.");
    } else {
      const now = Date.now();
      for (const [k, b] of buckets) if (b.expires < now) buckets.delete(k);
      const item = buckets.get(key) || { count: 0, expires: now + 600000 };
      if (++item.count > 5)
        throw new Error("Too many requests. Please try again in 10 minutes.");
      buckets.set(key, item);
    }
  }
}
