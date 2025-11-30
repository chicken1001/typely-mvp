import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

export const POST = async (req: NextRequest) => {
  const { message } = await req.json();

  const result = await streamText({
    model: groq('llama-3.1-70b-versatile'),   // ← this line is correct
    system: `You are Typely — the fastest freelancer AI.
Respond with ONLY valid JSON. No extra text.

Valid actions:
- create_client → { "action": "create_client", "name": "...", "email": "…" }
- create_invoice → { "action": "create_invoice", "client": "...", "amount": 25000, "description": "…" }
- send_email → { "action": "send_email", "client": "...", "subject": "...", "body": "…" }

If unclear → { "action": "unknown", "message": "Try: Invoice NASA $25000 for moon base" }`,
    messages: [{ role: 'user', content: message }],
  });

  return result.toDataStreamResponse();
};

export const runtime = 'edge';
