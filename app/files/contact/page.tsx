import type { Metadata } from "next";
import PortfolioExperience from "../../portfolio-experience";

export const metadata: Metadata = {
  title: "Contact | Yesha Raval",
  description: "Find contact details for Yesha Raval.",
};

export default function ContactPage() {
  return <PortfolioExperience key="contact" route="contact" />;
}
