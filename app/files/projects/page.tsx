import type { Metadata } from "next";
import PortfolioExperience from "../../portfolio-experience";

export const metadata: Metadata = {
  title: "Projects | Yesha Raval",
  description: "Browse Yesha Raval's data science and machine learning projects.",
};

export default function ProjectsPage() {
  return <PortfolioExperience key="projects" route="projects" />;
}
