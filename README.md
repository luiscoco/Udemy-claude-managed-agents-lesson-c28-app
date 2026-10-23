# C28 · MCP Resources and Elicitation

Validates a local elicitation form and produces its protocol reply; no MCP transport is connected. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Human form consent and expiry
- Validate before claiming
- MCP IDs and custom-call IDs differ

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3028`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3028
```

## How the app was build

### 1. Check expiry and supported consent actions

An expired form is rejected before any transport claim. The student must select accept, decline or cancel; arbitrary actions are not supported.

Source: [src/lesson.ts](src/lesson.ts#L13) · selected statements

```typescript
if (flag(input, "expired"))
  return report(
    "rejected",
    "The form expired and needs deliberate cleanup",
    { state: "expired" },
    ["Check expiry before a transport claim"],
  );

const action = text(input, "action");

if (!["accept", "decline", "cancel"].includes(action))
  throw new Error("Unsupported form action");
```

### 2. Validate accepted form data before claiming

Acceptance requires a parseable date with the expected shape and a bounded integer quantity. Failed validation keeps the form pending so the user can correct it.

Source: [src/lesson.ts](src/lesson.ts#L15) · selected statements

```typescript
const quantity = number(input, "quantity"),
  date = text(input, "date");

if (
  action === "accept" &&
  (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100)
)
  return report(
    "paused",
    "Validation failed; keep the form pending",
    { state: "pending" },
    ["Validate nonsecret form data before claiming"],
  );
```

### 3. Use the MCP request ID in the reply

The JSON-RPC result uses the seeded MCP id 17. A managed custom call would still need its own correlated result; these two identifier domains are not interchangeable.

Source: [src/lesson.ts](src/lesson.ts#L17)

```typescript
return report(
  "passed",
  "Prepared the correlated MCP form reply",
  {
    state: "answered",
    mcpReply: {
      jsonrpc: "2.0",
      id: 17,
      result: {
        action,
        ...(action === "accept" ? { content: { date, quantity } } : {}),
      },
    },
    managedCustomCall: "still requires its own result",
  },
  [
    "Verify consent and owner binding",
    "Claim the pending form",
    "Use the MCP request ID, not the managed event ID",
  ],
);
```

### Check your understanding

Run **Accept a valid field note** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "date": "2026-10-22",
    "quantity": 4,
    "action": "accept",
    "expired": false
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "state": "answered"
  }
}
```

Then try **Keep an invalid form pending**. Its expected outcome is `paused`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
