#!/bin/bash
# claude_deploy_patch.sh
# Script to replace Vercel deployment with new pulser-web-interface repo

# Log function
log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" | tee -a claudia_sync.log
}

# Error handling
set -e
trap 'log "ERROR: Command failed with exit code $? at line $LINENO"' ERR

# Configuration
PROJECT_NAME="pulser-web-interface"
REPO_URL="https://github.com/jgtolentino/pulser-web-interface"
VERCEL_PROJECT="pulser-ai-app"
FRONTEND_PATH="/frontend"
ENV_PATH=".env.local"
BUILD_COMMAND="npm run build"
OUTPUT_DIRECTORY=".next"

log "Starting Vercel deployment replacement for $PROJECT_NAME"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
log "Working in temporary directory: $TEMP_DIR"

# Clone repository
log "Cloning repository from $REPO_URL"
git clone "$REPO_URL" "$TEMP_DIR/$PROJECT_NAME"
cd "$TEMP_DIR/$PROJECT_NAME"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  log "Installing Vercel CLI"
  npm install -g vercel
fi

# Ensure Vercel is logged in
log "Checking Vercel login status"
if ! vercel whoami &> /dev/null; then
  log "Please log in to Vercel:"
  vercel login
fi

# Navigate to frontend directory
log "Navigating to frontend directory"
cd "$TEMP_DIR/$PROJECT_NAME$FRONTEND_PATH"

# Create Vercel configuration file if needed
cat > vercel.json <<EOL
{
  "version": 2,
  "framework": "nextjs",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://pulser-api.jgtolentino.com/api/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://pulser-api.jgtolentino.com",
    "NEXT_PUBLIC_BACKEND_URL": "https://pulser-api.jgtolentino.com"
  }
}
EOL

log "Created Vercel configuration"

# Set up environment file
cat > .env.local <<EOL
# Pulser Web Interface - Vercel Environment Configuration
NEXT_PUBLIC_API_URL=https://pulser-api.jgtolentino.com
NEXT_PUBLIC_BACKEND_URL=https://pulser-api.jgtolentino.com

# LLM Configuration
LLM_PROVIDER=claude
CLAUDE_MODEL=claude-3-sonnet-20240229

# Feature flags
ENABLE_SKETCH_PROTOTYPER=true
ENABLE_ECHO_REVIEW=true
ENABLE_COMPONENT_SPLITTING=true
ENABLE_PULSER_INTEGRATION=true

# Auth
AUTH_ENABLED=false
EOL

log "Created environment file"

# Also copy any existing environment file if it exists (will override defaults)
if [ -f "$TEMP_DIR/$PROJECT_NAME/$ENV_PATH" ]; then
  cp "$TEMP_DIR/$PROJECT_NAME/$ENV_PATH" .
  log "Copied existing environment file (overriding defaults)"
fi

# Link to Vercel project
log "Linking to Vercel project $VERCEL_PROJECT"
vercel link --project "$VERCEL_PROJECT" --confirm

# Deploy to production
log "Deploying to production"
DEPLOY_URL=$(vercel --prod --confirm)

# Verify deployment
log "Deployment completed. URL: $DEPLOY_URL"
log "Testing routes..."

# Give deployment a moment to fully propagate
sleep 10
log "Starting route tests..."

# Test routes
TEST_ROUTES=("/" "/sketch")
for route in "${TEST_ROUTES[@]}"; do
  log "Testing route: $route"
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL$route")
  if [[ "$RESPONSE" == "200" || "$RESPONSE" == "304" ]]; then
    log "✅ Route $route is accessible (HTTP $RESPONSE)"
  else
    log "⚠️ Route $route returned HTTP $RESPONSE"
  fi
done

# Test API proxy
log "Testing API proxy configuration..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://pulser-api.jgtolentino.com/api/health" || echo "Failed")
log "API endpoint test: $API_RESPONSE"

# Detailed deployment info
log "Fetching detailed deployment information..."
vercel list "$VERCEL_PROJECT" --prod

# Ping Caca for QA
log "Pinging Caca for deployment QA"
echo "{\"service\":\"pulser-web-interface\",\"status\":\"deployed\",\"url\":\"$DEPLOY_URL\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > "$TEMP_DIR/caca_qa_ping.json"

# Clean up
log "Cleaning up temporary directory"
rm -rf "$TEMP_DIR"

log "Deployment process completed successfully"
echo "======================================"
echo "🚀 Deployment completed successfully"
echo "🌐 URL: $DEPLOY_URL"
echo "📋 Check claudia_sync.log for details"
echo "======================================"

exit 0