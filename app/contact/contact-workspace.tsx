"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PortfolioHeader from "../portfolio-header";
import { FolderPageTransition } from "../folder-opening-screen";

const contactEmail = "yesha.raval04@gmail.com";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "7ae54606-55c8-47b6-9a43-e069dc5663fe";

type FormState = "idle" | "submitting" | "success" | "error";

type FieldErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function validateFields(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name.trim()) errors.name = "Name is required.";
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!data.subject.trim()) errors.subject = "Subject is required.";
  if (!data.message.trim()) {
    errors.message = "Message is required.";
  } else if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }
  return errors;
}

export default function ContactWorkspace() {
  const [copyNotice, setCopyNotice] = useState<"copied" | "error" | null>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!copyNotice) return;
    const timeout = window.setTimeout(() => setCopyNotice(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [copyNotice]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopyNotice("copied");
    } catch {
      setCopyNotice("error");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formState === "submitting") return; // prevent double-submit

    const formData = new FormData(event.currentTarget);
    const fields = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    // Client-side validation
    const errors = validateFields(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormState("submitting");

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          name: fields.name,
          email: fields.email,
          subject: fields.subject,
          message: fields.message,
          // Honeypot — bots fill this, humans don't
          botcheck: formData.get("botcheck") ?? "",
          // Metadata shown in the Web3Forms dashboard
          from_name: "Yesha Raval Portfolio",
        }),
      });

      const json = await res.json() as { success: boolean; message?: string };

      if (json.success) {
        setFormState("success");
        formRef.current?.reset(); // clear only on success
      } else {
        setErrorMessage(json.message ?? "Submission failed. Please try again.");
        setFormState("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  }

  const isSubmitting = formState === "submitting";

  return (
    <FolderPageTransition folderName="portfolio/contact" title="Opening contact...">
      <main className="min-h-screen bg-[#fff7e6] px-5 pb-24 text-[#283149] sm:px-10 sm:pb-8 lg:px-16">
      <div className="mx-auto max-w-[1320px]">
        <PortfolioHeader />

        <section className="grid grid-cols-1 items-start gap-8 py-5 lg:grid-cols-[1.2fr_0.9fr]" aria-labelledby="contact-title">
          <div>
            <Link href="/contact" className="mb-5 inline-flex rounded-md border-2 border-[#283149] bg-[#ff8f56] px-3 py-1.5 font-mono text-xs font-semibold text-[#283149] hover:opacity-80 transition-opacity">
              ~/portfolio/contact.csv
            </Link>
            <h1 id="contact-title" className="mb-5 text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.045em]">
              Add a row to my inbox.
            </h1>

            {formState === "success" ? (
              <div className="overflow-hidden rounded-xl border-2 border-[#283149] bg-white shadow-[6px_6px_0_#283149]">
                <div className="folder-browser__window-bar">
                  <span aria-hidden="true" className="folder-browser__window-dot" />
                  <span aria-hidden="true" className="folder-browser__window-dot" />
                  <span className="ml-2">sent.csv</span>
                </div>
                <div className="p-6 text-center">
                  <p className="mb-2 text-3xl" aria-hidden="true">✓</p>
                  <p className="font-bold text-lg">Row added successfully.</p>
                  <p className="mt-1 font-mono text-sm text-[#45516b]">
                    Message received — I&rsquo;ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    className="folder-action folder-action--primary mt-5"
                    onClick={() => setFormState("idle")}
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form
                ref={formRef}
                className="overflow-hidden rounded-xl border-2 border-[#283149] bg-white shadow-[6px_6px_0_#283149]"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="folder-browser__window-bar">
                  <span aria-hidden="true" className="folder-browser__window-dot" />
                  <span aria-hidden="true" className="folder-browser__window-dot" />
                  <span className="ml-2">new_row.csv</span>
                </div>

                {/* Honeypot — hidden from real users, traps bots */}
                <input type="checkbox" name="botcheck" className="hidden" aria-hidden="true" tabIndex={-1} />

                <div className="p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <label className="grid min-w-0 gap-2 font-mono text-xs">
                      <span>name</span>
                      <input
                        className={`min-h-12 w-full min-w-0 rounded-[11px] border-2 bg-white px-4 py-3 font-sans text-base text-[#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e] ${fieldErrors.name ? "border-red-500" : "border-[#283149]"}`}
                        autoComplete="name"
                        name="name"
                        placeholder="Your name"
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.name ? "err-name" : undefined}
                      />
                      {fieldErrors.name && <span id="err-name" className="font-mono text-[11px] text-red-600">{fieldErrors.name}</span>}
                    </label>

                    {/* Email */}
                    <label className="grid min-w-0 gap-2 font-mono text-xs">
                      <span>email</span>
                      <input
                        className={`min-h-12 w-full min-w-0 rounded-[11px] border-2 bg-white px-4 py-3 font-sans text-base text-[#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e] ${fieldErrors.email ? "border-red-500" : "border-[#283149]"}`}
                        autoComplete="email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.email ? "err-email" : undefined}
                      />
                      {fieldErrors.email && <span id="err-email" className="font-mono text-[11px] text-red-600">{fieldErrors.email}</span>}
                    </label>

                    {/* Subject */}
                    <label className="grid min-w-0 gap-2 font-mono text-xs sm:col-span-2">
                      <span>subject</span>
                      <input
                        className={`min-h-12 w-full min-w-0 rounded-[11px] border-2 bg-white px-4 py-3 font-sans text-base text-[#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e] ${fieldErrors.subject ? "border-red-500" : "border-[#283149]"}`}
                        name="subject"
                        placeholder="Internship opportunity · Collaboration · Just saying hi"
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.subject ? "err-subject" : undefined}
                      />
                      {fieldErrors.subject && <span id="err-subject" className="font-mono text-[11px] text-red-600">{fieldErrors.subject}</span>}
                    </label>

                    {/* Message */}
                    <label className="grid min-w-0 gap-2 font-mono text-xs sm:col-span-2">
                      <span>message</span>
                      <textarea
                        className={`min-h-36 w-full min-w-0 resize-y rounded-[11px] border-2 bg-white px-4 py-3 font-sans text-base text-[#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e] ${fieldErrors.message ? "border-red-500" : "border-[#283149]"}`}
                        name="message"
                        placeholder="What would you like to talk about?"
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.message ? "err-message" : undefined}
                      />
                      {fieldErrors.message && <span id="err-message" className="font-mono text-[11px] text-red-600">{fieldErrors.message}</span>}
                    </label>
                  </div>

                  {/* Error banner */}
                  {formState === "error" && (
                    <p className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 px-4 py-3 font-mono text-xs text-red-700" role="alert">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="folder-action folder-action--primary mt-5"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? "Sending…" : "Add this row and send →"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="rounded-xl border-2 border-[#283149] bg-[#ffce63] p-5 shadow-[6px_6px_0_#283149] lg:mt-32" aria-label="Contact links and downloads">
            <p className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold"><span className="h-[9px] w-[9px] flex-none rounded-full bg-[#283149]" aria-hidden="true" />status: open to internships / werkstudent roles</p>
            <div className="grid gap-3">
              <button className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-[10px] border-2 border-[#283149] bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#283149] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-[#fff7e6] hover:shadow-[3px_3px_0_#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e] active:translate-y-0 active:shadow-none" type="button" onClick={copyEmail} aria-label={`Copy email address ${contactEmail}`}>
                <span>Email</span><span className="font-mono text-xs font-normal">{contactEmail}</span>
              </button>
              <a className="flex min-h-12 items-center justify-between gap-3 rounded-[10px] border-2 border-[#283149] bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#283149] no-underline transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-[#fff7e6] hover:shadow-[3px_3px_0_#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e] active:translate-y-0 active:shadow-none" href="https://www.linkedin.com/in/yesha-raval04/" target="_blank" rel="noreferrer">
                <span>LinkedIn</span><span className="font-mono text-xs font-normal">/in/yesha-raval04/</span>
              </a>
              <a className="flex min-h-12 items-center justify-between gap-3 rounded-[10px] border-2 border-[#283149] bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#283149] no-underline transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-[#fff7e6] hover:shadow-[3px_3px_0_#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e] active:translate-y-0 active:shadow-none" href="https://github.com/YeshaRaval" target="_blank" rel="noreferrer">
                <span>GitHub</span><span className="font-mono text-xs font-normal">/YeshaRaval</span>
              </a>
              <a
                href="/Yesha_Raval_CV.pdf"
                download="Yesha_Raval_CV.pdf"
                className="flex min-h-12 items-center justify-between gap-3 rounded-[10px] border-2 border-[#283149] bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#283149] transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#283149]"
              >
                <span>Download resume</span><span className="font-mono text-xs font-normal">pdf</span>
              </a>
            </div>
          </aside>
        </section>
      </div>
      {copyNotice && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border-2 border-[#283149] bg-[#ffce63] px-4 py-3 font-semibold text-[#283149] shadow-[4px_4px_0_#283149]" role="status" aria-live="polite">
          {copyNotice === "copied" ? "Email copied" : "Could not copy email"}
        </div>
      )}
    </main>
    </FolderPageTransition>
  );
}
