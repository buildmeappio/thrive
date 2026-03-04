/* eslint-disable no-console */
import 'dotenv/config';
import Stripe from 'stripe';
import masterDb from './db';
import PlanSeeder from './seeders/plan.seeder';

async function main() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const databaseUrl = process.env.MASTER_DATABASE_URL;

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is required. Set it in .env');
  }
  if (!databaseUrl) {
    throw new Error('MASTER_DATABASE_URL is required.');
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia',
  });

  const planSeeder = new PlanSeeder(masterDb, stripe);
  await planSeeder.run();
}

main()
  .then(async () => {
    await masterDb.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await masterDb.$disconnect();
    process.exit(1);
  });
