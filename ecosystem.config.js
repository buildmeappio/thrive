module.exports = {
  apps: [
    {
      name: 'thrive-organization',
      script: 'npm',
      args: 'run start -- -p 3002',
      exec_mode: 'fork',
      instances: 1,
      env: { NODE_ENV: 'production' },
      cwd: './',
    },
  ],
};
