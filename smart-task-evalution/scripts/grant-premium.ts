import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantPremiumAccess(email: string) {
  try {
    console.log(`\n🔍 Looking up user: ${email}`);

    // Find user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching users:', authError);
      return;
    }

    const user = authUser.users.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    console.log(`✅ Found user: ${user.id}`);
    console.log(`📧 Email: ${user.email}`);

    // Update all evaluations for this user to is_paid = true
    const { data: evaluations, error: updateError } = await supabase
      .from('evaluations')
      .update({ is_paid: true })
      .eq('user_id', user.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating evaluations:', updateError);
      return;
    }

    console.log(`\n✅ Premium access granted!`);
    console.log(`📊 Updated ${evaluations?.length || 0} evaluation(s)`);

    if (evaluations && evaluations.length > 0) {
      console.log('\nUpdated evaluations:');
      evaluations.forEach((evaluation, index) => {
        console.log(`  ${index + 1}. Evaluation ID: ${evaluation.id} - Score: ${evaluation.score}/100`);
      });
    }

    console.log('\n🎉 The user now has full access to all evaluation reports!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'test@example.com';
grantPremiumAccess(email);
