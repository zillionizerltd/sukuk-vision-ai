# AI Advisor pop-up assistant

## Why it isn't opening today

`src/routes/_app.tsx` blocks `/ai-advisor` for everyone except admins and Agrofeed Global users, redirecting them to `/documents`. That matches the current view. Access will be opened to every signed-in user.

## What we'll build

1. **Advisor available to all signed-in users**
   - Remove `/ai-advisor` from the restricted route list so the page no longer redirects.
   - Show the Advisor item in the sidebar for all users.

2. **Pop-up Advisor, available from anywhere**
   - A global modal overlay (centred panel, dimmed backdrop, Esc / click-outside to close, focus straight into the composer) mounted once in the app layout.
   - Opens when: the "AI Advisor" button in the top bar is clicked, the sidebar Advisor item is clicked (with a "open full page" link inside the modal), or the user types a question in the top-bar search field and presses Enter — the typed text is sent as the first message.
   - The full `/ai-advisor` page stays exactly as it is, reachable from inside the pop-up.

3. **Assistant features inside the pop-up**
   - Streaming answers with markdown + tables (reuses `ChatMarkdown`).
   - Grounded in the live data room context, same as the page.
   - One-click action cards (create task, request document, file approval) via `AdvisorActionCard`.
   - Suggested prompts on the empty state, thinking indicator, inline error banner with Retry, copy-answer button, "New conversation" reset, and expand-to-full-page.
   - Search-field submissions land in the pop-up so the top-bar search finally does something.

## Technical notes

- Extract the current Advisor chat body from `src/routes/_app/ai-advisor.tsx` into a shared `src/components/advisor/AdvisorChat.tsx` (props for compact vs full layout) so page and modal share one implementation and one `useChat` setup; no changes to `src/routes/api/chat.ts`.
- Add `src/components/advisor/AdvisorProvider.tsx` — a small React context with `open(initialPrompt?)` / `close()`, mounted in `src/routes/_app.tsx`, consumed by `TopBar` and `Sidebar`.
- Data room context continues to come from `use-modules` hooks inside the shared chat component.
- Route guard edit is limited to removing `/ai-advisor` from `AGROFEED_ONLY`; other module restrictions stay unchanged.
