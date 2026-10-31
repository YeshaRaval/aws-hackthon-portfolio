import type { Metadata } from "next";
import PortfolioExperience from "../portfolio-experience";

export const metadata: Metadata = {
  title: "Files | Yesha Raval",
  description: "Browse Yesha Raval's projects, research, certifications and skills.",
};

export default function FilesPage() {
  return <PortfolioExperience key="files" route="files" />;
}
