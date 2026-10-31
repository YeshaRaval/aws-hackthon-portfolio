import { Suspense } from "react";
import type { Metadata } from "next";
import AboutWorkspace from "./about-workspace";

export const metadata: Metadata = {
  title: "About | Yesha Raval",
  description: "About Yesha Raval, data scientist and AI/ML engineer.",
};

export default function AboutPage() {
  return (
    <Suspense>
      <AboutWorkspace />
    </Suspense>
  );
}
