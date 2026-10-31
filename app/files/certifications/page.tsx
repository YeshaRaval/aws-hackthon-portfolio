import type { Metadata } from "next";
import PortfolioExperience from "../../portfolio-experience";

export const metadata: Metadata = {
  title: "Certifications | Yesha Raval",
  description: "Browse Yesha Raval's professional certifications.",
};

export default function CertificationsPage() {
  return <PortfolioExperience key="certifications" route="certifications" />;
}
