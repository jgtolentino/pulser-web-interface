#!/bin/bash
# test_llm_providers.sh
# Tests the LLM abstraction layer with different providers

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ENV_FILE="${SCRIPT_DIR}/../.env"
TEST_LOG="${HOME}/.pulser/llm_test.log"

# Test prompt
TEST_PROMPT="What is the capital of France? Please answer in one sentence."

# Create log directory if it doesn't exist
mkdir -p "${HOME}/.pulser"
echo "LLM Provider Test - $(date)" > "${TEST_LOG}"

# Function to test a provider
test_provider() {
    local provider="$1"
    echo ""
    echo "Testing provider: ${provider}"
    echo "=============================================="
    echo "Provider: ${provider}" >> "${TEST_LOG}"
    
    # Set the provider in .env
    if [ -f "${ENV_FILE}" ]; then
        sed -i.bak "s/^LLM_PROVIDER=.*/LLM_PROVIDER=${provider}/" "${ENV_FILE}"
        echo "Updated .env file with LLM_PROVIDER=${provider}"
    else
        echo "LLM_PROVIDER=${provider}" > "${ENV_FILE}"
        echo "Created .env file with LLM_PROVIDER=${provider}"
    fi
    
    # Run the test
    echo "Sending test prompt..."
    echo "${TEST_PROMPT}" | "${SCRIPT_DIR}/claude_with_context.sh" | tee -a "${TEST_LOG}"
    
    # Check result
    if [ ${PIPESTATUS[1]} -eq 0 ]; then
        echo "✅ Provider ${provider} test SUCCEEDED"
        echo "Success: Yes" >> "${TEST_LOG}"
    else
        echo "❌ Provider ${provider} test FAILED"
        echo "Success: No" >> "${TEST_LOG}"
    fi
    
    echo ""
}

# List of providers to test
providers=("claude" "local")

# Add optional providers if API keys exist
if grep -q "OPENAI_API_KEY" "${ENV_FILE}" 2>/dev/null; then
    providers+=("openai")
fi

if grep -q "MISTRAL_API_KEY" "${ENV_FILE}" 2>/dev/null; then
    providers+=("mistral")
fi

if nc -z localhost 8080 2>/dev/null; then
    providers+=("deepseekr1")
fi

if command -v pulser &>/dev/null; then
    providers+=("pulser")
fi

# Run tests for each provider
echo "=== LLM Provider Tests ==="
echo "Testing providers: ${providers[*]}"
echo ""

for provider in "${providers[@]}"; do
    test_provider "${provider}"
done

# Reset to original provider
original_provider=$(grep -E "^LLM_PROVIDER=" "${ENV_FILE}.bak" 2>/dev/null | cut -d= -f2)
if [ -n "${original_provider}" ]; then
    sed -i.bak "s/^LLM_PROVIDER=.*/LLM_PROVIDER=${original_provider}/" "${ENV_FILE}"
    echo "Reset .env to original provider: ${original_provider}"
fi

echo ""
echo "Tests completed. Results saved to ${TEST_LOG}"
echo "==========================="