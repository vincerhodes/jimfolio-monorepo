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
    },
    {
      name: "connexia",
      cwd: "./apps/connexia",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3005
      }
    },
    {
      name: "wealthinequality",
      cwd: "./apps/wealthinequality",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3002
      }
    },
    {
      name: "veriflow",
      cwd: "./apps/veriflow",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3003
      }
    }
  ]
};
