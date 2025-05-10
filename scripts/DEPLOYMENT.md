# Pulser Web Interface Deployment Guide

This guide explains how to deploy the Pulser Web Interface to Vercel using Claude Code CLI.

## Quick Deployment

You can use the Claude Code CLI with the following command:

```bash
claude :task replace-vercel-deployment \
--project-name "pulser-web-interface" \
--repo-url "https://github.com/jgtolentino/pulser-web-interface" \
--vercel-project "pulser-ai-app" \
--frontend-path "/frontend" \
--env-path ".env.local" \
--build-command "npm run build" \
--output-directory ".next" \
--note "
Replace the old deployment at pulser-ai.app with the new web interface from the updated GitHub repo. 
Ensure:
- The frontend directory is correctly targeted
- Backend routes (/api/sketch_generate, /api/push_sketch) are proxied
- LLM provider values from .env.local are respected
- Clean domain routing is retained
"
```

## Manual Deployment

Alternatively, you can run the deployment script directly:

```bash
# Make the script executable
chmod +x scripts/claude_deploy_patch.sh

# Run the deployment script
./scripts/claude_deploy_patch.sh
```

## Via Pulser CLI

If you prefer using the Pulser CLI:

```bash
pulser task run replace-vercel-deployment
```

This will use the task descriptor at `scripts/replace_vercel_deployment.yaml`.

## Post-Deployment Verification

After deployment, verify the following:

1. Homepage loads at https://pulser-ai.app/
2. Sketch prototyper is accessible at https://pulser-ai.app/sketch
3. API endpoints respond correctly:
   - `/api/health`
   - `/api/message`
   - `/api/sketch_generate`
   - `/api/push_sketch`

## Troubleshooting

If the deployment fails:

1. Check the `claudia_sync.log` file for detailed error messages
2. Verify Vercel CLI authentication status with `vercel whoami`
3. Check project linking with `vercel project ls`
4. Ensure environment variables are correctly set
5. Verify build commands for the Next.js frontend

## Rollback Procedure

To roll back to a previous deployment:

```bash
vercel project ls # Find the project ID
vercel list # List deployment history
vercel rollback PROJECT_ID # Rollback to previous deployment
```