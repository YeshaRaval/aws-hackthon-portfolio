import type { Metadata } from "next";
import ContactWorkspace from "./contact-workspace";

export const metadata: Metadata = {
  title: "Contact | Yesha Raval",
  description: "Contact Yesha Raval about data science, research, and opportunities.",
};

export default function ContactPage() {
  return <ContactWorkspace />;
}
