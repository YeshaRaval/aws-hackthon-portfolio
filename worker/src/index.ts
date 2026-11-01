/**
 * index.ts — Cloudflare Worker entry point
 *
 * Responsibilities:
 *  1. CORS — only configured origins can call this Worker.
 *  2. Request validation — method, content-type, body shape, input length.
 *  3. Rate limiting — lightweight IP-based limiting using the request CF metadata.
 *     (KV-backed persistent limiting is commented below for when you need it.)
 *  4. Stream — calls openai.ts and pipes the ReadableStream back to the client.
 *
 * The worker handles two kinds of requests:
 *  OPTIONS /  — CORS preflight (browsers send this before POST)
 *  POST    /  — Ask a question; returns a streaming text/plain response
 */

import { streamOpenAIResponse, type Env } from "./openai";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";

    // ── CORS ──────────────────────────────────────────────────────────────────
    // Build the CORS headers only if the request origin is in the allowlist.
    const corsHeaders = buildCORSHeaders(origin, env.ALLOWED_ORIGINS);

    if (!corsHeaders) {
      // Origin not allowed — return 403 with no CORS headers.
      // The browser will block this response anyway, but we still return 403
      // so server-side callers (e.g. curl in CI) get a clear error.
      return new Response("Forbidden: origin not allowed.", { status: 403 });
    }

    // ── Preflight ─────────────────────────────────────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── Method guard ──────────────────────────────────────────────────────────
    if (request.method !== "POST") {
      return new Response("Method not allowed.", {
        status: 405,
        headers: { ...corsHeaders, Allow: "POST, OPTIONS" },
      });
    }

    // ── Content-Type guard ────────────────────────────────────────────────────
    const contentType = request.headers.get("Content-Type") ?? "";
    if (!contentType.includes("application/json")) {
      return new Response("Content-Type must be application/json.", {
        status: 415,
        headers: corsHeaders,
      });
    }

    // ── Rate limiting (in-memory, per-isolate) ────────────────────────────────
    // This is a lightweight in-memory rate limiter. It resets whenever the
    // Worker isolate is recycled (which Cloudflare does periodically). It is
    // NOT a distributed rate limiter — a determined attacker with many IPs
    // can bypass it. For a public portfolio, this is an appropriate tradeoff:
    // it stops accidental hammering and casual abuse without needing a database.
    //
    // To upgrade to persistent KV-based limiting:
    //   1. Create a KV namespace: `wrangler kv namespace create RATE_LIMIT_STORE`
    //   2. Uncomment the [[kv_namespaces]] section in wrangler.toml
    //   3. Replace the call below with the KV-backed implementation
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const rateLimitResult = checkInMemoryRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return new Response("Too many requests. Please wait a moment and try again.", {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
        },
      });
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body.", { status: 400, headers: corsHeaders });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("question" in body) ||
      typeof (body as Record<string, unknown>).question !== "string"
    ) {
      return new Response('Body must be JSON with a "question" string field.', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const question = ((body as Record<string, unknown>).question as string).trim();

    if (question.length === 0) {
      return new Response("Question cannot be empty.", { status: 400, headers: corsHeaders });
    }

    const maxLength = parseInt(env.MAX_QUESTION_LENGTH ?? "500", 10);
    if (question.length > maxLength) {
      return new Response(`Question must be ${maxLength} characters or fewer.`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // ── Stream response ───────────────────────────────────────────────────────
    const stream = streamOpenAIResponse(question, env);

    return new Response(stream, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        "X-Content-Type-Options": "nosniff",
        // Transfer-Encoding is managed automatically by the Workers runtime.
      },
    });
  },
} satisfies ExportedHandler<Env>;

// ── CORS helpers ──────────────────────────────────────────────────────────────

/**
 * Returns CORS headers if the origin is in the allowlist, null otherwise.
 * `allowedOriginsStr` is a space-separated string from wrangler.toml [vars].
 */
function buildCORSHeaders(
  origin: string,
  allowedOriginsStr: string
): Record<string, string> | null {
  const allowed = allowedOriginsStr
    .split(/\s+/)
    .map((o) => o.trim())
    .filter(Boolean);

  if (!allowed.includes(origin)) return null;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

// ── In-memory rate limiter ─────────────────────────────────────────────────────

/**
 * Simple sliding-window rate limiter stored in a module-level Map.
 * Limits each IP to LIMIT requests per WINDOW_MS milliseconds.
 *
 * Limitations (acceptable for a portfolio):
 * - Resets on Worker isolate cold start.
 * - Not shared across Workers instances running in parallel.
 * - Can be bypassed with many different IPs.
 *
 * For production apps with real traffic, replace with a KV-backed limiter.
 */
const RATE_LIMIT = 10;         // requests per window
const WINDOW_MS = 60_000;      // 1 minute

const ipWindows = new Map<string, { count: number; windowStart: number }>();

function checkInMemoryRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = ipWindows.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window.
    ipWindows.set(ip, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
