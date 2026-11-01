"use client";

import { useEffect, useState } from "react";

const ANIMATION_DURATION_MS = 600;

export function FolderOpeningScreen({
  folderName,
  title,
  animate = true,
}: {
  folderName: string;
  title?: string;
  animate?: boolean;
}) {
  return (
    <section className="folder-opening-screen" role="status" aria-live="polite">
      <p className="font-mono text-sm text-[#283149]">~/ {folderName}</p>
      <h1 className="mt-2 text-2xl font-bold text-[#283149]">{title ?? "Opening folder..."}</h1>
      <div className={`folder-open-animation${animate ? " folder-open-animation--active" : ""}`} aria-hidden="true">
        <span className="folder-open-animation__back" />
        <span className="folder-open-animation__paper folder-open-animation__paper--first"><i /><i /></span>
        <span className="folder-open-animation__paper folder-open-animation__paper--second"><i /><i /></span>
        <span className="folder-open-animation__front" />
      </div>
    </section>
  );
}

/**
 * Wraps a page with the folder-opening animation on first mount.
 * Shows the animation for ANIMATION_DURATION_MS then reveals children.
 */
export function FolderPageTransition({
  folderName,
  title,
  children,
  skip = false,
}: {
  folderName: string;
  title?: string;
  children: React.ReactNode;
  skip?: boolean;
}) {
  const [opening, setOpening] = useState(!skip);

  useEffect(() => {
    if (skip) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setOpening(false);
      return;
    }
    const timer = window.setTimeout(() => setOpening(false), ANIMATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [skip]);

  if (opening) {
    return (
      <div className="min-h-screen bg-[#fff7e6]">
        <FolderOpeningScreen folderName={folderName} title={title} animate />
      </div>
    );
  }

  return <>{children}</>;
}
