/** PM2 — lancer en prod : pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "petit-heros-film",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
