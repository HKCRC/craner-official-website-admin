#!/bin/sh
set -e
mkdir -p /app/public/uploads
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs /app/public/uploads
  exec su-exec nextjs "$@"
fi
exec "$@"
