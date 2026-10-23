import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 28,
  title: "MCP Resources and Elicitation",
  description: "M C P servers can offer more than tools. They can publish addressable resources and reusable prompts, and ask a human for structured input while a tool call is open.",
  concepts: ["Human form consent and expiry", "Validate before claiming", "MCP IDs and custom-call IDs differ"],
  scope: "Validates a local elicitation form and produces its protocol reply; no MCP transport is connected. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Accept a valid field note", "input": {"date": "2026-10-22", "quantity": 4, "action": "accept", "expired": false}, "expected": "passed", "checks": {"state": "answered"}}, {"id": "1", "label": "Keep an invalid form pending", "input": {"date": "not-a-date", "quantity": 0, "action": "accept", "expired": false}, "expected": "paused", "checks": {"state": "pending"}}, {"id": "2", "label": "Expire a pending form", "input": {"date": "2026-10-22", "quantity": 4, "action": "accept", "expired": true}, "expected": "rejected", "checks": {"state": "expired"}}],
  async run(input) {

if(flag(input,"expired"))return report("rejected","The form expired and needs deliberate cleanup",{state:"expired"},["Check expiry before a transport claim"]);
const action=text(input,"action");if(!["accept","decline","cancel"].includes(action))throw new Error("Unsupported form action");
const quantity=number(input,"quantity"),date=text(input,"date");
if(action==="accept"&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||!Number.isInteger(quantity)||quantity<1||quantity>100))return report("paused","Validation failed; keep the form pending",{state:"pending"},["Validate nonsecret form data before claiming"]);
return report("passed","Prepared the correlated MCP form reply",{state:"answered",mcpReply:{jsonrpc:"2.0",id:17,result:{action,...(action==="accept"?{content:{date,quantity}}:{})}},managedCustomCall:"still requires its own result"},["Verify consent and owner binding","Claim the pending form","Use the MCP request ID, not the managed event ID"]);

  }
};
