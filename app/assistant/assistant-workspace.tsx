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

export default function AssistantWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <main className="min-h-screen bg-[#fff7e6] px-5 text-[#283149] sm:px-10 lg:px-16">
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

                {messages.map((msg, i) => (
                  <div key={i} className={`assistant-message assistant-message--${msg.role}`}>
                    {msg.role === "user" ? (
                      <span className="assistant-bubble assistant-bubble--user">{msg.text}</span>
                    ) : (
                      <div className="assistant-bubble assistant-bubble--assistant">
                        {msg.text || (
                          <span className="assistant-thinking" aria-label="Thinking">
                            <span className="font-mono text-xs text-[#283149]">
                              <span className="assistant-thinking-dot" />
                              <span className="assistant-thinking-dot" />
                              <span className="assistant-thinking-dot" />
                            </span>
                          </span>
                        )}
                        {msg.role === "assistant" && !msg.done && msg.text && (
                          <span className="assistant-cursor" aria-hidden="true">▌</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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
