# Smart Task Evaluator - AI Mini-SaaS Application

A production-ready SaaS application that uses artificial intelligence to evaluate and provide detailed feedback on coding tasks.

## 🚀 Features

### ✅ Core Functionality
- **User Authentication**: Secure email-based login and signup with Supabase Auth
- **Task Upload**: Submit coding tasks in multiple programming languages
- **AI Evaluation**: Instant AI-powered code review with scoring and detailed analysis
- **Feedback Display**: View evaluation results including:
  - Overall score (0-100)
  - Code strengths (up to 5 points)
  - Areas for improvement (up to 5 points)
  - Preview of full report
- **Payment System**: Stripe integration to unlock detailed reports
- **Past Reports**: Access historical evaluations and purchased reports
- **Dashboard**: User-friendly dashboard with statistics and task management

### 🤖 AI Integration
- **OpenAI GPT Integration**: Uses OpenAI's API for intelligent code analysis
- **Smart Evaluation Engine**: Analyzes code quality, performance, best practices
- **Detailed Reports**: Generates comprehensive feedback with actionable recommendations

### 💳 Payment Processing
- **Stripe Integration**: Secure payment processing
- **Webhook Handling**: Automatic payment verification and report unlocking
- **Payment History**: Track all transactions

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15+ with TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **API Routes**: Next.js API Routes
- **Payments**: Stripe API
- **AI**: OpenAI API

### Deployment
- **Frontend**: Vercel
- **Database**: Supabase Cloud
- **Functions**: Serverless (Next.js)

## 📋 Project Structure

```
smart-task-evaluator/
├── app/
│   ├── api/                    # API routes
│   │   ├── evaluate/          # Code evaluation endpoint
│   │   ├── payment/           # Payment processing
│   │   │   ├── checkout/      # Stripe checkout session
│   │   │   └── webhook/       # Stripe webhook handler
│   │   └── stats/             # Statistics endpoint (with bugs)
│   ├── auth/                   # Authentication pages
│   │   ├── login/             # Login page
│   │   └── signup/            # Signup page
│   ├── components/             # React components
│   │   └── BrokenModal.tsx    # Demo buggy component
│   ├── context/               # React context providers
│   │   └── AuthContext.tsx    # Authentication context
│   ├── dashboard/             # Dashboard pages
│   │   ├── page.tsx           # Dashboard home
│   │   ├── upload/            # Task upload page
│   │   ├── evaluate/[id]/     # Evaluation results page
│   │   └── payment/[id]/      # Payment page
│   ├── payment/               # Payment results
│   │   └── success/           # Payment success page
│   ├── layout.tsx             # Root layout with AuthProvider
│   ├── page.tsx               # Home/landing page
│   └── globals.css            # Global styles
├── lib/
│   ├── supabase.ts            # Supabase client & types
│   └── utils/
│       └── buggy.ts           # Demo buggy functions
├── public/                     # Static assets
├── .env.local                 # Environment variables
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind CSS config
├── BUGS_DOCUMENTATION.md      # Detailed bug documentation
└── README.md                  # This file
```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Schema

### users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `created_at` (Timestamp)

### tasks
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `title` (String)
- `code` (Text)
- `language` (String)
- `description` (Text, Optional)
- `created_at` (Timestamp)

### evaluations
- `id` (UUID, Primary Key)
- `task_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `score` (Integer, 0-100)
- `strengths` (JSON Array)
- `improvements` (JSON Array)
- `full_report` (Text)
- `is_paid` (Boolean)
- `created_at` (Timestamp)

### payments
- `id` (UUID, Primary Key)
- `evaluation_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `status` (String: pending/completed/failed)
- `amount` (Decimal)
- `stripe_payment_id` (String)
- `created_at` (Timestamp)

## 🔐 Row-Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

- **users**: Only the authenticated user can view their own data
- **tasks**: Users can only see their own tasks
- **evaluations**: Users can only see evaluations for their own tasks
- **payments**: Users can only see their own payment records

## 📖 Usage Guide

### For Users

1. **Sign Up**: Create an account with email and password
2. **Upload Task**: Go to Dashboard → "Upload New Task"
3. **Get Evaluation**: Click task and select "Run AI Evaluation"
4. **View Results**: See score, strengths, and improvement areas
5. **Unlock Report**: Pay $4.99 to view detailed analysis
6. **Access History**: View all past evaluations in Dashboard

### For Developers

#### Setup Development Environment
```bash
# Install dependencies
npm install

# Configure environment variables
# Edit .env.local with your credentials

# Run development server
npm run dev

# Open http://localhost:3000 in browser
```

#### Build for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🐛 Known Issues & Intentional Bugs

For demonstration purposes, the following files contain intentional bugs:

1. **`app/components/BrokenModal.tsx`**
   - Missing CSS classes
   - Button styling issues
   - State update race condition

2. **`lib/utils/buggy.ts`**
   - Inefficient algorithms (O(n²) instead of O(n))
   - Memory leaks in caching
   - Weak input validation

3. **`app/api/stats/route.ts`**
   - Missing authentication
   - Security information leakage
   - Memory leak in rate limiting
   - Hardcoded response data

See `BUGS_DOCUMENTATION.md` for detailed information on each issue.

## 🔧 Fixing the Bugs

All intentional bugs are documented for AI tool fixing demonstration. Use your AI assistant to:

1. Review and identify bugs
2. Fix logic errors
3. Improve performance
4. Add proper validation
5. Implement security best practices

## 📊 API Endpoints

### Evaluation
- `POST /api/evaluate` - Evaluate a coding task
  - Request: `{ taskId: string }`
  - Response: Evaluation object with score, strengths, improvements

### Payment
- `POST /api/payment/checkout` - Create Stripe checkout session
  - Request: `{ evaluationId: string }`
  - Response: `{ sessionId: string }`

- `POST /api/payment/webhook` - Stripe webhook (auto-triggered)
  - Unlocks report after successful payment

## 🚀 Deployment

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

### Configure Services
1. **Supabase**: Create project and set up database tables
2. **OpenAI**: Get API key from platform.openai.com
3. **Stripe**: Configure payment account and webhook

## 📝 Notes

- All pages require authentication (except home and auth pages)
- RLS is mandatory on Supabase for production
- Use Stripe test mode for development
- Store all sensitive keys in environment variables

---

**Smart Task Evaluator - Evaluating Code with AI**
This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
