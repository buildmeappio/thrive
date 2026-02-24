#!/usr/bin/env node
/**
 * Upload secrets from local JSON files to AWS Secrets Manager
 *
 * Reads from secrets/{env}/shared.json, admin.json, examiner.json, organization.json
 * and uploads to AWS as {env}/shared, {env}/admin, etc.
 *
 * Usage:
 *   node upload-secrets.js [env]
 *   pnpm run secrets:upload dev
 *   pnpm run secrets:upload prod
 *
 * Envs: dev, staging, prod (local has no AWS, use secrets:download to populate local JSON)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
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

function secretExists(secretId, region) {
  try {
    execSync(`aws secretsmanager describe-secret --secret-id ${secretId} --region ${region}`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function runAwsWithSecretFile(secretId, value, region, isCreate) {
  const tmpFile = path.join(os.tmpdir(), `thrive-secret-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(value), 'utf-8');
  try {
    const absPath = path.resolve(tmpFile).replace(/\\/g, '/');
    const fileUrl = absPath.startsWith('/') ? `file://${absPath}` : `file:///${absPath}`;
    const cmd = isCreate
      ? `aws secretsmanager create-secret --name ${secretId} --secret-string "${fileUrl}" --region ${region}`
      : `aws secretsmanager put-secret-value --secret-id ${secretId} --secret-string "${fileUrl}" --region ${region}`;
    execSync(cmd, { stdio: 'inherit' });
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

function uploadSecret(env, secretId, region) {
  const root = getRepoRoot();
  const secretsDir = path.join(getSecretsDir(root), env);
  const filePath = path.join(secretsDir, `${secretId}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ ${env}/${secretId}.json not found, skipping`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let value;
  try {
    value = JSON.parse(content);
  } catch (e) {
    console.error(`  ✗ ${env}/${secretId}.json: invalid JSON`);
    throw e;
  }

  const fullSecretId = `${env}/${secretId}`;
  if (secretExists(fullSecretId, region)) {
    runAwsWithSecretFile(fullSecretId, value, region, false);
    console.log(`  ✓ ${fullSecretId} (updated)`);
  } else {
    runAwsWithSecretFile(fullSecretId, value, region, true);
    console.log(`  ✓ ${fullSecretId} (created)`);
  }
  return true;
}

function main() {
  const args = process.argv.slice(2).filter(a => a !== '--');
  const env = args[0] || process.env.THRIVE_ENV || 'dev';

  // All four envs (local, dev, staging, prod) can be uploaded to AWS.
  // local is used for new developer onboarding - they run setup:local:aws to fetch it.

  const root = getRepoRoot();
  const secretsDir = path.join(getSecretsDir(root), env);

  if (!fs.existsSync(secretsDir)) {
    console.error(`Secrets directory not found: secrets/${env}/`);
    console.error('Create secrets/{env}/shared.json, admin.json, etc. first.');
    process.exit(1);
  }

  console.log(`Uploading secrets/${env}/ to AWS (region: ${AWS_REGION})\n`);

  for (const secretId of SECRET_IDS) {
    try {
      uploadSecret(env, secretId, AWS_REGION);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  }

  console.log('\nDone.');
}

main();
