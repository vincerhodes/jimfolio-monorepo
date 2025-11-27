module.exports = {
  apps: [
    {
      name: 'veriflow',
      script: 'npm',
      args: 'start',
      cwd: '/home/jimmy/jimfolio-monorepo/apps/veriflow',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    }
  ]
};
