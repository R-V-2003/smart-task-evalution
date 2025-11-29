# Database Migrations

This folder contains SQL migrations for the Smart Task Evaluator database.

## How to Apply Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the content of the migration file
4. Paste and run the SQL

### Using Supabase CLI

```bash
# If you have supabase CLI installed
supabase db push
```

## Migrations

### `add_fixed_code_column.sql`
- **Purpose**: Adds `fixed_code` column to store AI-generated improved code
- **Required**: Yes (for new "Fixed Code" feature)
- **When to apply**: Before deploying the latest code changes

This migration adds support for the AI to generate a complete rewritten version of user code with all improvements applied.
