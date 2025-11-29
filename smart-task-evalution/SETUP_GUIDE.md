# Smart Task Evaluator - Setup & Deployment Guide

## Quick Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Accounts for: Supabase, OpenAI, Stripe

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-task-evaluator.git
cd smart-task-evaluator

# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-api-key-here

# Stripe (https://stripe.com/docs/keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup Supabase

1. **Create Project**
   - Go to https://supabase.com
   - Create new project
   - Copy URL and API keys

2. **Create Tables** (Run in Supabase SQL Editor)

```sql
-- Users Table (auto-created by Auth)
-- Already exists via Supabase Auth

-- Tasks Table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations Table
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  strengths JSONB NOT NULL DEFAULT '[]',
  improvements JSONB NOT NULL DEFAULT '[]',
  full_report TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  amount DECIMAL(10, 2) NOT NULL,
  stripe_payment_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_task_id ON evaluations(task_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_evaluation_id ON payments(evaluation_id);
```

3. **Enable RLS** (Row-Level Security)

```sql
-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Tasks RLS policies
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Evaluations RLS policies
CREATE POLICY "Users can view their own evaluations"
  ON evaluations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own evaluations"
  ON evaluations FOR UPDATE
  USING (auth.uid() = user_id);

-- Payments RLS policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);
```

### 5. Setup OpenAI

1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env.local` as `OPENAI_API_KEY`

### 6. Setup Stripe

1. Go to https://stripe.com
2. Create account and get API keys from Dashboard
3. Copy Publishable Key (pk_test_...) and Secret Key (sk_test_...)
4. Setup Webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payment/webhook`
   - Select event: `checkout.session.completed`
   - Get webhook secret and add to `.env.local`

### 7. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 8. Test the Application

1. **Sign up** with test email
2. **Upload a task** - paste some code
3. **Run evaluation** (requires OpenAI API key)
4. **Test payment** using Stripe test cards:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits

## Production Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Configure Production URLs

1. **Stripe Webhook URL**
   - Update to: `https://yourdomain.com/api/payment/webhook`

2. **Supabase Auth Redirect URL**
   - Go to Supabase → Authentication → URL Configuration
   - Add: `https://yourdomain.com`

3. **Update .env.local**
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

## Important Notes

### Security Checklist
- ✅ All API keys in environment variables
- ✅ RLS enabled on database tables
- ✅ HTTPS enforced in production
- ✅ Stripe webhook secret configured
- ✅ No sensitive data in client code
- ✅ Input validation on all endpoints
- ✅ Error handling without stack trace exposure

### Performance Optimization
- ✅ Static generation for landing page
- ✅ Server-side rendering for protected pages
- ✅ Optimized images and assets
- ✅ Minimal CSS bundle size (Tailwind)
- ✅ Efficient database queries with indexes

### Testing Tips
- Use Stripe test mode for development
- Create test Supabase data before evaluation
- Test with different code samples
- Verify RLS policies block unauthorized access

## Troubleshooting

### Build Issues
If `npm run build` fails:
1. Check all environment variables are set
2. Verify Node.js version (18+)
3. Clear `.next` folder and rebuild

### Runtime Issues
- **Database errors**: Check RLS policies and API keys
- **Stripe errors**: Verify webhook secret and API keys
- **OpenAI errors**: Check API key validity and usage limits

### Common Errors

**"Invalid supabaseUrl"**
- Solution: Add valid Supabase URL to .env.local

**"OpenAI API Error"**
- Check API key is correct
- Verify account has credits
- Check usage limits

**"Stripe webhook failed"**
- Verify webhook endpoint URL
- Check webhook secret is correct
- Review webhook delivery logs

## Files Modified/Added

### Core Application Files
- `app/page.tsx` - Landing page
- `app/layout.tsx` - Root layout with AuthProvider
- `app/auth/login/page.tsx` - Login page
- `app/auth/signup/page.tsx` - Signup page
- `app/dashboard/page.tsx` - Dashboard
- `app/dashboard/upload/page.tsx` - Task upload
- `app/dashboard/evaluate/[id]/page.tsx` - Evaluation results
- `app/dashboard/payment/[id]/page.tsx` - Payment page
- `app/payment/success/page.tsx` - Payment success

### API Routes
- `app/api/evaluate/route.ts` - AI evaluation endpoint
- `app/api/payment/checkout/route.ts` - Stripe checkout
- `app/api/payment/webhook/route.ts` - Stripe webhook

### Context & Utilities
- `app/context/AuthContext.tsx` - Authentication context
- `lib/supabase.ts` - Supabase client & types

### Demo Files (Intentional Bugs)
- `app/components/BrokenModal.tsx` - Buggy modal component
- `lib/utils/buggy.ts` - Buggy utility functions
- `app/api/stats/route.ts` - Buggy API endpoint
- `BUGS_DOCUMENTATION.md` - Bug documentation

## Next Steps

1. **Deploy to production**
2. **Setup monitoring** (Sentry, LogRocket)
3. **Add email notifications**
4. **Implement rate limiting**
5. **Add more payment options** (Razorpay, etc.)
6. **Create admin dashboard**
7. **Add usage analytics**

---

For more information, see `README.md` and `BUGS_DOCUMENTATION.md`
