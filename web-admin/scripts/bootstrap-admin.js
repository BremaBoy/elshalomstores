const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yevreptswbayuxmxlblt.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldnJlcHRzd2JheXV4bXhsYmx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNDg3NiwiZXhwIjoyMDg4ODAwODc2fQ.WA5Ip10xtGj2H_V47UIy9_MlBfU7-JK5R85bqst4XDk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdmin() {
  const email = 'brematech27@gmail.com';
  console.log(`Checking if admin exists: ${email}...`);

  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const existingUser = users.users.find(u => u.email === email);
  if (existingUser) {
    console.log('User already exists in auth.users.');
  } else {
    console.log('Creating new admin user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: { full_name: 'Brematech Admin' }
    });

    if (createError) {
      console.error('Error creating user:', createError);
    } else {
      console.log('Admin user created successfully:', newUser.user.id);
    }
  }
}

createAdmin();
