#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const https = require("https");
const readline = require("readline");

// Load .env file if it exists
function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Configuration with defaults
const OWNER = process.env.OWNER || "thrive-org";
const REPO = process.env.REPO || "prisma-db";
const SRC_PATH = process.env.SRC_PATH || "prisma";
const DEST_PATH = process.env.DEST_PATH || "./prisma";
const BRANCH = process.argv[2] || process.env.BRANCH || "develop";

// GitHub API helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${options.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Node.js",
        ...options.headers,
      },
    };

    const req = https.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, statusCode: res.statusCode, headers: res.headers });
        } else {
          reject(
            new Error(`Request failed with status ${res.statusCode}: ${data}`)
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Prompt for GitHub token
function promptForToken() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "GitHub token not found. Please enter your GitHub token: ",
      (token) => {
        rl.close();
        resolve(token.trim());
      }
    );
  });
}

// Configuration for parallel downloads
const MAX_CONCURRENT_DOWNLOADS = parseInt(
  process.env.MAX_CONCURRENT_DOWNLOADS || "50",
  10
);

// Download a file from GitHub
async function downloadFile(filePath, destPath, token) {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`;
    const response = await makeRequest(url, {
      token,
      headers: {
        Accept: "application/vnd.github.v3.raw",
      },
    });

    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(destPath, response.data, "utf8");
    return { success: true, filePath, destPath };
  } catch (error) {
    return { success: false, filePath, error: error.message };
  }
}

// Recursively collect all files that need to be downloaded
async function collectFiles(srcDir, destDir, token, fileList = []) {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${srcDir}?ref=${BRANCH}`;
    const response = await makeRequest(url, { token });

    let contents;
    try {
      contents = JSON.parse(response.data);
    } catch {
      console.error(`Failed to parse response for: ${srcDir}`);
      return fileList;
    }

    // Handle single file (object) or directory (array)
    if (Array.isArray(contents)) {
      // Directory: collect all subdirectories and files
      const subdirs = [];

      for (const item of contents) {
        if (!item.name || !item.type) {
          continue;
        }

        const srcItem = `${srcDir}/${item.name}`;
        const destItem = path.join(destDir, item.name);

        if (item.type === "file") {
          fileList.push({ filePath: srcItem, destPath: destItem });
        } else if (item.type === "dir") {
          subdirs.push(collectFiles(srcItem, destItem, token, fileList));
        }
      }

      // Process subdirectories in parallel
      await Promise.all(subdirs);
    } else if (contents.type === "file") {
      // Single file
      fileList.push({ filePath: srcDir, destPath: destDir });
    } else {
      console.error(`Unexpected response format for: ${srcDir}`);
    }

    return fileList;
  } catch (error) {
    console.error(
      `Failed to fetch directory contents: ${srcDir}`,
      error.message
    );
    return fileList;
  }
}

// Process downloads with concurrency control
async function downloadWithConcurrency(fileList, token) {
  const results = [];
  let completed = 0;
  const total = fileList.length;

  // Process in batches
  for (let i = 0; i < fileList.length; i += MAX_CONCURRENT_DOWNLOADS) {
    const batch = fileList.slice(i, i + MAX_CONCURRENT_DOWNLOADS);
    const batchPromises = batch.map(({ filePath, destPath }) =>
      downloadFile(filePath, destPath, token)
    );

    const batchResults = await Promise.allSettled(batchPromises);

    for (const result of batchResults) {
      completed++;
      if (result.status === "fulfilled") {
        const { success, filePath, error } = result.value;
        if (success) {
          console.log(`✓ [${completed}/${total}] Downloaded: ${filePath}`);
          results.push({ success: true, filePath });
        } else {
          console.error(
            `✗ [${completed}/${total}] Failed: ${filePath} - ${error}`
          );
          results.push({ success: false, filePath, error });
        }
      } else {
        console.error(`✗ [${completed}/${total}] Failed: ${result.reason}`);
        results.push({ success: false, error: result.reason });
      }
    }
  }

  return results;
}

// Main execution
async function main() {
  let token = process.env.GITHUB_TOKEN;

  if (!token) {
    token = await promptForToken();
    if (!token) {
      console.error("GitHub token is required");
      process.exit(1);
    }
  }

  console.log(
    `Fetching prisma folder from ${OWNER}/${REPO} (branch: ${BRANCH})...`
  );
  console.log(`Using ${MAX_CONCURRENT_DOWNLOADS} concurrent downloads\n`);

  // Step 1: Collect all files that need to be downloaded
  console.log("Collecting files...");
  const fileList = await collectFiles(SRC_PATH, DEST_PATH, token);

  if (fileList.length === 0) {
    console.log("No files found to download.");
    process.exit(1);
  }

  console.log(`Found ${fileList.length} file(s) to download\n`);

  // Step 2: Download all files in parallel with concurrency control
  const startTime = Date.now();
  const results = await downloadWithConcurrency(fileList, token);
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Step 3: Report results
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Download completed in ${duration}s`);
  console.log(`✓ Successful: ${successful}/${fileList.length}`);
  if (failed > 0) {
    console.log(`✗ Failed: ${failed}/${fileList.length}`);
  }
  console.log(`${"=".repeat(50)}\n`);

  if (successful > 0) {
    console.log(`✓ Prisma folder and prisma.config.ts copied successfully`);
  }

  if (failed > 0) {
    console.log(`⚠ Some files failed to download. Check the errors above.`);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
