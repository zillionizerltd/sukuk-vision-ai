# AI Advisor input verification

## Result: working, no code changes needed

I ran the AI Advisor end to end in a real browser session against the running app:

1. Opened `/ai-advisor` as a signed-in user.
2. Typed a query into the chat field and pressed Enter.
3. The message appeared immediately as a user bubble, the request was sent, and a streamed answer came back.
4. Asked "Which milestones are at risk of slipping?" — the reply listed 11 milestones grounded in live data room records, rendered as a proper formatted table with a Sources line.

Also confirmed:
- The chat endpoint returns a valid streaming response (HTTP 200, token deltas, clean finish).
- No console or network errors during the exchange.
- The chat request path now respects the deployment base path, so it also works when the app is served under `/dataroom`.

## If it still fails for you

The most likely remaining cause is environment-specific rather than code:

- Served behind the `/dataroom` reverse proxy without forwarding `POST /dataroom/api/chat` to the app.
- AI credits exhausted (the chat shows an inline error banner with the exact message and a Retry button).

Optional follow-up, only if you want it:

1. Show the failing message inline in the transcript with a per-message Retry, instead of only the banner below the thread.
2. Add a lightweight "Advisor unavailable" health hint when the chat endpoint is unreachable, so a proxy misconfiguration is obvious.

Approve this if you want the two optional follow-ups; otherwise no changes are required.
