module.exports = {
  apps: [
    {
      name: 'thrive-organization',
      script: 'npm',
      args: 'run start -- -p 3002',
      exec_mode: 'fork',
      instances: 1,
      env: { NODE_ENV: 'production' },
      cwd: process.env.PWD || process.cwd(),
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
