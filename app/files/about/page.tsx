import type { Metadata } from "next";
import PortfolioExperience from "../../portfolio-experience";

export const metadata: Metadata = {
  title: "About files | Yesha Raval",
  description: "Browse the About README and route inventory files.",
};

export default function AboutFilesPage() {
  return <PortfolioExperience key="about" route="about" />;
}
