# 🔮 Pulser Web Interface

A modern web interface for InsightPulseAI with agent orchestration, code generation, UI prototyping, and more.

## 🚀 Core Interfaces

### 1. Claude Code-style CLI
- `claude_with_context.sh` - Execute Claude CLI commands with context awareness
- `claude_router.py` - Route messages to appropriate agents

### 2. Web UI (Vercel Hosted)
- Unified interface at pulser-ai.app
- API endpoints for message routing, task execution, and code generation
- `/sketch` UI for generating HTML/CSS/JS from natural language prompts

## 🧩 Key Components

### Backend
- **webhook_listener.js**: Express server for handling API requests
- **claude_router.py**: Agent orchestration and message routing
- **shogun_runner.py**: UI automation for browser tasks

### Frontend
- **api-connector.js**: Connectivity layer between frontend and backend
- **SketchPrototyper.js**: UI component for HTML/CSS generation

### Scripts
- **claude_with_context.sh**: Claude CLI execution with context awareness
- **launch_backend.sh**: Start the backend webhook listener

## 🖥️ API Endpoints

- **POST /api/message**: Send a message to an agent
- **POST /api/execute-task**: Execute a task via PulseOps
- **POST /api/voice**: Process voice input with Echo
- **POST /api/claude_code**: Execute code via Claude CLI
- **POST /api/sketch_generate**: Generate HTML/CSS from a prompt
- **GET /health**: Check backend health status

## 🛠 Setup

```bash
# Clone the repository
git clone git@github.com:InsightPulseAI/pulser-web-interface.git
cd pulser-web-interface

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Install dependencies
npm install

# Start the backend server
bash scripts/launch_backend.sh

# In a separate terminal, start the frontend
cd frontend
npm install
npm run dev
```

## 📋 Deployment

### Backend Deployment
1. Install Node.js and dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Or run with PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start webhook_listener.js --name "pulser-backend"
   ```

### Frontend Deployment (Vercel)
1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: URL to your backend API
4. Deploy

## 🧪 Usage Examples

### Generate UI from Prompt
```javascript
const result = await generateSketch(
  "Create a responsive login form with dark theme"
);
```

### Send Message to Agent
```javascript
const result = await sendMessage(
  "Set up DNS records for domain.com",
  "shogun"
);
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Agent Routing System](docs/AGENT_ROUTING.md)
- [LLM Abstraction Layer](docs/LLM_ABSTRACTION.md)

## ⚙️ LLM Configuration

The system supports multiple LLM providers through the LLM abstraction layer:

- **Claude**: Anthropic's Claude models (default)
- **OpenAI**: GPT models from OpenAI
- **Mistral**: Models from Mistral AI
- **DeepSeekr1**: Local DeepSeek Coder models
- **Local**: Local LLM servers like Ollama
- **Pulser**: Legacy Pulser command

Configure via environment variables in `.env` file:

```bash
# Set the LLM provider
LLM_PROVIDER=claude

# Provider-specific configuration
CLAUDE_MODEL=claude-3-sonnet-20240229
CLAUDE_API_KEY=your_api_key_here
```

See [LLM Abstraction Layer](docs/LLM_ABSTRACTION.md) for more details.

---

🚀 **Powered by Claude** | Maintained by InsightPulseAI