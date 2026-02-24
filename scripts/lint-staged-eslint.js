#!/usr/bin/env node

// Extract app name from file path and run eslint for that app
const files = process.argv.slice(2);

const filesByApp = {};
files.forEach((file) => {
  const match = file.match(/apps\/([^/]+)\//);
  if (match) {
    const appName = match[1];
    if (!filesByApp[appName]) {
      filesByApp[appName] = [];
    }
    filesByApp[appName].push(file);
  }
});

// Run eslint for each app
Object.entries(filesByApp).forEach(([appName, appFiles]) => {
  const { execSync } = require('child_process');
  try {
    execSync(`pnpm --filter ${appName} exec eslint --fix ${appFiles.join(' ')}`, {
      stdio: 'inherit',
    });
  } catch (error) {
    process.exit(1);
  }
});
