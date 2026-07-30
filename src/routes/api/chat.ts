import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown; context?: unknown };

const SYSTEM = `You are the AI Advisor for the Agrofeed Global Sukuk Data Room — an enterprise platform for Islamic capital markets (Sukuk) issuance.

Your role: analytical support for Sukuk structuring, AAOIFI/IFSB Sharia compliance, gap analysis, financial intelligence, risk assessment, milestones, tasks and stakeholder coordination.

Rules:
- Ground EVERY answer strictly in the DATA ROOM CONTEXT provided below. Never invent documents, figures, dates, owners or findings.
- If the context does not contain what is needed, say clearly what is missing and which document should be uploaded.
- Cite the specific records you used at the end under a bold "Sources:" line (document names, milestone codes, compliance IDs, risk IDs).
- Be concise and executive in tone. Use markdown-style headings, short paragraphs and numbered lists.
- Always end with this exact italic disclaimer line:
_This response is generated from documents currently in the data room. It is not legal, financial, or Sharia advice._`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const context =
          typeof body.context === "string" && body.context.trim()
            ? body.context.slice(0, 60000)
            : "(no data room records available)";

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway("openai/gpt-5.6-sol"),
            system: `${SYSTEM}\n\n===== DATA ROOM CONTEXT =====\n${context}\n===== END CONTEXT =====`,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
            providerOptions: { lovable: { reasoningEffort: "none" } },
          });

          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
            onError: (error) => (error instanceof Error ? error.message : String(error)),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "AI request failed";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
