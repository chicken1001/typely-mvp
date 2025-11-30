import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

const groq = openai('groq', { apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const { text } = await streamText({
    model: groq('llama-3.1-70b-instant'),
    system: `You are Typely. Parse commands into JSON: {"action": "create_client|create_invoice|send_email", "details": {...}}. For "Invoice [client] $[amount] for [desc]": action="create_invoice", details={client, amount: number, desc}. Reply conversationally if invalid.`,
    messages: [{ role: 'user', content: message }],
  });

  // In full version: Parse text, insert to Supabase, create Stripe PDF, send Resend email
  return NextResponse.json({ response: text });
}
