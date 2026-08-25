module.exports = {
  apps: [
    {
      name: "gameflex",
      cwd: __dirname,
      script: "./dist/server/index.mjs",
      interpreter: "node",
      env_file: "./.env",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      kill_timeout: 5000,
      time: true,
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: "3000",
        R2_ENDPOINT: process.env.R2_ENDPOINT || "",
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
        R2_REGION: process.env.R2_REGION || "auto",
        STORAGE_PROVIDER: "r2",
      },
    },
  ],
};
