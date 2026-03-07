/**
 * Script to get Supabase access token
 * 
 * Usage:
 *   node scripts/get-token.js your@email.com yourpassword
 */

const email = "admin2@gmail.com";
const password = "12345678";

if (!email || !password) {
  console.log('Usage: node scripts/get-token.js <email> <password>');
  console.log('Example: node scripts/get-token.js user@example.com mypassword123');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

async function getToken() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Login failed:', data.error_description || data.message || data.error);
      process.exit(1);
    }

    console.log('\n✅ Login successful!\n');
    console.log('═'.repeat(60));
    console.log('ACCESS TOKEN:');
    console.log('═'.repeat(60));
    console.log(data.access_token);
    console.log('═'.repeat(60));
    console.log('\nCopy the token above and paste it in Postman.\n');
    console.log('Token expires in:', Math.round(data.expires_in / 60), 'minutes');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getToken();
