import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextRequest } from "next/server";

// ── Portfolio context injected into every prompt ────────────────────────────
const PORTFOLIO_CONTEXT = `
You are an AI assistant for Yesha Raval's portfolio website. Answer questions ONLY using the information below.
Be concise, friendly, and direct. If something isn't covered, say so honestly.

--- ABOUT ---
Name: Yesha Raval
Email: yesha.raval04@gmail.com
LinkedIn: linkedin.com/in/yesha-raval04
GitHub: github.com/YeshaRaval
Location: Berlin, Germany (relocated from Mumbai, India)

--- EDUCATION ---
- B.Tech in AI/ML, Thakur College of Engineering and Technology (TCET), Mumbai — Dec 2021–June 2025, CGPA 9.57/10
- M.Sc. in Data Science (in progress), BHT Berlin — 2026–2028

--- PROJECTS ---
1. Travel AI Guide (2025) — AI itinerary generator using GPT-4.1, real-time weather data, Azure Cosmos DB, Next.js, Vercel. Live: https://ai-travel-guide-blush.vercel.app/ | GitHub: https://github.com/YeshaRaval/ai-travel-guide
2. MediPortal – Healthcare Management (2024) — Secure healthcare platform with auth, patient records, role-based access. Next.js, TypeScript, Upstash Redis, OpenAI API, Vercel. Live: https://medical-portal-beta.vercel.app/ | GitHub: https://github.com/YeshaRaval/medical-portal
3. FormulaDash – F1 Analytics (2025) — Interactive F1 data visualization with race/driver/team insights. Python, Streamlit, Plotly, Pandas. Live: https://formula-dash.streamlit.app/ | GitHub: https://github.com/YeshaRaval/formula-dash
4. Billing & Dashboard – Aastha Apparel Atelier (2024) — Next.js billing system with GST, discounts, PDF invoicing. Live: https://aastha-billing.vercel.app/
5. StatSense – Automated EDA (2023) — Automated exploratory data analysis. Python, Streamlit, Scikit-learn, Matplotlib. Live: https://stat-sense.streamlit.app/ | GitHub: https://github.com/YeshaRaval/StatSense

--- RESEARCH ---
- GATE-DehazNet: A GAN-Attention-Transformer ensemble for satellite image dehazing. Published in the Turkish Journal of Remote Sensing (Scopus indexed), 2026. Achieved ~27% improvement in SSIM and PSNR. DOI: https://dergipark.org.tr/en/pub/tuzal/article/1828786

--- AWS CERTIFICATIONS ---
- AWS Certified AI Practitioner (AIF-C01) — May 2025. Credly: https://www.credly.com/badges/ed087278-5b33-40dc-8b7b-31fa7b5ee958/public_url
- AWS Certified Solutions Architect – Associate (SAA-C03) — Jan 2026. Credly: https://www.credly.com/badges/2b15bf28-4a64-403b-b975-79407673a0a9/public_url
- AWS Certified Developer – Associate (DVA-C02) — Feb 2026. Credly: https://www.credly.com/badges/c531c373-885a-4297-bc90-2459873d1857/public_url

--- SKILLS ---
- Programming: HTML, CSS, JavaScript, Python, Java, SQL
- AI/ML: Machine Learning, Deep Learning, NLP, Computer Vision, GANs
- Frameworks & Libraries: TensorFlow, PyTorch, OpenCV, Scikit-learn
- Web & Tools: Next.js, React.js, REST APIs, Git, GitHub
- AWS: EC2, ELB, Auto Scaling, S3, Amazon VPC, Lambda, API Gateway, Cognito, Amazon Bedrock, Amazon SageMaker
- Databases: MySQL, MongoDB, Redis

--- EXPERIENCE ---
- Technical Intern, Aastha's Apparel Atelier, Mumbai — June 2024–August 2024. Built Next.js billing system, optimized WordPress e-commerce site.
- Core Member, SuperAI Community Stakeholder Connect, TCET — Aug 2022–May 2024. Organized ideathons/hackathons, delivered training sessions to 80+ students.

--- LANGUAGES ---
- English: C1 (TOEFL iBT — Reading C1, Listening C1, Speaking C1, Writing C1)
- German: A2

--- AVAILABILITY ---
Open to internships and Werkstudent roles in Berlin.
`.trim();

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const { question } = await req.json() as { question: string };

  if (!question || question.trim().length === 0) {
    return new Response("Question is required", { status: 400 });
  }

  const modelId = process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-3-haiku-20240307-v1:0";

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 512,
    system: PORTFOLIO_CONTEXT,
    messages: [{ role: "user", content: question.trim() }],
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  // Stream the response back to the client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.send(command);
        if (!response.body) { controller.close(); return; }

        for await (const event of response.body) {
          if (event.chunk?.bytes) {
            const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
            if (chunk.type === "content_block_delta" && chunk.delta?.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
