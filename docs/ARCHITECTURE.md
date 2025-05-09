# Pulser Web Interface Architecture

This document outlines the architecture of the Pulser Web Interface, showing how components interact and data flows through the system.

## System Overview

The Pulser Web Interface combines a frontend web UI with a backend that integrates multiple LLM providers, including Claude and local models. The system uses an agent-based architecture to route requests to specialized handlers.

```
┌──────────────────┐               ┌──────────────────┐
│                  │               │                  │
│   Frontend UI    │◄──────────────┤   Backend API    │
│  (Next.js/React) │               │    (Express)     │
│                  │               │                  │
└────────┬─────────┘               └────────┬─────────┘
         │                                   │
         │                                   │
         │                                   ▼
┌────────▼─────────┐               ┌──────────────────┐
│                  │               │                  │
│ UI Components    │               │  Claude Router   │
│ - Sketch         │               │  (Agent Manager) │
│ - Chat           │               │                  │
│ - Tasks          │               └────────┬─────────┘
│                  │                        │
└──────────────────┘                        │
                                            │
                     ┌────────────────────────────────────┐
                     │                                    │
                     ▼                                    ▼
              ┌────────────────┐                 ┌─────────────────┐
              │                │                 │                 │
              │  Claude CLI    │                 │  Local LLM      │
              │  Integration   │                 │  Integration    │
              │                │                 │                 │
              └────────────────┘                 └─────────────────┘
```

## Component Descriptions

### Frontend

- **Next.js Application**: Provides routing and server-side rendering
- **React Components**: UI components for different features
- **API Connector**: Client-side utility for backend communication

### Backend

- **Express Server**: Handles HTTP requests and routing
- **Claude Router**: Routes messages to appropriate agents
- **Agent System**: Specialized handlers for different tasks
  - Claudia: Primary orchestration agent
  - Echo: Voice and perception agent
  - Shogun: UI automation agent
  - Others: Kalaw, Maya, etc.

### LLM Integration

- **Claude CLI**: Integration with Anthropic's Claude models
- **Local LLM**: Support for locally running models (Ollama, etc.)
- **Model Routing**: Environment-based configuration for model selection

## Data Flow

1. User interacts with Frontend UI
2. API Connector sends request to Backend API 
3. Express server routes to appropriate endpoint
4. Claude Router determines the handling agent
5. Agent processes request using appropriate LLM
6. Response flows back through the system to user

## Customization Points

- **LLM Provider**: Set via environment variable (`LLM_PROVIDER`)
- **Agent Selection**: Automatic based on message content or explicit
- **Model Settings**: Configurable model parameters

## Deployment Architecture

```
┌────────────────────┐         ┌────────────────────┐
│                    │         │                    │
│    Frontend UI     │         │    Backend API     │
│    (Vercel)        │◄───────►│    (Local Node)    │
│                    │         │                    │
└────────────────────┘         └────────────────────┘
                                        │
                               ┌────────┴───────────┐
                               │                    │
                               │   LLM Provider     │
                               │   (Local/Cloud)    │
                               │                    │
                               └────────────────────┘
```