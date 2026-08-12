module.exports = {
  apps: [
    {
      name: "together-list",
      script: "node_modules/.bin/next",
      args: "start -p 3100",
      cwd: "/var/www/together-list",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
