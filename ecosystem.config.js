module.exports = {
  apps: [
    {
      name: 'thrive-admin',
      script: 'npm',
      args: 'start',
      exec_mode: 'cluster',
      instances: 1,
      cwd: './',
    },
  ],
};