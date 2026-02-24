#!/usr/bin/env node
/**
 * Download secrets from AWS Secrets Manager to local JSON files
 *
 * Fetches {env}/shared, {env}/admin, {env}/examiner, {env}/organization from AWS
 * and saves to secrets/{env}/shared.json, admin.json, etc.
 *
 * Usage:
 *   node download-secrets.js [env]
 *   pnpm run secrets:download dev
 *   pnpm run secrets:download prod
 *
 * Envs: dev, staging, prod
 *
 * For local: use secrets/local/*.json (create manually or copy from dev).
 * Run with env=dev then copy secrets/dev/ to secrets/local/ and edit as needed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SECRET_IDS = ['shared', 'admin', 'examiner', 'organization'];
const AWS_REGION = process.env.AWS_REGION || 'ca-central-1';

function getRepoRoot() {
  let dir = __dirname;
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('Repo root not found');
}

function getSecretsDir(root) {
  return path.join(root, 'secrets');
}

function fetchFromAws(secretId, region) {
  const out = execSync(
    `aws secretsmanager get-secret-value --secret-id ${secretId} --region ${region} --query SecretString --output text`,
    { encoding: 'utf-8' }
  );
  return JSON.parse(out.trim());
}

function downloadSecret(env, secretId, region) {
  const root = getRepoRoot();
  const secretsDir = path.join(getSecretsDir(root), env);
  const fullSecretId = `${env}/${secretId}`;

  try {
    const value = fetchFromAws(fullSecretId, region);
    fs.mkdirSync(secretsDir, { recursive: true });
    const filePath = path.join(secretsDir, `${secretId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf-8');
    console.log(`  ✓ ${env}/${secretId}.json`);
    return true;
  } catch (e) {
    console.warn(`  ⚠ ${fullSecretId} not found or access denied: ${e.message}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2).filter(a => a !== '--');
  const env = args[0] || process.env.THRIVE_ENV || 'dev';

  // All four envs (local, dev, staging, prod) can be downloaded from AWS.
  // local is stored in AWS for new developer onboarding.

  const root = getRepoRoot();
  const secretsDir = path.join(getSecretsDir(root), env);

  console.log(`Downloading AWS secrets to secrets/${env}/ (region: ${AWS_REGION})\n`);

  let any = false;
  for (const secretId of SECRET_IDS) {
    if (downloadSecret(env, secretId, AWS_REGION)) any = true;
  }

  if (!any) {
    console.error('\nNo secrets downloaded. Check AWS credentials and secret names.');
    process.exit(1);
  }

  console.log('\nDone.');
}

main();
