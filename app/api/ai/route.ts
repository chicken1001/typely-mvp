import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';  // Fixed: Use Groq instead of OpenAI
import { generateText } from 'ai';   // For v3 AI SDK
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const resend = new Resend(process.env.RESEND_API_KEY || '');

const groqModel = groq('llama-3.1-70b-versatile');  // Fast, powerful Groq model

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { message } = await req.json();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate AI response
  const { text } = await generateText({
    model: groqModel,
    system: `You are Typely, an AI freelancer assistant. Parse natural language commands into structured JSON only.

Valid commands:
- "Add client [name] [email]": action="create_client", client_name="[name]", email="[email]"
- "Invoice [client] $[amount] for [description]": action="create_invoice", client_name="[client]", amount=[number without $], description="[description]"
- "Email [client] [subject] [body]": action="send_email", client_name="[client]", subject="[subject]", body="[body]"
- Anything else: action="reply", message="Helpful response (e.g., 'Try: Invoice Tesla $1200 for logo')"

Respond with ONLY valid JSON: {"action": "...", "client_name": "...", "amount": number, "description": "...", "subject": "...", "body": "...", "message": "..." }`,
    prompt: message,
  });

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ result: { action: 'error', message: 'Invalid command. Try "Invoice NASA $25000 for redesign".' } });
  }

  // Execute based on action (MVP: Log + stub real integrations)
  if (parsed.action === 'create_invoice') {
    // Real: Create in Supabase
    const { data: invoice } = await supabase.from('invoices').insert({
      user_id: user.id,
      client_name: parsed.client_name,
      amount_cents: parsed.amount * 100,
      description: parsed.desc || parsed.description,
      status: 'sent',
    }).select().single();

    // Real: Stripe payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: parsed.description },
          unit_amount: parsed.amount * 100,
        },
        quantity: 1,
      }],
    });

    // Stub PDF (in prod, generate with @react-pdf/renderer and upload to Supabase Storage)
    const pdfUrl = 'https://example.com/invoice.pdf';  // Replace with real upload

    // Real: Send email
    await resend.emails.send({
      from: 'invoices@typely.so',
      to: 'client@example.com',  // Fetch from clients table
      subject: `Invoice from Typely: ${parsed.amount}`,
      html: `<p>Pay here: <a href="${paymentLink.url}">${paymentLink.url}</a></p><p>PDF: <a href="${pdfUrl}">Download</a></p>`,
    });

    return NextResponse.json({ result: { ...parsed, invoice_id: invoice?.id, payment_link: paymentLink.url, pdf_url: pdfUrl, message: `Invoice #${invoice?.id} created & sent to ${parsed.client_name}!` } });
  } else if (parsed.action === 'create_client') {
    await supabase.from('clients').insert({ user_id: user.id, name: parsed.client_name, email: parsed.email });
    return NextResponse.json({ result: { ...parsed, message: `Client ${parsed.client_name} added.` } });
  } else if (parsed.action === 'send_email') {
    // Stub: Add real Resend call here
    return NextResponse.json({ result: { ...parsed, message: `Email sent to ${parsed.client_name}.` } });
  }

  return NextResponse.json({ result: parsed });
}
