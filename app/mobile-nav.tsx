"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Mobile-only bottom navigation bar + floating assistant button.
 * Hidden on sm+ screens via CSS.
 */
export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/about", label: "About", icon: "👤" },
    { href: "/files", label: "Files", icon: "📁" },
    { href: "/contact", label: "Contact", icon: "✉️" },
  ];

  return (
    <>
      {/* Bottom nav bar — About, Files, Contact */}
      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={`mobile-bottom-nav__link${pathname === href ? " mobile-bottom-nav__link--active" : ""}`}
          >
            <span className="mobile-bottom-nav__icon" aria-hidden="true">{icon}</span>
            <span className="mobile-bottom-nav__label">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Floating assistant button */}
      <Link
        href="/assistant"
        className="mobile-fab"
        aria-label="Ask the assistant"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#283149"/>
          <path d="M7 9.5h10M7 12.5h7" stroke="#fff7e6" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="17" cy="15.5" r="2.5" fill="#ff8f56" stroke="#283149" strokeWidth="1.5"/>
          <path d="M16 15.5h2M17 14.5v2" stroke="#283149" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </Link>
    </>
  );
}
