import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export async function POST(request: NextRequest) {
  try {
    // Debug logging
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasStripeKey: !!stripeSecretKey,
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
      supabaseKey: supabaseServiceKey ? 'SET' : 'MISSING',
      stripeKey: stripeSecretKey ? 'SET' : 'MISSING',
    });

    if (!supabase || !stripe) {
      const missingServices = [];
      if (!supabase) missingServices.push('Supabase (missing URL or service key)');
      if (!stripe) missingServices.push('Stripe (missing secret key)');

      return NextResponse.json({
        error: 'Services not configured',
        missing: missingServices,
        debug: {
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseKey: !!supabaseServiceKey,
          hasStripeKey: !!stripeSecretKey,
        }
      }, { status: 500 });
    }

    const { evaluationId } = await request.json();

    if (!evaluationId) {
      return NextResponse.json({ error: 'Evaluation ID is required' }, { status: 400 });
    }

    // Fetch evaluation
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    if (evalError || !evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    // Check if any evaluation for this user is already paid (account-wide unlock)
    const { data: paidEvaluations } = await supabase
      .from('evaluations')
      .select('id')
      .eq('user_id', evaluation.user_id)
      .eq('is_paid', true)
      .limit(1);

    if (paidEvaluations && paidEvaluations.length > 0) {
      return NextResponse.json({ error: 'Your account already has full access unlocked' }, { status: 400 });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Full Evaluation Report',
              description: 'Unlock the complete AI evaluation report',
            },
            unit_amount: 499, // $4.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&evaluation_id=${evaluationId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment/${evaluationId}`,
      metadata: {
        evaluationId,
        userId: evaluation.user_id,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
