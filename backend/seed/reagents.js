/**
 * REAGENT SEED SCRIPT
 *
 * Usage:
 *   node seed/reagents.js
 *
 * Connects using the existing backend .env / config/env.js.
 * Uses upsert (findOneAndUpdate with upsert:true) — safe to run multiple times.
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const env = require('../config/env');
const Reagent = require('../models/Reagent');
const REAGENTS = require('./reagentData');

async function seed() {
  console.log('\n🧪  COLOR-SAFE — Reagent Knowledge Base Seeder');
  console.log('═'.repeat(52));

  // ── Connect to MongoDB (mirrors logic in config/db.js) ──────────────────────
  let connected = false;

  if (env.MONGODB_URI) {
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅  MongoDB connected: ${mongoose.connection.host} / ${mongoose.connection.name}`);
      connected = true;
    } catch (err) {
      console.warn(`⚠️  Atlas connection failed (${err.message}). Trying localhost…`);
    }
  }

  if (!connected) {
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/color_safe', { serverSelectionTimeoutMS: 3000 });
      console.log('✅  Local MongoDB connected.');
      connected = true;
    } catch (err) {
      console.warn(`⚠️  Local MongoDB unavailable (${err.message}). Trying MongoMemoryServer…`);
    }
  }

  if (!connected) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅  In-Memory MongoDB started at: ${uri}`);
      connected = true;
    } catch (err) {
      console.error(`❌  Cannot reach any MongoDB instance: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n📋  Seeding ${REAGENTS.length} reagents…\n`);

  let inserted = 0;
  let updated = 0;
  let errored = 0;

  for (const reagentDoc of REAGENTS) {
    try {
      const result = await Reagent.findOneAndUpdate(
        { testNo: reagentDoc.testNo },           // match key
        { $set: reagentDoc },                    // full upsert payload
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      // Mongoose doesn't directly tell us "new vs updated" via findOneAndUpdate
      // We check the document's createdAt vs updatedAt to detect
      const isNew =
        result.createdAt &&
        result.updatedAt &&
        Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 500;

      if (isNew) {
        inserted++;
        console.log(`  ➕  [No.${String(reagentDoc.testNo).padStart(2, ' ')}] ${reagentDoc.reagentName}`);
      } else {
        updated++;
        console.log(`  🔄  [No.${String(reagentDoc.testNo).padStart(2, ' ')}] ${reagentDoc.reagentName} (updated)`);
      }
    } catch (err) {
      errored++;
      console.error(`  ❌  [No.${reagentDoc.testNo}] ${reagentDoc.reagentName} — ${err.message}`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(52));
  console.log(`✅  Done.  Inserted: ${inserted}  |  Updated: ${updated}  |  Errors: ${errored}`);

  const totalReactions = REAGENTS.reduce((sum, r) => sum + r.reactions.length, 0);
  console.log(`    Total reagents in DB: ${REAGENTS.length}`);
  console.log(`    Total reactions seeded: ${totalReactions}`);

  if (errored > 0) {
    console.warn(`\n⚠️  ${errored} reagent(s) failed to seed. Check validation errors above.`);
  }

  await mongoose.disconnect();
  console.log('\n🔌  Disconnected from MongoDB.\n');
  process.exit(errored > 0 ? 1 : 0);
}

seed().catch((err) => {
  console.error('❌  Seed script crashed:', err);
  process.exit(1);
});
