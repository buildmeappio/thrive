// Quote paths so (public), (auth) etc. aren't interpreted as shell subshells
function quote(p) {
  return `"${p.replace(/"/g, '\\"')}"`;
}

module.exports = {
  "apps/**/*.{js,jsx,ts,tsx}": (files) => [
    `prettier --write ${files.map(quote).join(' ')}`,
    `pnpm exec eslint --fix ${files.map(quote).join(' ')}`,
  ],
  "packages/**/*.{js,jsx,ts,tsx}": (files) => `prettier --write ${files.map(quote).join(' ')}`,
  "**/*.{json,css,md}": (files) => `prettier --write ${files.map(quote).join(' ')}`,
};
