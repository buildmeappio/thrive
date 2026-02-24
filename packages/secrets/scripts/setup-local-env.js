#!/usr/bin/env node
/**
 * Thrive monorepo - Local development env setup
 *
 * Creates .env files for admin-web, examiner-web, organization-web.
 * Mirrors the deployment flow: shared + app-specific secrets merged.
 *
 * Usage:
 *   pnpm --filter @thrive/secrets run setup:local       # Auto: AWS if available, else template
 *   pnpm --filter @thrive/secrets run setup:local:aws   # Force AWS Secrets Manager
 *   pnpm --filter @thrive/secrets run setup:local:template  # Force .env.example templates
 *   pnpm --filter @thrive/secrets run setup:local:local-json  # Use secrets/local/*.json
 *
 * From repo root:
 *   pnpm run setup:local
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APPS = [
  { dir: 'admin-web', secretId: 'admin' },
  { dir: 'examiner-web', secretId: 'examiner' },
  { dir: 'organization-web', secretId: 'organization' },
];

// Default to "local" for setup:local - new devs fetch local/* from AWS for onboarding.
// Use THRIVE_ENV=dev|staging|prod to fetch other envs.
const ENV = process.env.THRIVE_ENV || 'local';
const AWS_REGION = process.env.AWS_REGION || 'ca-central-1';

const args = process.argv.slice(2);
const sourceArg = args.find(a => a.startsWith('--source='));
let source = sourceArg ? sourceArg.split('=')[1] : 'auto';

function getRepoRoot() {
  let dir = __dirname;
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('Repo root not found (no pnpm-workspace.yaml)');
}

function hasAwsCli() {
  try {
    execSync('aws --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function fetchFromAws(secretId) {
  try {
    const out = execSync(
      `aws secretsmanager get-secret-value --secret-id ${ENV}/${secretId} --region ${AWS_REGION} --query SecretString --output text`,
      { encoding: 'utf-8' }
    );
    return JSON.parse(out.trim());
  } catch (e) {
    throw new Error(`Failed to fetch secret ${ENV}/${secretId}: ${e.message}`);
  }
}

function mergeAndWriteEnv(shared, appSecret, outPath) {
  const merged = { ...shared, ...appSecret };
  const lines = Object.entries(merged).map(
    ([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`
  );
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
}

function getTemplateEnv(appDir) {
  const root = getRepoRoot();
  const templatePath = path.join(root, 'packages', 'secrets', 'templates', `${appDir}.env.example`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  const appTemplatePath = path.join(root, 'apps', appDir, '.env.example');
  if (fs.existsSync(appTemplatePath)) {
    return fs.readFileSync(appTemplatePath, 'utf-8');
  }
  return null;
}

function writeFromTemplate(appDir, outPath) {
  const content = getTemplateEnv(appDir);
  if (!content) {
    console.warn(`No template for ${appDir}, skipping`);
    return false;
  }
  fs.writeFileSync(outPath, content, 'utf-8');
  return true;
}

function getLocalJsonPath(root, env, secretId) {
  return path.join(root, 'secrets', env, `${secretId}.json`);
}

function loadLocalJson(root, env, secretId) {
  const p = getLocalJsonPath(root, env, secretId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function main() {
  const root = getRepoRoot();
  console.log(`Thrive secrets setup (source=${source}, env=${ENV})`);
  console.log(`Repo root: ${root}\n`);

  const useLocalJson =
    source === 'local-json' || (source === 'auto' && loadLocalJson(root, 'local', 'shared'));
  if (useLocalJson) {
    const localEnv = source === 'local-json' ? process.env.THRIVE_ENV || 'local' : 'local';
    const shared = loadLocalJson(root, localEnv, 'shared');
    if (!shared) {
      console.error(
        `secrets/${localEnv}/shared.json not found. Run: pnpm run secrets:download dev`
      );
      process.exit(1);
    }
    for (const { dir, secretId } of APPS) {
      const appSecret = loadLocalJson(root, localEnv, secretId) || {};
      const outPath = path.join(root, 'apps', dir, '.env');
      mergeAndWriteEnv(shared, appSecret, outPath);
      console.log(`  ✓ apps/${dir}/.env (from secrets/${localEnv}/*.json)`);
    }
    console.log('\nDone.');
    return;
  }

  if (source === 'aws' || (source === 'auto' && hasAwsCli())) {
    if (!hasAwsCli()) {
      console.error('AWS CLI not found. Install it or use --source=template');
      process.exit(1);
    }
    let shared;
    try {
      shared = fetchFromAws('shared');
    } catch (e) {
      console.error(e.message);
      if (source === 'aws') process.exit(1);
      console.log('Falling back to template...\n');
      source = 'template';
    }

    if (source !== 'template') {
      for (const { dir, secretId } of APPS) {
        const appSecret = fetchFromAws(secretId);
        const outPath = path.join(root, 'apps', dir, '.env');
        mergeAndWriteEnv(shared, appSecret, outPath);
        console.log(`  ✓ apps/${dir}/.env`);
      }
      console.log('\nDone. .env files created from AWS Secrets Manager.');
      return;
    }
  }

  for (const { dir } of APPS) {
    const outPath = path.join(root, 'apps', dir, '.env');
    if (writeFromTemplate(dir, outPath)) {
      console.log(`  ✓ apps/${dir}/.env (from template)`);
    }
  }
  console.log('\nDone. Review and fill in values in each .env file.');
}

main();
