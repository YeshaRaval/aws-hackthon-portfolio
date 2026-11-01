"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/files", label: "Files" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/assistant", label: "Ask" },
  ];

  // Active match: exact for home, startsWith for others
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={`mobile-bottom-nav__link${isActive(href) ? " mobile-bottom-nav__link--active" : ""}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
