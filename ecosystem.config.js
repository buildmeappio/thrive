module.exports = {
  apps: [
    {
      name: "thrive-admin",
      script: "npm",
      args: "run start -- -p 3000",
      exec_mode: "fork",
      instances: 1,
      env: { NODE_ENV: "production" },
      cwd: "./",
    },
  ],
};
