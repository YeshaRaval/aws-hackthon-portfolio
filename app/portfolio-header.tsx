import Link from "next/link";

export default function PortfolioHeader() {
  return (
    <header className="flex flex-col gap-4 py-7 lg:flex-row lg:items-center lg:justify-between">
      <Link href="/" aria-label="Yesha Raval home" className="portfolio-header__brand">
        <span className="portfolio-header__brand-icon" aria-hidden="true">
          <svg viewBox="0 0 22 18" width="22" height="18" fill="none">
            <rect x="1" y="4" width="20" height="13" rx="2" fill="#ffce63" stroke="#283149" strokeWidth="2"/>
            <path d="M1 7h20" stroke="#283149" strokeWidth="2"/>
            <rect x="1" y="4" width="8" height="4" rx="1.5" fill="#ff8f56" stroke="#283149" strokeWidth="2"/>
          </svg>
        </span>
        <span className="portfolio-header__brand-text">
          <span className="portfolio-header__brand-path">/users/</span><span className="portfolio-header__brand-name">yesha_raval</span>
        </span>
      </Link>

      <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-3 gap-y-3">
        <Link href="/about" className="folder-action">About</Link>
        <Link href="/files" className="folder-action">Files</Link>
        <Link href="/contact" className="folder-action">Contact</Link>
        <Link href="/assistant" className="folder-action folder-action--primary">
          Ask the assistant
        </Link>
      </nav>
    </header>
  );
}
