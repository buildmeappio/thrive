module.exports = {
  apps: [
    {
      name: "thrive-examiner",
      script: "npm",
      args: "run start -- -p 3001",
      exec_mode: "fork",
      instances: 1,
      env: { NODE_ENV: "production" },
      // Use __dirname to always point to the directory containing this config file
      // This ensures PM2 runs from the current release directory (where ecosystem.config.js is located)
      cwd: __dirname,
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
