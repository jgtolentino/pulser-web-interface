#!/bin/bash
# QA check script for Pulser Web Interface deployment
# Usage: ./run_qa_checks.sh [URL]

URL=${1:-"https://pulser-ai.app"}
REPORT_FILE="deployment_qa_report_$(date +%Y%m%d_%H%M%S).log"
errors=0
warnings=0

echo "🔍 Running QA checks on $URL"
echo "📋 Report will be saved to $REPORT_FILE"
echo "-------------------------------------------"

# Function to log messages
log() {
  echo "$1" | tee -a "$REPORT_FILE"
}

log "QA Check Report for $URL"
log "Date: $(date)"
log "-------------------------------------------"

# Check frontend routes
log "\n🌐 Checking frontend routes..."
for route in "/" "/sketch"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "${URL}${route}")
  if [[ $status -eq 200 ]]; then
    log "✅ Route ${route}: ${status} OK"
  else
    log "❌ Route ${route}: ${status} FAILED"
    errors=$((errors+1))
  fi
done

# Check API routes
log "\n🔌 Checking API routes..."
api_routes=("/api/health" "/api/message")
for route in "${api_routes[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "${URL}${route}")
  if [[ $status -eq 200 ]]; then
    log "✅ API ${route}: ${status} OK"
  else
    log "⚠️ API ${route}: ${status} - Backend may still be configuring"
    warnings=$((warnings+1))
  fi
done

# Test sketch generation (if backend is available)
log "\n🎨 Testing sketch generation..."
response=$(curl -s -X POST "${URL}/api/sketch_generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a simple button"}' || echo "error")

if [[ $response == *"error"* ]] || [[ $response == "" ]]; then
  log "⚠️ Sketch generation API not responding - Backend may still be configuring"
  warnings=$((warnings+1))
else
  log "✅ Sketch generation API responding"
  if [[ $response == *"echoReview"* ]]; then
    log "✅ Echo rendering is working"
  else
    log "⚠️ Echo rendering may not be configured"
    warnings=$((warnings+1))
  fi
fi

# Performance check
log "\n⚡ Basic performance check..."
start_time=$(date +%s%N 2>/dev/null || date +%s)
curl -s "${URL}/" > /dev/null
end_time=$(date +%s%N 2>/dev/null || date +%s)

# Handle both nanosecond and regular second timing
if [[ ${#start_time} -gt 10 ]]; then
  # Nanosecond timing available
  load_time=$(( ($end_time - $start_time) / 1000000 ))
  log "Homepage load time: ${load_time}ms"
  if (( $load_time > 2000 )); then
    log "⚠️ Homepage load time exceeds 2 seconds"
    warnings=$((warnings+1))
  fi
else
  # Only second-level timing available
  load_time=$(( $end_time - $start_time ))
  log "Homepage load time: ${load_time}s"
  if (( $load_time > 2 )); then
    log "⚠️ Homepage load time exceeds 2 seconds"
    warnings=$((warnings+1))
  fi
fi

# Summary
log "\n📊 QA Check Summary:"
log "-------------------------------------------"
log "Total errors: $errors"
log "Total warnings: $warnings"

if [[ $errors -eq 0 && $warnings -eq 0 ]]; then
  log "✅ All checks PASSED!"
  status="passed"
elif [[ $errors -eq 0 ]]; then
  log "⚠️ Checks PASSED with warnings"
  status="warning"
else
  log "❌ Some checks FAILED"
  status="failed"
fi

log "\n🔗 Deployment: $URL"
log "🧪 Status: $status"
log "📅 Date: $(date)"

echo "-------------------------------------------"
echo "🧪 QA Check Status: $status"
echo "📋 Check $REPORT_FILE for full report"

# Ping Caca
if command -v pulser &> /dev/null; then
  echo "Pinging Caca with QA results..."
  pulser :qa deployment-report --url "$URL" --status "$status" --errors "$errors" --warnings "$warnings" --agent "Caca"
fi