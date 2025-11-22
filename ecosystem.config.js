module.exports = {
  apps: [
    {
      name: "jimfolio",
      cwd: "./apps/jimfolio",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "sweet-reach",
      cwd: "./apps/sweet-reach",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    }
  ]
};
