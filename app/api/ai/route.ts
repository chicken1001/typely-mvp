import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// IMPORTANT: Use the new streaming function for v2+ of the SDK
export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const result = await streamText({
    model: groq('llama-3.1-70b-versatile'),
    system: `You are Typely — the fastest freelancer AI. 
Parse the user message into JSON ONLY. No explanations.

Valid actions:
- create_client → { "action": "create_client", "name": "...", "email": "…" }
- create_invoice → { "action": "create_invoice", "client": "...", "amount": 12345, "description": "…" }
- send_email → { "action": "send_email", "client": "...", "subject": "...", "body": "…" }

If unclear, reply with { "action": "unknown", "message": "Try: Invoice NASA $25000 for moon base" }

Respond with pure JSON only.`,
    messages: [{ role: 'user', content: message }],
  });

  // Stream the SDK can directly stream JSON to the client
  return result.toDataStreamResponse();
}

export const runtime = 'edge';
