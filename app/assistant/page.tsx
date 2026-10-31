import type { Metadata } from "next";
import AssistantWorkspace from "./assistant-workspace";

export const metadata: Metadata = {
  title: "Ask the Assistant | Yesha Raval",
  description: "Ask questions about Yesha Raval's portfolio, powered by Amazon Bedrock.",
};

export default function AssistantPage() {
  return <AssistantWorkspace />;
}
