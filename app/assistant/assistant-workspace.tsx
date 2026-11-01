"use client";

import { useEffect, useRef, useState } from "react";
import PortfolioHeader from "../portfolio-header";
import { FolderPageTransition } from "../folder-opening-screen";

const SUGGESTED = [
  "What's the best ML project?",
  "Which AWS certifications?",
  "Tell me about the research paper",
  "What roles fit me?",
  "What's the tech stack for MediPortal?",
  "Where is Yesha based?",
];

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; done: boolean };

/** Extracts https:// URLs from text, returns them deduplicated */
function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s,)\]]+/g) ?? [];
  const cleaned = matches.map((u) => u.replace(/[.,!?)]+$/, ""));
  return [...new Set(cleaned)];
}

/** Strips URLs from text for the main answer body */
function stripUrls(text: string): string {
  return text.replace(/https?:\/\/[^\s,)\]]+/g, "").replace(/\s{2,}/g, " ").trim();
}

/** Short readable label for a URL */
function urlLabel(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    return u.hostname + (path && path !== "/" ? path : "");
  } catch {
    return url;
  }
}

const THINKING_STEPS = [
  "Reading the question",
  "Searching portfolio data",
  "Composing answer",
];

export default function AssistantWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thinkingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Animate through thinking steps while loading
  useEffect(() => {
    if (loading) {
      setThinkingStep(0);
      thinkingTimer.current = setInterval(() => {
        setThinkingStep((s) => Math.min(s + 1, THINKING_STEPS.length - 1));
      }, 700);
    } else {
      if (thinkingTimer.current) clearInterval(thinkingTimer.current);
    }
    return () => { if (thinkingTimer.current) clearInterval(thinkingTimer.current); };
  }, [loading]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "assistant", text: "", done: false },
    ]);
    setLoading(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_ASSISTANT_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant") {
            updated[updated.length - 1] = { ...last, text: last.text + chunk };
          }
          return updated;
        });
      }

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant") {
          updated[updated.length - 1] = { ...last, done: true };
        }
        return updated;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            text: `Sorry, I couldn't get a response. (${msg})`,
            done: true,
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <FolderPageTransition folderName="portfolio/assistant" title="Loading assistant...">
      <main className="min-h-screen bg-[#fff7e6] px-5 pb-24 text-[#283149] sm:px-10 sm:pb-8 lg:px-16">
        <div className="mx-auto max-w-[1320px]">
          <PortfolioHeader />

          <div className="assistant-layout">
            {/* ── Main chat window ── */}
            <section className="assistant-window" aria-label="Chat with portfolio assistant">
              {/* title bar */}
              <div className="folder-browser__window-bar">
                <span aria-hidden="true" className="folder-browser__window-dot" />
                <span aria-hidden="true" className="folder-browser__window-dot" />
                <span className="ml-2">ask.md</span>
              </div>

              {/* message area */}
              <div className="assistant-messages" role="log" aria-live="polite" aria-label="Conversation">
                {messages.length === 0 && (
                  <div className="assistant-empty">
                    <p className="font-mono text-sm text-[#8a9abc]">Ask anything about Yesha&rsquo;s portfolio &mdash; projects, research, skills, or availability.</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  if (msg.role === "user") {
                    return (
                      <div key={i} className="assistant-message assistant-message--user">
                        <span className="assistant-bubble assistant-bubble--user">{msg.text}</span>
                      </div>
                    );
                  }

                  // Assistant message
                  const isLastMsg = i === messages.length - 1;
                  const isStreaming = isLastMsg && loading;
                  const urls = msg.done ? extractUrls(msg.text) : [];
                  const bodyText = msg.done ? stripUrls(msg.text) : msg.text;

                  return (
                    <div key={i} className="assistant-message assistant-message--assistant">
                      <div className="assistant-bubble assistant-bubble--assistant">

                        {/* Thinking steps — shown while streaming with no text yet */}
                        {isStreaming && !msg.text && (
                          <div className="assistant-thinking-steps" aria-label="Thinking">
                            {THINKING_STEPS.map((step, si) => (
                              <div
                                key={step}
                                className={`assistant-thinking-step${si <= thinkingStep ? " assistant-thinking-step--active" : ""}`}
                              >
                                <span className="assistant-thinking-step__dot" aria-hidden="true" />
                                <span className="font-mono text-xs">{step}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Answer body */}
                        {bodyText ? (
                          <span className="assistant-text">
                            {bodyText}
                            {isStreaming && <span className="assistant-cursor" aria-hidden="true">▌</span>}
                          </span>
                        ) : null}

                        {/* Source badges — shown after streaming is done */}
                        {msg.done && urls.length > 0 && (
                          <div className="assistant-sources">
                            <span className="assistant-sources__label">sources:</span>
                            {urls.map((url) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="assistant-source-badge"
                                aria-label={`Source: ${urlLabel(url)}`}
                              >
                                <span className="assistant-source-badge__icon" aria-hidden="true">
                                  <svg viewBox="0 0 16 12" width="14" height="10" fill="none">
                                    <rect x="0.5" y="2.5" width="15" height="9" rx="1.5" fill="#ff8f56" stroke="#283149" strokeWidth="1"/>
                                    <rect x="0.5" y="2.5" width="5.5" height="3" rx="1" fill="#ffce63" stroke="#283149" strokeWidth="1"/>
                                  </svg>
                                </span>
                                <span className="font-mono text-xs font-bold">{urlLabel(url)}</span>
                              </a>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* input bar */}
              <form
                className="assistant-input-row"
                onSubmit={(e) => { e.preventDefault(); ask(input); }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="assistant-input"
                  placeholder="Ask about my projects, research or AWS experience"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  aria-label="Your question"
                  maxLength={400}
                />
                <button
                  type="submit"
                  className="assistant-send-btn"
                  disabled={loading || !input.trim()}
                  aria-label="Ask"
                >
                  Ask
                </button>
              </form>
            </section>

            {/* ── Sidebar ── */}
            <aside className="assistant-sidebar" aria-label="Suggested questions">
              <h2 className="assistant-sidebar-title">Try asking</h2>
              <ul className="assistant-suggestions">
                {SUGGESTED.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="assistant-suggestion-btn"
                      onClick={() => ask(s)}
                      disabled={loading}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="assistant-sidebar-note">
                Powered by OpenAI. Answers come only from the content in this portfolio.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </FolderPageTransition>
  );
}
