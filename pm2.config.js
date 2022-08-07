module.exports = {
  apps : [{
    script: 'index.js',
    name: 'mauth-app',
    instances: 2,
    max_memory_restart: '1G',
  }]
};
