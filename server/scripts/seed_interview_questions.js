#!/usr/bin/env node
// Simple Firestore seeder for interview questions
// Usage:
//   node server/scripts/seed_interview_questions.js [path/to/json] [--collection=interview_questions] [--dry-run]

const path = require('path');
// Load env from server/.env to ensure FB_DEV_BASE64_ENCODED_SERVICE_ACCOUNT is available
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const adminApp = require('../configs/firebase-admin.js');
const { getFirestore } = require('firebase-admin/firestore');

const DEFAULT_COLLECTION = 'interview_questions';
const DEFAULT_FILE = path.join(__dirname, 'interview_questions_seed.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { file: DEFAULT_FILE, collection: DEFAULT_COLLECTION, dryRun: false };
  for (const a of args) {
    if (a.startsWith('--collection=')) opts.collection = a.split('=')[1];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (!a.startsWith('--')) opts.file = path.resolve(process.cwd(), a);
  }
  return opts;
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items;
  throw new Error('Seed file must be a JSON array or an object with an "items" array.');
}

function normalize(item, index) {
  if (!item || typeof item.question !== 'string' || !item.question.trim()) {
    throw new Error(`Item at index ${index} is missing a valid 'question' string.`);
  }
  return {
    question: item.question,
    tags: Array.isArray(item.tags) ? item.tags : ['general'],
    difficultyLevel: typeof item.difficultyLevel === 'string' ? item.difficultyLevel : 'medium',
    active: typeof item.active === 'boolean' ? item.active : true,
    rank: typeof item.rank === 'number' ? item.rank : index + 1,
  };
}

async function main() {
  const { file, collection, dryRun } = parseArgs();
  console.log(`Seed: file=${file} collection=${collection} dryRun=${dryRun}`);

  if (!process.env.FB_DEV_BASE64_ENCODED_SERVICE_ACCOUNT) {
    throw new Error(
      "FB_DEV_BASE64_ENCODED_SERVICE_ACCOUNT is not set. Ensure server/.env contains this variable or export it in your shell."
    );
  }

  const items = loadJson(file);
  console.log(`Loaded ${items.length} items from JSON.`);

  const db = getFirestore(adminApp);

  let written = 0;
  for (let i = 0; i < items.length; i++) {
    const docBody = normalize(items[i], i);
    if (dryRun) {
      console.log(`[dry-run] Would write:`, docBody);
      continue;
    }
    await db.collection(collection).add(docBody);
    written++;
  }

  console.log(`Done. ${dryRun ? 'Dry-run complete.' : `Wrote ${written} documents to '${collection}'.`}`);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
