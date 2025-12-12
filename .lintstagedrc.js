module.exports = {
  // Format and lint TypeScript/JavaScript files
  "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
  // Format JSON, CSS, and Markdown files
  "*.{json,css,md}": ["prettier --write"],
  // Format other common files
  "*.{yml,yaml}": ["prettier --write"],
};
