"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import PortfolioHeader from "../portfolio-header";
import { FolderPageTransition } from "../folder-opening-screen";

const contactEmail = "yesha.raval04@gmail.com";

function sendContactMessage(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const message = String(formData.get("message") ?? "");
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);

  window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
}

export default function ContactWorkspace() {
  const [copyNotice, setCopyNotice] = useState<"copied" | "error" | null>(null);

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

  return (
    <FolderPageTransition folderName="portfolio/contact" title="Opening contact...">
      <main className="min-h-screen bg-[#fff7e6] px-5 text-[#283149] sm:px-10 lg:px-16">
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

            <form className="overflow-hidden rounded-xl border-2 border-[#283149] bg-white shadow-[6px_6px_0_#283149]" onSubmit={sendContactMessage}>
              <div className="folder-browser__window-bar">
                <span aria-hidden="true" className="folder-browser__window-dot" />
                <span aria-hidden="true" className="folder-browser__window-dot" />
                <span className="ml-2">new_row.csv</span>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="grid min-w-0 gap-2 font-mono text-xs">
                    <span>name</span>
                    <input className="min-h-12 w-full min-w-0 rounded-[11px] border-2 border-[#283149] bg-white px-4 py-3 font-sans text-base text-[#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e]" autoComplete="name" name="name" placeholder="Your name" required />
                  </label>
                  <label className="grid min-w-0 gap-2 font-mono text-xs">
                    <span>email</span>
                    <input className="min-h-12 w-full min-w-0 rounded-[11px] border-2 border-[#283149] bg-white px-4 py-3 font-sans text-base text-[#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e]" autoComplete="email" name="email" type="email" placeholder="you@company.com" required />
                  </label>
                  <label className="grid min-w-0 gap-2 font-mono text-xs sm:col-span-2">
                    <span>message</span>
                    <textarea className="min-h-36 w-full min-w-0 resize-y rounded-[11px] border-2 border-[#283149] bg-white px-4 py-3 font-sans text-base text-[#283149] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#17795e]" name="message" placeholder="What would you like to talk about?" required />
                  </label>
                </div>

                <button type="submit" className="folder-action folder-action--primary mt-5">
                  Add this row and send →
                </button>
              </div>
            </form>
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
