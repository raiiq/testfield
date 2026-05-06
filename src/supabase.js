
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npyzgvfasmlqwjggqqzc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXpndmZhc21scXdqZ2dxcXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzk5MjQsImV4cCI6MjA5MzY1NTkyNH0.xgnxHpXNI4k90yeYWeibsi2BCphjOUp4hgam6h0Fal4';

export const supabase = createClient(supabaseUrl, supabaseKey);
