"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PortfolioHeader from "./portfolio-header";
import { FolderOpeningScreen } from "./folder-opening-screen";
import { FolderPageTransition } from "./folder-opening-screen";

const LOADER_SESSION_KEY = "yesha-portfolio-loader-complete";
const LOADER_DURATION_MS = 650;

const profileFacts = [
  { label: "FIELD", description: "Data Science, Machine Learning and Cloud Engineering" },
  { label: "BACKGROUND", description: "MSc in Data Science, BTech in AIML" },
  { label: "CLOUD", description: "3x AWS certified: AI Practitioner, Solutions Architect, Developer" },
  { label: "RESEARCH", description: "Generative AI : Dehazing Satellite Imagery" },
];

const portfolioFolders = [
  { id: "projects-folder", name: "projects/", count: "5 files", color: "orange" },
  { id: "research-folder", name: "research/", count: "1 file", color: "gold" },
  { id: "certifications-folder", name: "certifications/", count: "3 files", color: "gold" },
  { id: "skills-folder", name: "skills/", count: "6 files", color: "orange" },
] as const;

type FolderColor = (typeof portfolioFolders)[number]["color"];
type FolderId = (typeof portfolioFolders)[number]["id"];
type FileType = "project" | "research" | "cert" | "skill" | "about" | "contact";
type FileFilter = "all" | FileType;
type FileView = "table" | "raw" | "cards";

type PortfolioFile = {
  id: string;
  type: FileType;
  title: string;
  domain: string;
  stack: string[];
  year: string;
  outcome: string;
  externalUrl?: string;
  githubUrl?: string;
  internalUrl?: string;
};

const portfolioFiles: PortfolioFile[] = [
  { id: "01", type: "project", title: "Travel AI – Dream Trip Planned by AI", domain: "Travel planning", stack: ["Next.js", "Azure Cosmos DB", "OpenWeatherMap API", "OpenAI API"], year: "2025", outcome: "live demo", externalUrl: "https://ai-travel-guide-blush.vercel.app/", githubUrl: "https://github.com/YeshaRaval/ai-travel-guide" },
  { id: "02", type: "project", title: "MediPortal – Healthcare Management", domain: "Healthcare", stack: ["Next.js", "TypeScript", "Tailwind CSS", "OpenAI API"], year: "2024", outcome: "live demo", externalUrl: "https://medical-portal-beta.vercel.app/", githubUrl: "https://github.com/YeshaRaval/medical-portal" },
  { id: "03", type: "project", title: "FormulaDash – F1 Analytics", domain: "F1 analytics", stack: ["Python", "Streamlit", "Plotly", "Streamlit Cloud"], year: "2025", outcome: "live demo", externalUrl: "https://formula-dash.streamlit.app/", githubUrl: "https://github.com/YeshaRaval/formula-dash" },
  { id: "04", type: "project", title: "Billing & Dashboard – Aastha Apparel Atelier", domain: "Retail billing", stack: ["Next.js", "PDF generation", "Cloud hosting"], year: "2024", outcome: "live demo", externalUrl: "https://aastha-billing.vercel.app/" },
  { id: "05", type: "project", title: "StatSense – Automated EDA", domain: "Data analytics", stack: ["Python", "Streamlit", "Scikit-learn", "Matplotlib"], year: "2023", outcome: "live demo", externalUrl: "https://stat-sense.streamlit.app/", githubUrl: "https://github.com/YeshaRaval/StatSense" },
  { id: "06", type: "research", title: "GATE-Dehaze: A GAN-attention-transformer ensemble for satellite image dehazing", domain: "Remote sensing", stack: ["GAN", "Attention", "Transformer"], year: "2026", outcome: "published", externalUrl: "https://dergipark.org.tr/en/pub/tuzal/article/1828786" },
  { id: "07", type: "cert", title: "AWS Certified AI Practitioner", domain: "Foundational", stack: ["AWS"], year: "May 2025", outcome: "earned", externalUrl: "https://www.credly.com/badges/ed087278-5b33-40dc-8b7b-31fa7b5ee958/public_url" },
  { id: "08", type: "cert", title: "AWS Certified Solutions Architect – Associate", domain: "Associate", stack: ["AWS"], year: "Jan 2026", outcome: "earned", externalUrl: "https://www.credly.com/badges/2b15bf28-4a64-403b-b975-79407673a0a9/public_url" },
  { id: "09", type: "cert", title: "AWS Certified Developer – Associate", domain: "Associate", stack: ["AWS"], year: "Feb 2026", outcome: "earned", externalUrl: "https://www.credly.com/badges/c531c373-885a-4297-bc90-2459873d1857/public_url" },
  { id: "10", type: "skill", title: "Programming Languages", domain: "Programming", stack: ["HTML", "CSS", "JavaScript", "Python", "Java", "SQL"], year: "", outcome: "skills" },
  { id: "11", type: "skill", title: "AI/ML", domain: "Artificial intelligence", stack: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "GANs"], year: "", outcome: "skills" },
  { id: "12", type: "skill", title: "Frameworks & Libraries", domain: "Development", stack: ["TensorFlow", "PyTorch", "OpenCV", "Scikit-learn"], year: "", outcome: "skills" },
  { id: "13", type: "skill", title: "Web & Tools", domain: "Web development", stack: ["Next.js", "React.js", "REST APIs", "Git", "GitHub"], year: "", outcome: "skills" },
  { id: "14", type: "skill", title: "AWS", domain: "Cloud", stack: ["EC2", "ELB", "Auto Scaling", "S3", "Amazon VPC", "Lambda", "API Gateway", "Cognito", "Amazon Bedrock", "Amazon SageMaker"], year: "", outcome: "skills" },
  { id: "15", type: "skill", title: "Databases", domain: "Data storage", stack: ["MySQL", "MongoDB", "Redis"], year: "", outcome: "skills" },
  { id: "16", type: "contact", title: "contact.csv", domain: "contact", stack: ["email", "linkedin", "github"], year: "2025", outcome: "available", internalUrl: "/contact" },
  { id: "17", type: "about", title: "README.md", domain: "about", stack: ["Markdown"], year: "2025", outcome: "profile", internalUrl: "/about" },
  { id: "18", type: "about", title: "route.csv", domain: "about", stack: ["CSV"], year: "2025", outcome: "Mumbai → Berlin", internalUrl: "/about?tab=route" },
];

