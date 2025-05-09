# LLM Abstraction Layer

The LLM Abstraction Layer provides a unified interface for different language models in the Pulser system, reinforcing the Trinity architecture where Claude is a cognitive specialist that can be easily swapped with other models, while Claudia remains the orchestrator.

## Architecture

```
┌─────────────────┐               ┌─────────────────┐
│                 │               │                 │
│  Claudia Agent  │◄──────────────┤ Claude Router   │
│  (Orchestrator) │               │ (Coordinator)   │
│                 │               │                 │
└────────┬────────┘               └────────┬────────┘
         │                                  │
         ▼                                  ▼
┌─────────────────┐               ┌─────────────────┐
│                 │               │                 │
│  Agent System   │               │   LLM Router    │
│  (Execution)    │               │ (Abstraction)   │
│                 │               │                 │
└─────────────────┘               └────────┬────────┘
                                           │
                                           ▼
                       ┌─────────────────────────────────────┐
                       │                                     │
                       │           Model Providers           │
                       │                                     │
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│             │  │             │  │             │  │             │
│   Claude    │  │   OpenAI    │  │   Mistral   │  │  DeepSeekr1 │
│             │  │             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## Pulser Trinity Explained

In the Pulser architecture, there are three core components:

1. **Thinking** (Claude or other LLMs) - The cognitive engine responsible for:
   - Reasoning about complex problems
   - Text generation and creativity
   - Analysis and synthesis 

2. **Orchestration** (Claudia) - The coordination layer responsible for:
   - Message routing to specialized agents
   - Task phase execution
   - Determining when to leverage the thinking engine

3. **Execution** (Basher) - The implementation layer responsible for:
   - Shell command execution
   - System operations
   - External tool integration

## LLM Abstraction Benefits

The LLM abstraction layer provides several key benefits:

1. **Modularity**: Claude is a component, not a monolith, allowing it to be easily replaced
2. **Resilience**: System can fall back to alternative models if one provider is unavailable
3. **Flexibility**: Different models can be used for different types of tasks
4. **Cost Optimization**: Use more expensive models only when needed

## Configuration

The LLM provider is configured through environment variables in the `.env` file:

```
# Primary LLM provider setting
LLM_PROVIDER=claude  # Options: claude, openai, mistral, deepseekr1, local

# Provider-specific settings
CLAUDE_MODEL=claude-3-sonnet-20240229
CLAUDE_API_KEY=your_api_key

OPENAI_MODEL=gpt-4-turbo
OPENAI_API_KEY=your_api_key

MISTRAL_MODEL=mistral-large-latest
MISTRAL_API_KEY=your_api_key

# For local models like Ollama
LOCAL_LLM_ENDPOINT=http://localhost:11434/v1/chat/completions
```

## Implementation Files

- **llm_router.py**: Core abstraction layer for LLM providers
- **claude_router.py**: The Claudia orchestration component (which delegates to LLM providers)
- **claude_with_context.sh**: CLI interface for interacting with the abstraction layer

## Usage Example

From Python code:

```python
from llm_router import generate_response

response = generate_response(
    prompt="What is the capital of France?",
    system_message="You are a helpful assistant.",
    temperature=0.7
)

print(response["content"])  # The model's response
```

From the command line:

```bash
echo "What is the capital of France?" | ./scripts/claude_with_context.sh
```

## Adding New Providers

To add support for a new LLM provider:

1. Add the provider configuration to `MODEL_CONFIGS` in llm_router.py
2. Implement a provider-specific generation function (`_generate_new_provider_response`)
3. Update the case statement in claude_with_context.sh for CLI fallback
4. Add the new provider's configuration variables to .env.example

## Future Enhancements

- Provider-specific prompt templates
- Model performance monitoring and auto-switching
- Multi-provider ensembling for critical tasks
- Token usage tracking and budget management