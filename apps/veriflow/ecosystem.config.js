module.exports = {
  apps: [
    {
      name: 'veriflow',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/jimfolio.space/veriflow',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: '/var/log/pm2/veriflow-error.log',
      out_file: '/var/log/pm2/veriflow-out.log',
      log_file: '/var/log/pm2/veriflow-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