const fileFilters: { id: FileFilter; label: string; count: number }[] = [
  { id: "all", label: "All", count: portfolioFiles.length },
  { id: "project", label: "Projects", count: portfolioFiles.filter((file) => file.type === "project").length },
  { id: "research", label: "Research", count: portfolioFiles.filter((file) => file.type === "research").length },
  { id: "cert", label: "Certifications", count: portfolioFiles.filter((file) => file.type === "cert").length },
  { id: "skill", label: "Skills", count: portfolioFiles.filter((file) => file.type === "skill").length },
  { id: "about", label: "About", count: portfolioFiles.filter((file) => file.type === "about").length },
  { id: "contact", label: "Contact", count: portfolioFiles.filter((file) => file.type === "contact").length },
];

const fileRoutes: Partial<Record<FileFilter, string>> = {
  all: "/files",
  project: "/files/projects",
  research: "/files/research",
  cert: "/files/certifications",
  skill: "/files/skills",
  about: "/files/about",
  contact: "/files/contact",
};

function FolderIcon({ color, size = "md" }: { color: FolderColor; size?: "md" | "lg" }) {
  const bodyColor = color === "gold" ? "#ffce63" : "#ff8f56";
  const tabColor = color === "gold" ? "#ff8f56" : "#ffce63";
  const w = size === "lg" ? 148 : 110;
  const h = size === "lg" ? 124 : 92;

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 110 92" className={size === "lg" ? "h-[124px] w-[148px]" : "h-[92px] w-[110px]"} style={{ filter: "drop-shadow(5px 5px 0 #283149)" }}>
      <path d="M3 17a6 6 0 0 1 6-6h31l10 13h55v58H3z" fill={bodyColor} />
      <path d="M3 17a6 6 0 0 1 6-6h31l10 13H3z" fill={tabColor} />
    </svg>
  );
}

