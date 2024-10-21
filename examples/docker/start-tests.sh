#!/bin/sh
# Start Selenium Standalone Server
# selenium-standalone start &

# Wait for Selenium to start
sleep 10

# Start other services if necessary
pnpm start:server&
pnpm --filter ordersv4fe120 start:silent&

sleep 10

# Use wait-on to ensure services are running
# wait-on tcp:4004 tcp:8080

# Run tests
pnpm --filter ui5-cc-spreadsheetimporter-sample test -- -- --headless ordersv4fe 120
