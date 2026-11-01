/**
 * openai.ts
 *
 * Calls the OpenAI Responses API with streaming enabled.
 * Parses the server-sent events (SSE) stream and forwards
 * ONLY the generated text deltas as raw UTF-8 chunks to the
 * returned ReadableStream — matching the contract the frontend
 * already expects from the previous Bedrock implementation.
 *
 * SSE format reference:
 *   https://platform.openai.com/docs/api-reference/responses/streaming
 *
 * Relevant event types we care about:
 *   response.output_text.delta  → { delta: string }  — stream text chunks
 *   response.completed          → signals clean completion
 *   error                       → signals an API-level error
 *
 * All other event types are silently skipped.
 */

import { SYSTEM_PROMPT } from "./portfolio";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

/** Shape of the Env bindings declared in wrangler.toml + Worker secrets. */
export interface Env {
  OPENAI_API_KEY: string;     // secret — set via `wrangler secret put OPENAI_API_KEY`
  OPENAI_MODEL: string;       // var   — set in wrangler.toml [vars]
  ALLOWED_ORIGINS: string;    // var   — space-separated list of allowed origins
  MAX_QUESTION_LENGTH: string; // var  — maximum chars in a question
  // RATE_LIMIT_STORE: KVNamespace; // uncomment after creating KV namespace
}

/**
 * Calls OpenAI and returns a ReadableStream of raw UTF-8 text chunks.
 * The stream closes normally on completion or error.
 * On error, a human-readable message is written to the stream before closing
 * so the frontend can display it — no internal details are exposed.
 */
export function streamOpenAIResponse(
  question: string,
  env: Env
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let openaiResponse: Response | undefined;

      try {
        openaiResponse = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: env.OPENAI_MODEL,
            stream: true,
            max_output_tokens: 512,
            input: question,
            instructions: SYSTEM_PROMPT,
          }),
        });

        if (!openaiResponse.ok) {
          // Read body only to construct a safe error — never forward raw OpenAI errors.
          const status = openaiResponse.status;
          if (status === 401) {
            controller.enqueue(encoder.encode("Configuration error: the assistant is not properly set up. Please contact the site owner."));
          } else if (status === 429) {
            controller.enqueue(encoder.encode("The assistant is receiving too many requests right now. Please try again in a moment."));
          } else {
            controller.enqueue(encoder.encode(`The assistant encountered an error (${status}). Please try again.`));
          }
          controller.close();
          return;
        }

        if (!openaiResponse.body) {
          controller.enqueue(encoder.encode("The assistant returned an empty response. Please try again."));
          controller.close();
          return;
        }

        // Parse the SSE stream line-by-line.
        await parseSSEStream(openaiResponse.body, controller, encoder);

      } catch (err) {
        // Network errors, fetch failures, etc.
        const isAbort = err instanceof Error && err.name === "AbortError";
        if (!isAbort) {
          // Only write an error message if the stream hasn't already closed.
          try {
            controller.enqueue(encoder.encode("\n\nSorry, I couldn't reach the assistant. Please check your connection and try again."));
          } catch {
            // Stream already closed — nothing to do.
          }
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed — fine.
        }
      }
    },

    cancel() {
      // Client disconnected. The `finally` block in `start` handles cleanup.
    },
  });
}

/**
 * Reads the OpenAI SSE response body line by line.
 * For each `response.output_text.delta` event, enqueues the delta text.
 * Stops cleanly on `response.completed` or `[DONE]`.
 * Throws on `error` events (caught by the caller's try/catch).
 */
async function parseSSEStream(
  body: ReadableStream<Uint8Array>,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      // Append new chunk to buffer and process complete lines.
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last (potentially incomplete) line in the buffer.
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();

        // SSE comment or blank line — skip.
        if (trimmed === "" || trimmed.startsWith(":")) continue;

        // `data: [DONE]` — OpenAI signals end of stream.
        if (trimmed === "data: [DONE]") return;

        // All SSE data lines start with "data: ".
        if (!trimmed.startsWith("data: ")) continue;

        const jsonStr = trimmed.slice(6); // remove "data: " prefix

        let event: OpenAIStreamEvent;
        try {
          event = JSON.parse(jsonStr) as OpenAIStreamEvent;
        } catch {
          // Malformed JSON in stream — skip this line.
          continue;
        }

        // The event type we care about: text delta.
        if (event.type === "response.output_text.delta") {
          const delta = event.delta;
          if (typeof delta === "string" && delta.length > 0) {
            controller.enqueue(encoder.encode(delta));
          }
        }

        // Clean completion signal — return normally.
        if (event.type === "response.completed") {
          return;
        }

        // API-level error event — surface a safe message.
        if (event.type === "error") {
          controller.enqueue(encoder.encode("\n\nThe assistant encountered an error. Please try again."));
          return;
        }
      }
    }

    // Flush any remaining buffer content (shouldn't normally have parseable data).
    // If there's a partial line left we skip it — it won't be a complete SSE event.

  } finally {
    // Always release the reader lock so the response body can be garbage collected.
    try {
      reader.releaseLock();
    } catch {
      // Already released.
    }
  }
}

/** Minimal type definitions for the OpenAI Responses API SSE events we handle. */
type OpenAIStreamEvent =
  | { type: "response.output_text.delta"; delta: string }
  | { type: "response.completed" }
  | { type: "error"; message?: string }
  | { type: string; [key: string]: unknown }; // catch-all for other event types