// FolderOpeningScreen is imported from ./folder-opening-screen

type PortfolioBrowserProps = {
  filter: FileFilter;
  view: FileView;
  rows: PortfolioFile[];
  onFilterChange: (filter: FileFilter) => void;
  onViewChange: (view: FileView) => void;
  onNavigate: (path: string) => void;
};

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function PortfolioBrowser({
  filter,
  view,
  rows,
  onFilterChange,
  onViewChange,
  onNavigate,
}: PortfolioBrowserProps) {
  const csvContent = [
    "id,type,title,domain,stack,year,outcome",
    ...rows.map((row) => [row.id, row.type, row.title, row.domain, row.stack.join(" | "), row.year, row.outcome].map(csvCell).join(",")),
  ].join("\n");
  return (
    <section className="folder-browser" aria-label="Portfolio file browser">
      <div className="folder-browser__toolbar">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={fileRoutes[filter] ?? "/files"}
            className="inline-flex rounded-md border-2 border-[#283149] bg-[#ff8f56] px-3 py-1.5 font-mono text-xs font-semibold text-[#283149] hover:opacity-80 transition-opacity"
          >
            ~/portfolio/{filter === "all" ? "files" : filter === "cert" ? "certifications" : `${filter}s`}
          </Link>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="File display mode">
          {(["cards", "raw"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              className={`folder-browser__control${view === item ? " folder-browser__control--active" : ""}`}
              onClick={() => onViewChange(item)}
            >
              {item === "raw" ? "CSV" : "Cards"}
            </button>
          ))}
        </div>
      </div>

      <div className={`folder-browser__layout${view === "cards" ? " folder-browser__layout--cards" : ""}`}>
        <nav className="folder-browser__sidebar" aria-label="Portfolio folders">
          <h2 className="folder-browser__sidebar-title">Folders</h2>
          <div className="folder-browser__folder-list" role="group" aria-label="Filter files by folder">
            {fileFilters.map((item) => {
              const href = fileRoutes[item.id];
              const className = `folder-browser__folder-link${filter === item.id ? " folder-browser__folder-link--active" : ""}`;
              const label = <>
                <span>{item.id === "all" ? "all/" : `${item.label.toLowerCase()}/`}</span>
                <span className="folder-browser__folder-count">{item.count}</span>
              </>;

              return href ? (
                <Link key={item.id} href={href} aria-current={filter === item.id ? "page" : undefined} className={className}>
                  {label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filter === item.id}
                  className={className}
                  onClick={() => onFilterChange(item.id)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="folder-browser__content">
          <div className="folder-browser__window-bar">
            <span aria-hidden="true" className="folder-browser__window-dot" />
            <span aria-hidden="true" className="folder-browser__window-dot" />
            <span className="ml-2">portfolio.csv</span>
          </div>
          {view === "table" && (
            <div className="w-full min-w-0">
              <table className="folder-file-table">
                <thead>
                  <tr className="folder-file-table__letters">
                    <th scope="col"> </th><th scope="col">A</th><th scope="col">B</th><th scope="col">C</th><th scope="col">D</th><th scope="col">E</th><th scope="col">F</th><th scope="col">G</th>
                  </tr>
                  <tr className="folder-file-table__headers">
                    <th scope="col">#</th><th scope="col">id</th><th scope="col">type</th><th scope="col">title</th><th scope="col">domain</th><th scope="col">stack</th><th scope="col">year</th><th scope="col">outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const openExternalPage = () => {
                      if (row.externalUrl) {
                        window.open(row.externalUrl, "_blank", "noopener,noreferrer");
                      }
                    };
                    const isClickable = !!(row.externalUrl || row.internalUrl);

                    return (
                      <tr
                        key={row.id}
                        className={isClickable ? "folder-file-table__credential-row" : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        aria-label={isClickable ? `Open ${row.type === "cert" ? "credential verification" : row.type === "research" ? "research paper" : row.type === "about" || row.type === "contact" ? row.title : "live project"}${row.externalUrl ? " in a new tab" : ""}` : undefined}
                        onClick={isClickable ? () => {
                          if (row.externalUrl) openExternalPage();
                          else if (row.internalUrl) onNavigate(row.internalUrl);
                        } : undefined}
                        onKeyDown={isClickable ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            if (row.externalUrl) openExternalPage();
                            else if (row.internalUrl) onNavigate(row.internalUrl);
                          }
                        } : undefined}
                      >
                        <td>{index + 1}</td>
                        <td>{row.id}</td>
                        <td>{row.type}</td>
                        <td>{row.title}</td>
                        <td>{row.domain}</td>
                        <td>{row.stack.join(" · ")}</td>
                        <td>{row.year}</td>
                        <td>{row.outcome}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="folder-browser__table-footer">{rows.length} rows · 7 columns · sorted by year ↓</p>
            </div>
          )}

          {view === "raw" && <pre className="folder-browser__raw">{csvContent}</pre>}

          {view === "cards" && (
            <div className="folder-file-cards">
              {rows.map((row, index) => {
                const card = (
                  <article className={`folder-file-card${index % 2 === 1 ? " folder-file-card--orange" : ""}`}>
                    <span className="folder-file-card__badge" aria-hidden="true">
                      {row.stack.includes("AWS") ? "AWS" : row.type.slice(0, 3).toUpperCase()}
                    </span>
                    <h2 className="folder-file-card__title">{row.title}</h2>
                    <div className="folder-file-card__tags">
                      {row.type === "cert" ? (
                        <span className="folder-browser__tag">{row.domain}</span>
                      ) : (
                        row.stack.map((item) => <span key={item} className="folder-browser__tag">{item}</span>)
                      )}
                      {row.year && <span className="folder-browser__tag">{row.year}</span>}
                    </div>
                    <div className="folder-file-card__actions">
                      {row.externalUrl ? (
                        <span className="folder-file-card__link">
                          {row.type === "cert" ? "Verify credential ↗" : row.type === "research" ? "Read paper ↗" : "View project ↗"}
                        </span>
                      ) : row.internalUrl ? (
                        <span className="folder-file-card__link">
                          {row.type === "contact" ? "Open contact ↗" : "Open file ↗"}
                        </span>
                      ) : row.type !== "skill" ? (
                        <button type="button" disabled className="folder-file-card__link">
                          Open write-up ↗
                        </button>
                      ) : null}
                      {row.githubUrl && (
                        <a
                          href={row.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View source code for ${row.title} on GitHub`}
                          className="folder-file-card__github-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  </article>
                );

                return row.externalUrl ? (
                  <a
                    key={row.id}
                    className="folder-file-card__anchor"
                    href={row.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${row.type === "cert" ? "credential verification" : row.type === "research" ? "research paper" : "live project"} for ${row.title} in a new tab`}
                  >
                    {card}
                  </a>
                ) : row.internalUrl ? (
                  <Link
                    key={row.id}
                    href={row.internalUrl}
                    className="folder-file-card__anchor"
                    aria-label={`Open ${row.title}`}
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={row.id}>{card}</div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </section>
  );
}

type PortfolioRoute = "home" | "files" | "projects" | "research" | "certifications" | "skills" | "about" | "contact";

const routeDefaults: Record<Exclude<PortfolioRoute, "home" | "about" | "contact">, { filter: FileFilter; folder: FolderId }> = {
  files: { filter: "all", folder: "projects-folder" },
  projects: { filter: "project", folder: "projects-folder" },
  research: { filter: "research", folder: "research-folder" },
  certifications: { filter: "cert", folder: "certifications-folder" },
  skills: { filter: "skill", folder: "skills-folder" },
};

export default function PortfolioExperience({ route = "home" }: { route?: PortfolioRoute }) {
  const router = useRouter();
  const isHomeRoute = route === "home";
  const routeDefault = (isHomeRoute || route === "about" || route === "contact") ? null : routeDefaults[route as Exclude<PortfolioRoute, "home" | "about" | "contact">];
  const [isLoading, setIsLoading] = useState(isHomeRoute);
  const [animateLoader, setAnimateLoader] = useState(false);
  const [contentVisible, setContentVisible] = useState(!isHomeRoute);
  const [screen, setScreen] = useState<"home" | "opening" | "browser">(isHomeRoute ? "home" : "browser");
  const [activeNavId, setActiveNavId] = useState<"files" | "charts" | "role-fit">(route === "research" ? "charts" : route === "skills" ? "role-fit" : "files");
  const [activeFolderId, setActiveFolderId] = useState<FolderId>(routeDefault?.folder ?? "projects-folder");
  const [activeFilter, setActiveFilter] = useState<FileFilter>(routeDefault?.filter ?? "all");
  // Default to cards always (table view removed)
  const [fileView, setFileView] = useState<FileView>("cards");
  const loaderRef = useRef<HTMLDivElement>(null);
  const homeHeadingRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<number | null>(null);
  const openingTimerRef = useRef<number | null>(null);
  const activeFolder = portfolioFolders.find((folder) => folder.id === activeFolderId) ?? portfolioFolders[0];
  const visibleFiles = portfolioFiles.filter((file) => activeFilter === "all" || file.type === activeFilter);
  const headerActive = route === "research" ? "charts" : route === "skills" ? "role-fit" : activeNavId;

  function openFolder(folderId: FolderId) {
    const filtersByFolder: Record<FolderId, FileFilter> = {
      "projects-folder": "project",
      "research-folder": "research",
      "certifications-folder": "cert",
      "skills-folder": "skill",
    };
    const filter = filtersByFolder[folderId];
    const navId: "files" | "charts" | "role-fit" = folderId === "research-folder" ? "charts" : folderId === "skills-folder" ? "role-fit" : "files";
    const destinationByFolder: Record<FolderId, string> = {
      "projects-folder": "/files/projects",
      "research-folder": "/files/research",
      "certifications-folder": "/files/certifications",
      "skills-folder": "/files/skills",
    };
    const destination = destinationByFolder[folderId];

    if (openingTimerRef.current !== null) clearTimeout(openingTimerRef.current);
    setActiveFolderId(folderId);
    setActiveFilter(filter);
    setFileView("cards");
    setActiveNavId(navId);
    setScreen("opening");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      if (destination) {
        router.push(destination);
        return;
      }
      setScreen("browser");
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    openingTimerRef.current = window.setTimeout(() => {
      openingTimerRef.current = null;
      if (destination) {
        router.push(destination);
        return;
      }
      setScreen("browser");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 600);
  }

  function changeFileFilter(filter: FileFilter) {
    const foldersByFilter: Record<FileFilter, FolderId> = {
      all: "projects-folder",
      project: "projects-folder",
      research: "research-folder",
      cert: "certifications-folder",
      skill: "skills-folder",
      about: "projects-folder",
      contact: "projects-folder",
    };
    setActiveFilter(filter);
    setActiveFolderId(foldersByFilter[filter]);
    setActiveNavId(filter === "research" ? "charts" : filter === "skill" ? "role-fit" : "files");
  }

  const finishLoading = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const shouldMoveFocus = loaderRef.current?.contains(document.activeElement) ?? false;
    setIsLoading(false);
    // small rAF delay so the loading screen has hidden before we start the entrance
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setContentVisible(true);
        if (shouldMoveFocus) homeHeadingRef.current?.focus();
      });
    });
  }, []);

  useEffect(() => {
    if (!isHomeRoute) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionPreference.matches) {
      finishLoading();
      return;
    }

    setAnimateLoader(true);

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) finishLoading();
    };

    motionPreference.addEventListener("change", handleMotionPreferenceChange);
    timerRef.current = window.setTimeout(finishLoading, LOADER_DURATION_MS);

    return () => {
      motionPreference.removeEventListener("change", handleMotionPreferenceChange);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [finishLoading, isHomeRoute]);

  useEffect(() => {
    if (!isHomeRoute) return;

    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;

      if (openingTimerRef.current !== null) {
        clearTimeout(openingTimerRef.current);
        openingTimerRef.current = null;
      }
      setScreen("home");
      finishLoading();
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [finishLoading, isHomeRoute]);

  useEffect(() => () => {
    if (openingTimerRef.current !== null) clearTimeout(openingTimerRef.current);
  }, []);

  return (
    <>
      <div
        ref={loaderRef}
        className="loading-screen"
        aria-hidden={!isLoading}
        inert={!isLoading}
      >
        <div className="loading-screen__content">
          <FolderOpeningScreen folderName="portfolio" title="Opening folder portfolio..." animate={animateLoader} />
        </div>
      </div>

      <main
        className="min-h-screen bg-[#fff7e6] px-5 text-[#283149] sm:px-10 lg:px-16"
        aria-hidden={isLoading}
        inert={isLoading}
      >
        <div className="mx-auto max-w-[1320px]">
          <div className={`home-enter home-enter__header${contentVisible ? " home-enter--visible" : ""}`}>
            <PortfolioHeader />
          </div>

          {screen === "home" && <section
            id="home"
            aria-labelledby="intro-title"
            className="grid scroll-mt-8 gap-12 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-14"
          >
            <div className={`max-w-xl home-enter home-enter__left${contentVisible ? " home-enter--visible" : ""}`}>
              <Link href="/files" className="mb-5 inline-flex rounded-md border-2 border-[#283149] bg-[#ff8f56] px-3 py-1.5 font-mono text-xs font-semibold text-[#283149] hover:opacity-80 transition-opacity">
                ~/portfolio
              </Link>
              <h1
                id="intro-title"
                ref={homeHeadingRef}
                tabIndex={-1}
                className="max-w-lg text-5xl font-bold leading-[1.02] tracking-[-0.045em] text-[#283149] sm:text-6xl"
              >
              My work,
               filed neatly.
              </h1>

              <dl className="mt-6 space-y-3">
                {profileFacts.map((fact) => (
                  <div key={fact.label} className="grid grid-cols-[94px_1fr] items-center gap-3 sm:grid-cols-[86px_1fr]">
                    <dt className="rounded-lg border-2 border-[#283149] bg-[#ffce63] px-2 py-1.5 text-center font-mono text-[11px] font-bold text-[#111827] shadow-[2px_2px_0_#283149]">
                      {fact.label}
                    </dt>
                    <dd className="text-sm font-medium leading-6 text-[#111827] sm:text-base">{fact.description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <section id="files" aria-label="Portfolio folders" className={`grid scroll-mt-8 grid-cols-2 gap-x-6 gap-y-10 rounded-2xl border-2 border-[#283149] bg-white p-8 shadow-[8px_8px_0_#283149] sm:p-12 home-enter home-enter__folders${contentVisible ? " home-enter--visible" : ""}`}>
              {portfolioFolders.map((folder) => (
                <button
                  key={folder.id}
                  id={folder.id}
                  type="button"
                  aria-label={`Open ${folder.name} folder, ${folder.count}`}
                  className="grid min-w-0 content-start justify-items-start rounded-md text-left text-[#283149] transition-transform hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f07d45] motion-reduce:transform-none"
                  onClick={() => openFolder(folder.id)}
                >
                  <FolderIcon color={folder.color} size="lg" />
                  <span className="mt-3 text-base font-bold leading-tight">{folder.name}</span>
                  <span className="font-mono text-[11px] leading-5 text-[#45516b]">{folder.count}</span>
                </button>
              ))}
            </section>
          </section>}

          {screen === "opening" && <FolderOpeningScreen folderName={activeFolder.name} />}

          {screen === "browser" && (
            <FolderPageTransition
              folderName={`portfolio/${activeFilter === "all" ? "files" : activeFilter === "cert" ? "certifications" : `${activeFilter}s`}`}
              title={`Opening ${activeFilter === "all" ? "files" : activeFilter === "cert" ? "certifications" : `${activeFilter}s`}...`}
              skip={!isHomeRoute}
            >
              <PortfolioBrowser
                filter={activeFilter}
                view={fileView}
                rows={visibleFiles}
                onFilterChange={changeFileFilter}
                onViewChange={setFileView}
                onNavigate={(path) => router.push(path)}
              />
            </FolderPageTransition>
          )}
        </div>
      </main>
    </>
  );
}
