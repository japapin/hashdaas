#!/bin/sh

# Create db directory if it doesn't exist
mkdir -p /app/db

# Set correct DATABASE_URL to use the persistent disk
export DATABASE_URL="file:/app/db/custom.db"

# Run database migrations
if [ -f "/app/prisma/schema.prisma" ]; then
  echo "Running database migrations..."
  npx prisma db push
fi

# Start the application
exec "$@"
