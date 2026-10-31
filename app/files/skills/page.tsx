import type { Metadata } from "next";
import PortfolioExperience from "../../portfolio-experience";

export const metadata: Metadata = {
  title: "Skills | Yesha Raval",
  description: "Browse Yesha Raval's technical skills.",
};

export default function SkillsPage() {
  return <PortfolioExperience key="skills" route="skills" />;
}
