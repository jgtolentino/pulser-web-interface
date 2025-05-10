#!/bin/bash
# Backend deployment script for Pulser Web Interface

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Pulser Backend Deployment ===${NC}"
echo "Deploying backend API to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Ensure all files are committed
git add .
git commit -m "📦 Prepare backend for Vercel deployment" --allow-empty

# Login to Vercel if needed
vercel whoami || vercel login

# Check if the project exists
if vercel project ls | grep -q "pulser-api"; then
    echo -e "${GREEN}Found existing pulser-api project${NC}"
    # Deploy to existing project
    vercel --prod
else
    echo -e "${YELLOW}Creating new pulser-api project${NC}"
    # Create new project and deploy
    vercel --name pulser-api --confirm --prod
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo "Check your Vercel dashboard for the deployment URL"
echo "Once deployed, update the API_URL in your frontend config to point to the new backend"