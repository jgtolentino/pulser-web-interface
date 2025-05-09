#!/usr/bin/env python3
"""
llm_router.py

Abstract interface for various LLM providers in the Pulser system.
Provides a uniform API for interacting with different language models.

Supported models:
- Claude (Anthropic)
- DeepSeekr1
- Mistral
- OpenAI (GPT)
- Local LLMs via API

This abstraction layer allows the Claudia orchestrator to use different
LLM providers interchangeably without changing the core orchestration logic.
"""

import os
import json
import subprocess
import requests
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Union

# Import dotenv for environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If dotenv is not available, continue without it
    pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.expanduser('~/.pulser/llm_router.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('llm_router')

# Constants and configuration
DEFAULT_LLM_PROVIDER = "claude"
LLM_PROVIDER = os.getenv("LLM_PROVIDER", DEFAULT_LLM_PROVIDER).lower()
SCRIPTS_DIR = Path(__file__).parent.parent / "scripts"

# Model configurations
MODEL_CONFIGS = {
    "claude": {
        "default_model": os.getenv("CLAUDE_MODEL", "claude-3-sonnet-20240229"),
        "api_key_env": "CLAUDE_API_KEY",
        "api_url": "https://api.anthropic.com/v1/messages"
    },
    "deepseekr1": {
        "default_model": "deepseek-coder-v1.5",
        "api_url": os.getenv("DEEPSEEKR1_API_URL", "http://localhost:8080/v1/chat/completions")
    },
    "mistral": {
        "default_model": "mistral-7b-v0.1",
        "api_key_env": "MISTRAL_API_KEY",
        "api_url": "https://api.mistral.ai/v1/chat/completions"
    },
    "openai": {
        "default_model": os.getenv("OPENAI_MODEL", "gpt-4"),
        "api_key_env": "OPENAI_API_KEY",
        "api_url": "https://api.openai.com/v1/chat/completions"
    },
    "local": {
        "default_model": "local-model",
        "api_url": os.getenv("LOCAL_LLM_ENDPOINT", "http://localhost:11434/v1/chat/completions")
    }
}

def get_current_provider() -> str:
    """Returns the current LLM provider from environment or default"""
    return LLM_PROVIDER

def set_provider(provider: str) -> bool:
    """
    Sets the LLM provider for future requests
    
    Args:
        provider: Name of the provider to use
        
    Returns:
        bool: True if provider was successfully set, False otherwise
    """
    global LLM_PROVIDER
    
    if provider.lower() in MODEL_CONFIGS:
        LLM_PROVIDER = provider.lower()
        logger.info(f"LLM provider set to: {LLM_PROVIDER}")
        return True
    else:
        logger.error(f"Invalid LLM provider: {provider}")
        return False

def generate_response(
    prompt: str,
    system_message: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
    provider: Optional[str] = None,
    context: Optional[str] = "general"
) -> Dict[str, Any]:
    """
    Generate a response from the specified LLM provider
    
    Args:
        prompt: User prompt to send to the model
        system_message: Optional system message/instructions
        model: Specific model to use (if None, uses provider default)
        temperature: Creativity setting (0.0 to 1.0)
        max_tokens: Maximum tokens to generate
        provider: Override the default provider
        context: Context type for specialized handling (e.g., "code", "general")
        
    Returns:
        Dict with:
            - content: Generated text response
            - model: The model used
            - provider: The provider used
            - success: Whether the request succeeded
            - error: Error message if unsuccessful
    """
    used_provider = provider.lower() if provider else LLM_PROVIDER
    
    if used_provider not in MODEL_CONFIGS:
        logger.error(f"Invalid LLM provider: {used_provider}")
        return {
            "content": "",
            "model": "",
            "provider": used_provider,
            "success": False,
            "error": f"Invalid LLM provider: {used_provider}"
        }
    
    # Get provider config
    config = MODEL_CONFIGS[used_provider]
    used_model = model or config.get("default_model")
    
    # Route based on provider
    if used_provider == "claude":
        return _generate_claude_response(prompt, system_message, used_model, temperature, max_tokens, context)
    elif used_provider == "openai":
        return _generate_openai_response(prompt, system_message, used_model, temperature, max_tokens)
    elif used_provider == "mistral":
        return _generate_mistral_response(prompt, system_message, used_model, temperature, max_tokens)
    elif used_provider == "deepseekr1":
        return _generate_deepseekr1_response(prompt, system_message, used_model, temperature, max_tokens)
    elif used_provider == "local":
        return _generate_local_response(prompt, system_message, used_model, temperature, max_tokens)
    else:
        # Fallback to CLI-based execution
        return _generate_fallback_response(prompt, system_message, context)

def _generate_claude_response(
    prompt: str,
    system_message: Optional[str],
    model: str,
    temperature: float,
    max_tokens: Optional[int],
    context: Optional[str]
) -> Dict[str, Any]:
    """Generate response using Claude API or CLI"""
    # Check if Claude CLI is available
    claude_cli_available = _is_command_available("claude")
    
    if claude_cli_available and os.path.exists(SCRIPTS_DIR / "claude_with_context.sh"):
        # Use Claude CLI with context script
        logger.info(f"Generating Claude response using CLI: {model}")
        
        # Construct the system and user message
        formatted_prompt = prompt
        if system_message:
            formatted_prompt = f"{system_message}\n\n{prompt}"
        
        # Use the claude_with_context.sh script
        try:
            script_path = SCRIPTS_DIR / "claude_with_context.sh"
            process = subprocess.Popen(
                ["bash", str(script_path)],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Pass the prompt to stdin
            stdout, stderr = process.communicate(input=formatted_prompt)
            
            if process.returncode != 0:
                logger.error(f"Claude CLI error: {stderr}")
                return {
                    "content": "",
                    "model": model,
                    "provider": "claude",
                    "success": False,
                    "error": stderr
                }
            
            logger.info(f"Claude CLI response generated successfully")
            return {
                "content": stdout,
                "model": model,
                "provider": "claude",
                "success": True,
                "error": ""
            }
            
        except Exception as e:
            logger.error(f"Claude CLI exception: {str(e)}")
            return {
                "content": "",
                "model": model,
                "provider": "claude",
                "success": False,
                "error": str(e)
            }
    else:
        # Use Claude API
        api_key = os.getenv(MODEL_CONFIGS["claude"]["api_key_env"])
        if not api_key:
            logger.error("Claude API key not found in environment")
            return {
                "content": "",
                "model": model,
                "provider": "claude",
                "success": False,
                "error": "Claude API key not found"
            }
        
        try:
            headers = {
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            
            messages = []
            if system_message:
                messages.append({"role": "system", "content": system_message})
            
            messages.append({"role": "user", "content": prompt})
            
            data = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
            }
            
            if max_tokens:
                data["max_tokens"] = max_tokens
            
            response = requests.post(
                MODEL_CONFIGS["claude"]["api_url"],
                headers=headers,
                json=data
            )
            
            if response.status_code != 200:
                logger.error(f"Claude API error: {response.text}")
                return {
                    "content": "",
                    "model": model,
                    "provider": "claude",
                    "success": False,
                    "error": response.text
                }
            
            response_data = response.json()
            content = response_data.get("content", [{"text": ""}])[0]["text"]
            
            return {
                "content": content,
                "model": model,
                "provider": "claude",
                "success": True,
                "error": ""
            }
            
        except Exception as e:
            logger.error(f"Claude API exception: {str(e)}")
            return {
                "content": "",
                "model": model,
                "provider": "claude",
                "success": False,
                "error": str(e)
            }

def _generate_openai_response(
    prompt: str,
    system_message: Optional[str],
    model: str,
    temperature: float,
    max_tokens: Optional[int]
) -> Dict[str, Any]:
    """Generate response using OpenAI API"""
    api_key = os.getenv(MODEL_CONFIGS["openai"]["api_key_env"])
    if not api_key:
        logger.error("OpenAI API key not found in environment")
        return {
            "content": "",
            "model": model,
            "provider": "openai",
            "success": False,
            "error": "OpenAI API key not found"
        }
    
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            data["max_tokens"] = max_tokens
        
        response = requests.post(
            MODEL_CONFIGS["openai"]["api_url"],
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            logger.error(f"OpenAI API error: {response.text}")
            return {
                "content": "",
                "model": model,
                "provider": "openai",
                "success": False,
                "error": response.text
            }
        
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        
        return {
            "content": content,
            "model": model,
            "provider": "openai",
            "success": True,
            "error": ""
        }
        
    except Exception as e:
        logger.error(f"OpenAI API exception: {str(e)}")
        return {
            "content": "",
            "model": model,
            "provider": "openai",
            "success": False,
            "error": str(e)
        }

def _generate_mistral_response(
    prompt: str,
    system_message: Optional[str],
    model: str,
    temperature: float,
    max_tokens: Optional[int]
) -> Dict[str, Any]:
    """Generate response using Mistral API"""
    api_key = os.getenv(MODEL_CONFIGS["mistral"]["api_key_env"])
    if not api_key:
        logger.error("Mistral API key not found in environment")
        return {
            "content": "",
            "model": model,
            "provider": "mistral",
            "success": False,
            "error": "Mistral API key not found"
        }
    
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            data["max_tokens"] = max_tokens
        
        response = requests.post(
            MODEL_CONFIGS["mistral"]["api_url"],
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            logger.error(f"Mistral API error: {response.text}")
            return {
                "content": "",
                "model": model,
                "provider": "mistral",
                "success": False,
                "error": response.text
            }
        
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        
        return {
            "content": content,
            "model": model,
            "provider": "mistral",
            "success": True,
            "error": ""
        }
        
    except Exception as e:
        logger.error(f"Mistral API exception: {str(e)}")
        return {
            "content": "",
            "model": model,
            "provider": "mistral",
            "success": False,
            "error": str(e)
        }

def _generate_deepseekr1_response(
    prompt: str,
    system_message: Optional[str],
    model: str,
    temperature: float,
    max_tokens: Optional[int]
) -> Dict[str, Any]:
    """Generate response using DeepSeekr1 API"""
    api_url = MODEL_CONFIGS["deepseekr1"]["api_url"]
    
    try:
        headers = {
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            data["max_tokens"] = max_tokens
        
        response = requests.post(
            api_url,
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            logger.error(f"DeepSeekr1 API error: {response.text}")
            return {
                "content": "",
                "model": model,
                "provider": "deepseekr1",
                "success": False,
                "error": response.text
            }
        
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        
        return {
            "content": content,
            "model": model,
            "provider": "deepseekr1",
            "success": True,
            "error": ""
        }
        
    except Exception as e:
        logger.error(f"DeepSeekr1 API exception: {str(e)}")
        return {
            "content": "",
            "model": model,
            "provider": "deepseekr1",
            "success": False,
            "error": str(e)
        }

def _generate_local_response(
    prompt: str,
    system_message: Optional[str],
    model: str,
    temperature: float,
    max_tokens: Optional[int]
) -> Dict[str, Any]:
    """Generate response using local LLM API (eg. Ollama)"""
    api_url = MODEL_CONFIGS["local"]["api_url"]
    
    try:
        headers = {
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            data["max_tokens"] = max_tokens
        
        response = requests.post(
            api_url,
            headers=headers,
            json=data,
            timeout=30  # Local models might be slower
        )
        
        if response.status_code != 200:
            logger.error(f"Local LLM API error: {response.text}")
            return {
                "content": "",
                "model": model,
                "provider": "local",
                "success": False,
                "error": response.text
            }
        
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        
        return {
            "content": content,
            "model": model,
            "provider": "local",
            "success": True,
            "error": ""
        }
        
    except Exception as e:
        logger.error(f"Local LLM API exception: {str(e)}")
        return {
            "content": "",
            "model": model,
            "provider": "local",
            "success": False,
            "error": str(e)
        }

def _generate_fallback_response(
    prompt: str,
    system_message: Optional[str],
    context: Optional[str]
) -> Dict[str, Any]:
    """Generate response using fallback CLI methods"""
    # Try using pulser command if available
    if _is_command_available("pulser"):
        try:
            cmd = ["pulser", "ask", prompt, "--agent", "claudia"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            return {
                "content": result.stdout,
                "model": "pulser-claudia",
                "provider": "pulser",
                "success": True,
                "error": ""
            }
        except subprocess.CalledProcessError as e:
            logger.error(f"Pulser command error: {e.stderr}")
            return {
                "content": "",
                "model": "pulser-claudia",
                "provider": "pulser",
                "success": False,
                "error": e.stderr
            }
    
    logger.error("No fallback methods available")
    return {
        "content": "I'm sorry, but all LLM providers are currently unavailable.",
        "model": "fallback",
        "provider": "fallback",
        "success": False,
        "error": "No LLM providers available"
    }

def _is_command_available(command: str) -> bool:
    """Check if a command is available in PATH"""
    try:
        subprocess.run(
            ["which", command],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        return True
    except subprocess.CalledProcessError:
        return False

# CLI for testing
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="LLM Router CLI")
    parser.add_argument("--prompt", type=str, required=True, help="Prompt to send to the LLM")
    parser.add_argument("--system", type=str, help="System message")
    parser.add_argument("--provider", type=str, help="LLM provider to use")
    parser.add_argument("--model", type=str, help="Specific model to use")
    parser.add_argument("--temperature", type=float, default=0.7, help="Temperature setting")
    
    args = parser.parse_args()
    
    response = generate_response(
        prompt=args.prompt,
        system_message=args.system,
        model=args.model,
        temperature=args.temperature,
        provider=args.provider
    )
    
    if response["success"]:
        print(f"Provider: {response['provider']}")
        print(f"Model: {response['model']}")
        print("\n--- Response ---\n")
        print(response["content"])
    else:
        print(f"Error: {response['error']}")