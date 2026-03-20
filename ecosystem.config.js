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
    },
    {
      name: "chinahols",
      cwd: "./apps/chinahols",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3106
      }
    },
    {
      name: "powerbi",
      cwd: "./apps/powerbi",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3107
      }
    },
    {
      name: "jade-chinese",
      cwd: "./apps/jade-chinese",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3109
      }
    },
    {
      name: "fantasy-league",
      cwd: "./apps/fantasy-league",
      script: "npx",
      args: "serve -l 3108",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
