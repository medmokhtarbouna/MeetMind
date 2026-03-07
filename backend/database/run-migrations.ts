import * as fs from 'fs';
import * as path from 'path';

function main() {
  console.log('MeetMind Database Migration Runner');
  console.log('========================================');

  const migrationsDir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('No migration files found.');
    process.exit(0);
  }

  console.log(`\nFound ${migrationFiles.length} migration(s):\n`);

  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  console.log('\n========================================');
  console.log('HOW TO RUN MIGRATIONS:');
  console.log('========================================\n');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Navigate to: SQL Editor');
  console.log('4. For each migration file:');
  console.log(`   - Open file from: backend/database/migrations/`);
  console.log('   - Copy the SQL content');
  console.log('   - Paste in SQL Editor');
  console.log('   - Click "Run"');
  console.log('\n========================================\n');
}

main();
