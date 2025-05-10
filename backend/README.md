# Pulser Backend API

This directory contains the backend API for the Pulser Web Interface, including the webhook listener, Claude router, and LLM abstraction layer.

## 🚀 Deployment

### Option 1: Deploy with Vercel (Recommended)

1. **Environment Setup:**
   - Create a `.env` file based on `.env.example`
   - Add your API keys for the LLM providers you want to use

2. **Deploy using the script:**
   ```bash
   ./deploy.sh
   ```
   This script will:
   - Check for Vercel CLI and install if needed
   - Log in to Vercel if required
   - Create a new project or deploy to an existing one
   - Deploy the backend to production

3. **Manual deployment:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy with Railway or Fly.io

For containerized deployment with more control:

1. Create a Dockerfile in this directory
2. Deploy using Railway or Fly.io CLI
3. Set environment variables in the platform dashboard

## 🔌 API Endpoints

- **POST /api/message**: Send a message to an agent
- **POST /api/execute-task**: Execute a task via PulseOps
- **POST /api/voice**: Process voice input with Echo
- **POST /api/sketch_generate**: Generate HTML/CSS from a prompt
- **GET /api/health**: Check backend health status

## 🔧 Configuration

The backend uses environment variables for configuration:

- `LLM_PROVIDER`: Default LLM provider (claude, openai, mistral, local)
- `CLAUDE_API_KEY`: API key for Anthropic's Claude
- `CLAUDE_MODEL`: Claude model to use (claude-3-sonnet-20240229)
- `OPENAI_API_KEY`: API key for OpenAI (optional)
- `MISTRAL_API_KEY`: API key for Mistral AI (optional)
- `LOCAL_LLM_ENDPOINT`: Endpoint for local LLM server (optional)

## 📚 Files

- `webhook_listener.js`: Express server for handling API requests
- `claude_router.py`: Agent orchestration and message routing
- `llm_router.py`: Abstraction layer for different LLM providers
- `shogun_runner.py`: UI automation for browser tasks

## 🧪 Testing Locally

1. Install dependencies:
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Test an endpoint:
   ```bash
   curl -X POST http://localhost:3333/api/health
   ```