import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export async function POST(request: NextRequest) {
  if (!stripe || !supabase) {
    return NextResponse.json({ error: 'Services not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const evaluationId = session.metadata?.evaluationId;
    const userId = session.metadata?.userId;

    if (evaluationId && userId) {
      // Update ALL evaluations for this user as paid (account-wide unlock)
      await supabase
        .from('evaluations')
        .update({ is_paid: true })
        .eq('user_id', userId);

      // Create payment record
      await supabase.from('payments').insert([
        {
          evaluation_id: evaluationId,
          user_id: userId,
          status: 'completed',
          amount: (session.amount_total || 0) / 100,
          stripe_payment_id: session.payment_intent,
        },
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
