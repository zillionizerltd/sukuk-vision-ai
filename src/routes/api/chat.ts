import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown; context?: unknown };

const SYSTEM = `You are the AI Advisor for the Agrofeed Global Sukuk Data Room — an enterprise platform for Islamic capital markets (Sukuk) issuance.

Your role: analytical support for Sukuk structuring, AAOIFI/IFSB Sharia compliance, gap analysis, financial intelligence, risk assessment, milestones, tasks and stakeholder coordination.

Rules:
- Ground EVERY answer strictly in the DATA ROOM CONTEXT provided below. Never invent documents, figures, dates, owners or findings.
- If the context does not contain what is needed, say clearly what is missing and which document should be uploaded.
- Cite the specific records you used at the end under a bold "Sources:" line (document names, milestone codes, compliance IDs, risk IDs).
- Answer like a normal chat message: plain conversational prose, short paragraphs, no headings unless the answer is long and genuinely needs them.
- Use a GitHub-flavoured markdown table ONLY when the answer compares items or lists records with several attributes (e.g. risks, compliance gaps, milestones, financial metrics). Keep tables to 5 columns or fewer with short cell values. Never wrap a single fact or a one-line answer in a table.
- You can propose one-click actions with your tools: createTask (new task on the board), requestDocument (ask a stakeholder for a missing document), fileApprovalItem (raise an approval/compliance item). Call a tool whenever the user asks you to create, request, raise or file something, or when an obvious follow-up action would help. Tools only PREPARE the action — the user confirms it with one click in the chat, so always say what you prepared.
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
        console.log(key, ">>>>>>>>> this the key")
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
            stopWhen: stepCountIs(50),
            tools: {
              createTask: tool({
                description: "Prepare a new task for the Tasks board. The user confirms it with one click.",
                inputSchema: z.object({
                  title: z.string().describe("Short, action-oriented task title"),
                  org: z.string().describe("Owning organisation, e.g. Agrofeed Global, Al Huda CIBE, Tesserant Capital"),
                  assignee: z.string().describe("Person or team responsible; empty string if unknown"),
                  due_date: z.string().describe("Due date as YYYY-MM-DD, or empty string if unknown"),
                  priority: z.enum(["Low", "Medium", "High", "Critical"]),
                  rationale: z.string().describe("One sentence on why this task is needed, grounded in the data room"),
                }),
                execute: async (input) => ({ kind: "task", ...input }),
              }),
              requestDocument: tool({
                description: "Prepare a request for a missing document from a stakeholder. The user confirms it with one click.",
                inputSchema: z.object({
                  document_name: z.string().describe("Name of the missing document"),
                  folder: z.string().describe("Data room folder it belongs in, e.g. /legal, /financials"),
                  org: z.string().describe("Organisation being asked to provide it"),
                  due_date: z.string().describe("Requested-by date as YYYY-MM-DD, or empty string"),
                  reason: z.string().describe("Why this document is required, grounded in the data room"),
                }),
                execute: async (input) => ({ kind: "document_request", ...input }),
              }),
              fileApprovalItem: tool({
                description: "Prepare an approval / compliance register item. The user confirms it with one click.",
                inputSchema: z.object({
                  framework: z.string().describe("Framework or approval body, e.g. AAOIFI, IFSB, Sharia Supervisory Board, Internal"),
                  requirement: z.string().describe("The approval or requirement to be filed"),
                  severity: z.enum(["low", "medium", "high", "critical"]),
                  owner_org: z.string().describe("Organisation accountable for the approval"),
                  notes: z.string().describe("Supporting detail grounded in the data room"),
                }),
                execute: async (input) => ({ kind: "approval", ...input }),
              }),
            },
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
