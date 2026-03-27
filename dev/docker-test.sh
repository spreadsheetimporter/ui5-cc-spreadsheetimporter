#!/bin/bash
set -e

# ============================================================================
# Docker Test Runner for UI5 Spreadsheet Importer
# ============================================================================
# Replicates the GitHub Actions CI environment for local debugging.
#
# Usage:
#   docker-test.sh <scenario> <ui5version> [extra-wdio-args...]
#
# Examples:
#   docker-test.sh ordersv2fe 136
#   docker-test.sh ordersv4fe 136 --spec ./test/specs/all/OpenSpreadsheetUploadDialog.test.js
#   docker-test.sh --help
#
# Available scenarios:
#   ordersv2fe, ordersv4fe, ordersv2fenondraft,
#   ordersv2freestylenondraft, ordersv2freestylenondraftopenui5,
#   ordersv4freestyle
#
# Available UI5 versions:
#   136, 120, 108, 96, 84, 71
# ============================================================================

MARKER_FILE="/app/.test-prepared"

show_help() {
    echo "============================================="
    echo " UI5 Spreadsheet Importer - Docker Test Runner"
    echo "============================================="
    echo ""
    echo "Usage: docker run --rm spreadsheet-test <scenario> <ui5version> [wdio-args...]"
    echo ""
    echo "Scenarios:"
    echo "  ordersv2fe                         V2 Fiori Elements (draft)"
    echo "  ordersv4fe                         V4 Fiori Elements (draft)"
    echo "  ordersv2fenondraft                 V2 Fiori Elements (non-draft)"
    echo "  ordersv2freestylenondraft          V2 Freestyle (non-draft)"
    echo "  ordersv2freestylenondraftopenui5   V2 Freestyle OpenUI5 (non-draft)"
    echo "  ordersv4freestyle                  V4 Freestyle"
    echo ""
    echo "UI5 Versions: 136, 120, 108, 96, 84, 71"
    echo ""
    echo "Examples:"
    echo "  docker run --rm spreadsheet-test ordersv2fe 136"
    echo "  docker run --rm spreadsheet-test ordersv4fe 136 --spec ./test/specs/all/OpenSpreadsheetUploadDialog.test.js"
    echo ""
    echo "Volume mounts for debugging:"
    echo "  -v \$(pwd)/examples/test:/app/examples/test          Mount test specs (no rebuild needed)"
    echo "  -v \$(pwd)/examples/reports:/app/examples/reports    Extract timeline reports"
    echo ""
}

cleanup() {
    echo ""
    echo ">>> Cleaning up background processes..."
    # Kill all background jobs
    jobs -p | xargs -r kill 2>/dev/null || true
    wait 2>/dev/null || true
}

trap cleanup EXIT

# Handle --help
if [ "$1" == "--help" ] || [ "$1" == "-h" ] || [ -z "$1" ]; then
    show_help
    exit 0
fi

SCENARIO="$1"
UI5VERSION="$2"
shift 2
EXTRA_ARGS="$@"

# If running inside Docker with system Chromium, configure WebdriverIO to use it
if [ -n "$CHROME_BIN" ] && [ -f "$CHROME_BIN" ]; then
    export WDIO_CHROME_BINARY="$CHROME_BIN"
    CHROME_VERSION=$($CHROME_BIN --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' || echo "unknown")
    echo " Chrome:       $CHROME_BIN ($CHROME_VERSION)"
fi

# Validate inputs
if [ -z "$SCENARIO" ] || [ -z "$UI5VERSION" ]; then
    echo "ERROR: Both <scenario> and <ui5version> are required."
    echo ""
    show_help
    exit 1
fi

# Get the dynamic port for this scenario+version
TESTAPPPORT=$(node ./dev/get-port.js "$SCENARIO" "$UI5VERSION")
if [ -z "$TESTAPPPORT" ]; then
    echo "ERROR: Could not determine port for scenario=$SCENARIO version=$UI5VERSION"
    echo "Check dev/testapps.json for valid combinations."
    exit 1
fi

echo "============================================="
echo " Test Configuration"
echo "============================================="
echo " Scenario:    $SCENARIO"
echo " UI5 Version: 1.$UI5VERSION"
echo " App Port:    $TESTAPPPORT"
echo " Extra Args:  $EXTRA_ARGS"
echo "============================================="

# On-demand build: copyTestApps + build (only on first run)
if [ ! -f "$MARKER_FILE" ]; then
    echo ""
    echo ">>> First run: preparing test apps and building component..."
    echo ">>> This will be skipped on subsequent runs in the same container."
    echo ""

    echo ">>> Running copyTestApps..."
    npm run copyTestApps

    echo ">>> Building component..."
    npm run build

    touch "$MARKER_FILE"
    echo ">>> Preparation complete."
else
    echo ">>> Test apps already prepared (skipping copyTestApps + build)."
fi

echo ""
echo ">>> Starting CAP server on port 4004..."
npm run start:server &
CAP_PID=$!

echo ">>> Starting UI5 app ${SCENARIO}${UI5VERSION} on port ${TESTAPPPORT}..."
npm run start:silent --workspace="${SCENARIO}${UI5VERSION}" &
APP_PID=$!

# Wait for CAP server (port 4004)
echo ">>> Waiting for CAP server (port 4004)..."
if ! timeout 60 bash -c 'until nc -z localhost 4004; do sleep 0.5; done'; then
    echo "ERROR: CAP server did not start within 60 seconds"
    exit 1
fi
echo ">>> CAP server is ready."

# Wait for UI5 app
echo ">>> Waiting for UI5 app (port ${TESTAPPPORT})..."
if ! timeout 60 bash -c "until nc -z localhost ${TESTAPPPORT}; do sleep 0.5; done"; then
    echo "ERROR: UI5 app did not start within 60 seconds on port ${TESTAPPPORT}"
    exit 1
fi
echo ">>> UI5 app is ready."

echo ""
echo "============================================="
echo " Running wdi5 tests"
echo "============================================="
echo ""

# Run the tests
TEST_EXIT_CODE=0
npm run test --workspace=ui5-cc-spreadsheetimporter-sample -- -- --headless "$SCENARIO" "$UI5VERSION" $EXTRA_ARGS || TEST_EXIT_CODE=$?

echo ""
echo "============================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo " Tests PASSED"
else
    echo " Tests FAILED (exit code: $TEST_EXIT_CODE)"
fi
echo "============================================="

# Reports location hint
if [ -d "/app/examples/reports/timeline" ]; then
    echo ""
    echo "Timeline report available at: /app/examples/reports/timeline/timeline-report.html"
    echo "Mount with: -v \$(pwd)/test-results:/app/examples/reports"
fi

exit $TEST_EXIT_CODE
