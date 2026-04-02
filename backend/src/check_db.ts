import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log('Checking Supabase Database content...');
  
  const { count: productCount, error: pError } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`Products count: ${productCount ?? 0}`);
  
  const { count: categoryCount, error: cError } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  console.log(`Categories count: ${categoryCount ?? 0}`);

  const { count: orderCount, error: oError } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log(`Orders count: ${orderCount ?? 0}`);
}

checkDb();
