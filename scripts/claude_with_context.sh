#!/bin/bash
# claude_with_context.sh
# Executes LLM commands through the llm_router abstraction layer
# Maintains backwards compatibility with the old Claude CLI name

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="${SCRIPT_DIR}/../backend"
PULSER_DIR="${HOME}/.pulser"
CONTEXT_DIR="${PULSER_DIR}/context"
LOG_FILE="${PULSER_DIR}/llm_cli.log"  # Renamed from claude_cli.log

# Ensure directories exist
mkdir -p "${PULSER_DIR}"
mkdir -p "${CONTEXT_DIR}"

# Log execution
echo "[$(date)] Executing LLM CLI with context" >> "${LOG_FILE}"

# Read prompt from stdin
prompt=$(cat)

# Log the prompt (but sanitize it for sensitive information)
sanitized_prompt=$(echo "${prompt}" | tr '\n' ' ' | cut -c 1-100)
echo "[$(date)] Prompt: ${sanitized_prompt}..." >> "${LOG_FILE}"

# First, try using the llm_router.py Python module (preferred method)
if [ -f "${BACKEND_DIR}/llm_router.py" ]; then
    # Execute llm_router.py directly
    python3 "${BACKEND_DIR}/llm_router.py" --prompt "${prompt}" 2>>"${LOG_FILE}"
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "[$(date)] LLM request completed successfully via llm_router.py" >> "${LOG_FILE}"
        exit 0
    else
        echo "[$(date)] Error: llm_router.py failed with exit code ${exit_code}, falling back to CLI methods" >> "${LOG_FILE}"
        # Continue to fallback methods
    fi
fi

# Load environment variables if .env exists
if [ -f "${SCRIPT_DIR}/../.env" ]; then
    source "${SCRIPT_DIR}/../.env"
fi

# Set defaults if not in environment
LLM_PROVIDER="${LLM_PROVIDER:-claude}"
CLAUDE_MODEL="${CLAUDE_MODEL:-claude-3-sonnet-20240229}"
LOCAL_LLM_ENDPOINT="${LOCAL_LLM_ENDPOINT:-http://localhost:11434/v1/chat/completions}"

# Route based on LLM provider (legacy fallback)
echo "[$(date)] Using fallback method for ${LLM_PROVIDER}" >> "${LOG_FILE}"

case "${LLM_PROVIDER}" in
    "claude")
        # Check if we have a claude command
        if command -v claude &> /dev/null; then
            # Execute Claude CLI
            claude code --model "${CLAUDE_MODEL}" << EOF
${prompt}
EOF
        else
            echo "Error: Claude CLI not found but LLM_PROVIDER=claude."
            echo "Please install Claude CLI or change LLM_PROVIDER in .env"
            exit 1
        fi
        ;;
        
    "openai")
        # Check if we have the openai package
        if command -v python3 -c "import openai" &> /dev/null; then
            # Generate a Python script to call the OpenAI API
            python3 -c "
import os
import openai
import sys

client = openai.Client(api_key=os.environ.get('OPENAI_API_KEY'))
try:
    response = client.chat.completions.create(
        model=os.environ.get('OPENAI_MODEL', 'gpt-4'),
        messages=[
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': sys.stdin.read()}
        ],
        temperature=0.7
    )
    print(response.choices[0].message.content)
except Exception as e:
    print(f'Error: {str(e)}', file=sys.stderr)
    sys.exit(1)
" << EOF
${prompt}
EOF
        else
            echo "Error: OpenAI Python package not installed but LLM_PROVIDER=openai."
            exit 1
        fi
        ;;
        
    "local")
        # Check if we have curl for local LLM
        if command -v curl &> /dev/null; then
            # Format the request for local LLM API
            request_data=$(cat << EOF
{
  "model": "local-model",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "${prompt}"
    }
  ]
}
EOF
)
            # Call the local LLM API
            curl -s -X POST "${LOCAL_LLM_ENDPOINT}" \
                -H "Content-Type: application/json" \
                -d "${request_data}" | jq -r '.choices[0].message.content'
        else
            echo "Error: curl not found for LOCAL_LLM_ENDPOINT access."
            exit 1
        fi
        ;;
        
    "pulser")
        # Fall back to pulser command
        if command -v pulser &> /dev/null; then
            pulser ask "${prompt}" --agent claudia
        else
            echo "Error: pulser command not found but LLM_PROVIDER=pulser."
            exit 1
        fi
        ;;
        
    *)
        echo "Error: Unsupported LLM_PROVIDER: ${LLM_PROVIDER}"
        echo "Please set LLM_PROVIDER to one of: claude, openai, local, pulser"
        exit 1
        ;;
esac

# Log completion
echo "[$(date)] LLM CLI execution completed (provider: ${LLM_PROVIDER})" >> "${LOG_FILE}"