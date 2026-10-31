import type { Metadata } from "next";
import PortfolioExperience from "../../portfolio-experience";

export const metadata: Metadata = {
  title: "Research | Yesha Raval",
  description: "Browse Yesha Raval's research work.",
};

export default function ResearchPage() {
  return <PortfolioExperience key="research" route="research" />;
}
