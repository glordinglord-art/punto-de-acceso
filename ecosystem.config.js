module.exports = {
  apps: [
    {
      name: 'vitalfit-backend',
      cwd: '/home/kali/Documentos/punto-de-acceso/olympus-bite-bk',
      script: 'npm',
      args: 'run start:dev',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'vitalfit-frontend',
      cwd: '/home/kali/Documentos/punto-de-acceso/olympus-bite-ft',
      script: 'npm',
      args: 'run dev -- -p 3001',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
