"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PortfolioHeader from "../portfolio-header";
import { FolderPageTransition } from "../folder-opening-screen";

type AboutFile = "README.md" | "route.csv";

const routeRows = [
  { id: "1", city: "Berlin", country: "Germany", university: "BHT Berlin", chapter: "M.Sc. in Data Science", years: "2026–2028" },
  { id: "2", city: "Mumbai", country: "India", university: "Thakur College of Engineering and Technology", chapter: "B.Tech in AI/ML", years: "2021–2025" },
];

export default function AboutWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeFile, setActiveFile] = useState<AboutFile>(
    searchParams.get("tab") === "route" ? "route.csv" : "README.md"
  );
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    setActiveFile(tab === "route" ? "route.csv" : "README.md");
  }, [searchParams]);

  function switchTab(file: AboutFile) {
    setActiveFile(file);
    const params = new URLSearchParams(searchParams.toString());
    if (file === "route.csv") params.set("tab", "route");
    else params.delete("tab");
    router.replace(`/about?${params.toString()}`);
  }

  function copyEmail() {
    navigator.clipboard.writeText("yesha.raval04@gmail.com").then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  }
  return (
    <FolderPageTransition folderName="portfolio/about" title="Opening about...">
      <main className="min-h-screen bg-[#fff7e6] px-5 text-[#283149] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1320px]">
        <PortfolioHeader />

        <section className="folder-browser" aria-label="About files">
          <div className="folder-browser__toolbar">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={activeFile === "route.csv" ? "/about?tab=route" : "/about"}
                className="mb-0 inline-flex rounded-md border-2 border-[#283149] bg-[#ff8f56] px-3 py-1.5 font-mono text-xs font-semibold text-[#283149] hover:opacity-80 transition-opacity"
                aria-live="polite"
              >
                ~/portfolio/about/{activeFile}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-2" role="group" aria-label="About files">
                {(["README.md", "route.csv"] as const).map((file) => (
                  <button
                    key={file}
                    type="button"
                    aria-pressed={activeFile === file}
                    className={`folder-browser__control${activeFile === file ? " folder-browser__control--active" : ""}`}
                    onClick={() => switchTab(file)}
                  >
                    {file}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeFile === "README.md" && (
            <section className="folder-browser__content about-workspace__window" aria-label="README.md contents">
              <div className="folder-browser__window-bar">
                <span aria-hidden="true" className="folder-browser__window-dot" />
                <span aria-hidden="true" className="folder-browser__window-dot" />
                <span className="ml-2">README.md</span>
              </div>
              <div className="about-workspace__readme">
                <h1 className="readme-h1">Yesha Raval</h1>

                <p className="readme-p">
                  Software engineer building practical AI and cloud solutions.<br />
                  <strong>B.Tech in AI/ML, TCET Mumbai</strong> (May 2025, CGPA 9.57/10).<br />
                  <strong>M.Sc. in Data Science</strong> (in progress), BHT Berlin.
                </p>

                <h2 className="readme-h2">What I do</h2>
                <ul className="readme-ul">
                  <li><strong>ML:</strong> led <a href="https://dergipark.org.tr/en/pub/tuzal/article/1828786" target="_blank" rel="noreferrer" className="readme-link">GATE-DehazNet</a>, a satellite image dehazing model that combines GANs, attention and transformers and outperforms baselines.</li>
                  <li><strong>Data:</strong> turn data into usable insight in apps like <a href="https://medical-portal-beta.vercel.app/" target="_blank" rel="noreferrer" className="readme-link">Medi-Portal</a> and <a href="https://formula-dash.streamlit.app/" target="_blank" rel="noreferrer" className="readme-link">FormulaDash</a>.</li>
                  <li><strong>Cloud:</strong> build cloud-native AI applications on AWS infrastructure.</li>
                </ul>

                <h2 className="readme-h2">Highlights</h2>
                <ul className="readme-ul">
                  <li><strong>Research:</strong> <a href="https://dergipark.org.tr/en/pub/tuzal/article/1828786" target="_blank" rel="noreferrer" className="readme-link">GATE-DehazNet</a>, published in the Turkish Journal of Remote Sensing (Scopus indexed).</li>
                  <li><Link href="/files/certifications" className="readme-link"><strong>3x AWS certified</strong></Link> (verify on Credly).</li>
                  <li><strong>Projects:</strong> <a href="https://medical-portal-beta.vercel.app/" target="_blank" rel="noreferrer" className="readme-link">Medi-Portal</a> and <a href="https://formula-dash.streamlit.app/" target="_blank" rel="noreferrer" className="readme-link">FormulaDash</a>, both live.</li>
                  <li><strong>Languages:</strong> English (C1) · German (A2).</li>
                </ul>

                <h2 className="readme-h2">Find me</h2>
                <p className="readme-p readme-find-me">
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="readme-link readme-email-btn"
                    aria-label={emailCopied ? "Email copied!" : "Copy email address"}
                  >
                    <strong>{emailCopied ? "copied! ✓" : "yesha.raval04@gmail.com"}</strong>
                  </button>
                  <span aria-hidden="true"> · </span>
                  <a href="https://linkedin.com/in/yesha-raval04" target="_blank" rel="noreferrer" className="readme-link"><strong>linkedin.com/in/yesha-raval04</strong></a>
                  <span aria-hidden="true"> · </span>
                  <a href="https://github.com/YeshaRaval" target="_blank" rel="noreferrer" className="readme-link"><strong>github.com/YeshaRaval</strong></a>
                </p>
              </div>
            </section>
          )}

          {activeFile === "route.csv" && (
            <section className="about-route" aria-label="Route from Mumbai to Berlin">
              <div className="about-route__story">
                <h1 className="about-route__headline">Mumbai taught me where I come from, Berlin is showing me where I can go. </h1>
                <div className="about-route__table-window">
                  <div className="folder-browser__window-bar">
                    <span aria-hidden="true" className="folder-browser__window-dot" />
                    <span aria-hidden="true" className="folder-browser__window-dot" />
                    <span className="ml-2">route.csv</span>
                  </div>
                  <table className="about-route__table">
                    <thead>
                      <tr>
                        <th scope="col">id</th>
                        <th scope="col">city</th>
                        <th scope="col">country</th>
                        <th scope="col">university</th>
                        <th scope="col">chapter</th>
                        <th scope="col">years</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routeRows.map((row) => (
                        <tr key={row.id}>
                          <th scope="row">{row.id}</th>
                          <td>{row.city}</td>
                          <td>{row.country}</td>
                          <td>{row.university}</td>
                          <td>{row.chapter}</td>
                          <td>{row.years}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <figure className="about-route__map">
                <svg viewBox="0 0 320 320" role="img" aria-labelledby="route-map-title route-map-description">
                  <title id="route-map-title">Route from Mumbai to Berlin</title>
                  <desc id="route-map-description">A globe showing a dotted route from Mumbai, India to Berlin, Germany.</desc>
                  <defs>
                    <clipPath id="globe-clip"><circle cx="160" cy="160" r="123" /></clipPath>
                  </defs>
                  <circle cx="160" cy="160" r="123" fill="#ffce63" stroke="#283149" strokeWidth="3" />
                  <g clipPath="url(#globe-clip)" fill="none" stroke="#a88945" strokeWidth="1.5">
                    <ellipse cx="160" cy="160" rx="54" ry="123" />
                    <ellipse cx="160" cy="160" rx="123" ry="50" />
                    <path d="M37 160h246" />
                  </g>
                  <path d="M119 108 C154 94 196 96 216 181" fill="none" stroke="#283149" strokeWidth="3" strokeDasharray="7 6" />
                  <circle cx="119" cy="108" r="9" fill="#ff8f56" stroke="#283149" strokeWidth="3" />
                  <circle cx="216" cy="181" r="9" fill="#ff8f56" stroke="#283149" strokeWidth="3" />
                  <text x="80" y="94" fill="#283149" fontSize="14" fontWeight="700">Berlin</text>
                  <text x="225" y="207" fill="#283149" fontSize="14" fontWeight="700">Mumbai</text>
                </svg>
              </figure>
            </section>
          )}
        </section>
      </div>
    </main>
    </FolderPageTransition>
  );
}
