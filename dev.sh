#!/bin/bash

cleanup() {
    echo ""
    echo "Shutting down..."
    docker compose down 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting Docker..."
docker compose up --build -d

echo ""
echo "Starting Stripe webhook listener..."
echo "Make sure STRIPE_WEBHOOK_SECRET in .env matches the key below"
echo ""
stripe listen --forward-to localhost:3001/api/payments/webhook

cleanup
