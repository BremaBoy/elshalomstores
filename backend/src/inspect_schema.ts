import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching order:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Order table ID found. Columns:');
    console.log(JSON.stringify(Object.keys(data[0]), null, 2));
  } else {
    console.log('No data in orders table to inspect columns.');
  }
}

inspectSchema();
