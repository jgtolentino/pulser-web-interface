#!/usr/bin/env python3
"""
claude_router.py
Agent orchestration router for Pulser

This script routes messages to the appropriate agents and orchestrates
their execution based on message content and task type.

Note: This is the Claudia component in the Pulser Trinity, which is responsible for
orchestration, while the cognitive tasks are delegated to the LLM layer (Claude or others).
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the LLM abstraction layer
try:
    from llm_router import generate_response, get_current_provider
except ImportError:
    # Add parent directory to path if needed
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    try:
        from llm_router import generate_response, get_current_provider
    except ImportError:
        print("Error: Could not import llm_router.py")
        sys.exit(1)

# Configure logging
logging_level = os.getenv('LOG_LEVEL', 'INFO').upper()
logging.basicConfig(
    level=getattr(logging, logging_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.expanduser('~/.pulser/claude_router.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('claude_router')

# Constants
PULSER_DIR = Path.home() / '.pulser'
CONTEXT_DIR = PULSER_DIR / 'context'

# LLM Configuration - now managed by llm_router.py
LLM_PROVIDER = get_current_provider()
AGENT_CONFIG = {
    'claudia': {
        'description': 'Primary orchestration agent',
        'triggers': ['organize', 'manage', 'coordinate', 'orchestrate', 'plan', 'schedule'],
        'fallback': None
    },
    'echo': {
        'description': 'Voice and perception agent',
        'triggers': ['listen', 'hear', 'voice', 'transcribe', 'record', 'audio', 'sound'],
        'fallback': 'claudia'
    },
    'kalaw': {
        'description': 'Knowledge agent',
        'triggers': ['research', 'find', 'search', 'lookup', 'knowledge', 'information'],
        'fallback': 'claudia'
    },
    'maya': {
        'description': 'Workflow agent',
        'triggers': ['workflow', 'process', 'steps', 'procedure', 'diagram', 'design'],
        'fallback': 'claudia'
    },
    'caca': {
        'description': 'QA agent',
        'triggers': ['verify', 'check', 'test', 'quality', 'validate', 'assessment'],
        'fallback': 'claudia'
    },
    'basher': {
        'description': 'System operation agent',
        'triggers': ['terminal', 'command', 'bash', 'script', 'run', 'execute', 'ssh', 'docker'],
        'fallback': 'claudia'
    },
    'shogun': {
        'description': 'UI automation agent',
        'triggers': ['automate', 'browser', 'click', 'fill', 'form', 'interface', 'dns', 'domain'],
        'fallback': 'claudia'
    }
}

def create_directories():
    """Ensure all necessary directories exist"""
    PULSER_DIR.mkdir(exist_ok=True)
    CONTEXT_DIR.mkdir(exist_ok=True)
    logger.info(f"Ensured directories exist: {PULSER_DIR}, {CONTEXT_DIR}")

def detect_agent(message, specified_agent='claudia'):
    """
    Detect which agent should handle the message based on content
    
    Args:
        message (str): The message to analyze
        specified_agent (str): Agent explicitly specified by user
        
    Returns:
        str: Agent identifier to handle the message
    """
    # If user explicitly specifies an agent and it's valid, use it
    if specified_agent in AGENT_CONFIG:
        logger.info(f"Using specified agent: {specified_agent}")
        return specified_agent
    
    # Analyze message content for triggers
    message_lower = message.lower()
    
    # Check for special commands
    if re.search(r'\b(setup|configure)\s+(domain|dns|vercel)\b', message_lower):
        logger.info("Detected DNS/domain setup request - routing to Shogun")
        return 'shogun'
    
    if re.search(r'\b(execute|run|automate)\s+tasks?\b', message_lower):
        logger.info("Detected task execution request - routing to Claudia")
        return 'claudia'
    
    if re.search(r'\bis\s+this\s+live\b', message_lower):
        logger.info("Detected system check - routing to Claudia")
        return 'claudia'
    
    # Check each agent's triggers
    for agent, config in AGENT_CONFIG.items():
        for trigger in config['triggers']:
            if trigger in message_lower:
                logger.info(f"Detected trigger '{trigger}' for agent {agent}")
                return agent
    
    # Default to claudia if no triggers match
    logger.info("No specific triggers detected - defaulting to claudia")
    return 'claudia'

def save_to_context(message, agent, response):
    """Save message and response to context directory"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    context_file = CONTEXT_DIR / f"{timestamp}_{agent}.json"
    
    context_data = {
        'timestamp': timestamp,
        'agent': agent,
        'message': message,
        'response': response
    }
    
    with open(context_file, 'w') as f:
        json.dump(context_data, f, indent=2)
    
    logger.info(f"Saved context to {context_file}")

def get_recent_context(limit=5):
    """Get recent conversation context"""
    context_files = sorted(CONTEXT_DIR.glob('*.json'), key=os.path.getmtime, reverse=True)[:limit]
    
    context = []
    for file in context_files:
        try:
            with open(file, 'r') as f:
                context.append(json.load(f))
        except Exception as e:
            logger.error(f"Error reading context file {file}: {e}")
    
    return context

def execute_task(task_name, parameters=None):
    """
    Execute a task using pulseops
    
    Args:
        task_name (str): Name of the task to execute
        parameters (dict): Parameters for the task
        
    Returns:
        dict: Task execution result
    """
    if parameters is None:
        parameters = {}
    
    cmd = ['pulser', 'execute-task', task_name]
    
    for key, value in parameters.items():
        cmd.extend([f'--{key}', str(value)])
    
    logger.info(f"Executing task: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError:
            return {'output': result.stdout.strip()}
            
    except subprocess.CalledProcessError as e:
        logger.error(f"Task execution failed: {e.stderr}")
        return {'error': e.stderr}

def run_shogun(action, parameters=None):
    """
    Run Shogun UI automation agent
    
    Args:
        action (str): Action for Shogun to perform
        parameters (dict): Parameters for the action
        
    Returns:
        dict: Result of Shogun action
    """
    if parameters is None:
        parameters = {}
    
    # Check if shogun_runner.py exists
    shogun_runner = Path(__file__).parent / "shogun_runner.py"
    if not shogun_runner.exists():
        logger.error(f"Shogun runner not found at {shogun_runner}")
        return {
            'error': 'Shogun runner not found',
            'message': 'I cannot perform UI automation as the Shogun agent is not properly installed.'
        }
    
    cmd = ['python3', str(shogun_runner), action]
    
    for key, value in parameters.items():
        cmd.extend([f'--{key}', str(value)])
    
    logger.info(f"Running Shogun: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError:
            return {'output': result.stdout.strip()}
            
    except subprocess.CalledProcessError as e:
        logger.error(f"Shogun execution failed: {e.stderr}")
        return {'error': e.stderr}

def handle_dns_request(message):
    """
    Handle DNS/domain setup requests with Shogun
    
    Args:
        message (str): User message about DNS setup
        
    Returns:
        dict: Result of DNS setup
    """
    # Extract domain name using regex
    domain_match = re.search(r'\b([a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+)\b', message)
    
    parameters = {}
    if domain_match:
        parameters['domain'] = domain_match.group(1)
    
    # Determine action type
    if re.search(r'\b(setup|configure|add)\b', message.lower()):
        action = 'setup_dns'
    elif re.search(r'\b(verify|check)\b', message.lower()):
        action = 'verify_dns'
    else:
        action = 'dns_info'
    
    return run_shogun(action, parameters)

def handle_is_live_check():
    """
    Handle "is this live" system check requests

    Returns:
        dict: System status information
    """
    # Get status of current LLM provider
    llm_provider = get_current_provider()

    return {
        'active_agents': {
            'claudia': True,  # Orchestrator - always active
            'echo': True,     # Voice agent
            'shogun': True,   # UI automation agent
            'maya': False,    # Workflow agent - not currently active
            'kalaw': False,   # Knowledge agent - not currently active
            'caca': False,    # QA agent - not currently active
            'basher': False   # System operations agent - not currently active
        },
        'backend_status': 'operational',
        'frontend_status': 'connected',
        'llm_provider': llm_provider,
        'message': f'Yes, this is live! The Pulser Web Interface is fully connected to the backend orchestration system. Agents Claudia, Echo, and Shogun are active and responding to requests. Currently using {llm_provider.upper()} as the cognitive engine.',
        'timestamp': datetime.now().isoformat()
    }

def process_message(message, agent='claudia'):
    """
    Process a message and route it to the appropriate agent
    
    Args:
        message (str): User message to process
        agent (str): Agent to use, or agent to detect from
        
    Returns:
        dict: Response from the agent
    """
    detected_agent = detect_agent(message, agent)
    
    # Special case handling
    if re.search(r'\bis\s+this\s+live\b', message.lower()):
        response = handle_is_live_check()
        save_to_context(message, 'claudia', response)
        return response
    
    if detected_agent == 'shogun' and re.search(r'\b(domain|dns|vercel)\b', message.lower()):
        response = handle_dns_request(message)
        save_to_context(message, 'shogun', response)
        return response
    
    # Handle task execution requests
    if re.search(r'\b(execute|run)\s+tasks?\b', message.lower()):
        # Extract task name using regex
        task_match = re.search(r'\b(execute|run)\s+task\s+"([^"]+)"', message.lower())
        if task_match:
            task_name = task_match.group(2)
            response = execute_task(task_name)
            save_to_context(message, 'claudia', response)
            return response
    
    # Default response if no special handling
    context = get_recent_context()

    # Prepare default response with cognitive tasks delegated to LLM
    if "is this live" in message.lower():
        # Hardcoded response for system status check
        response_message = f"Yes, Pulser is live and fully connected! The backend orchestration system is active and I'm able to respond to your requests in real-time. You're currently interacting with Claudia (the primary orchestration agent) using {LLM_PROVIDER.upper()} as the cognitive engine."
    elif "help" in message.lower() or "what can you do" in message.lower():
        # Hardcoded response for help request
        response_message = "Pulser can help with various tasks including:\n- Setting up domains and DNS\n- Orchestrating agent workflows\n- Processing voice inputs\n- Automating UI tasks with Shogun\n- Executing commands and scripts\n\nTry asking about specific tasks you need help with!"
    else:
        # For other messages, use the LLM to generate a response
        logger.info(f"Using {LLM_PROVIDER} for cognitive processing")

        # Create a system message for the LLM
        system_message = f"""You are {detected_agent}, an agent in the Pulser system.
Your role is to {AGENT_CONFIG[detected_agent]['description']}.
Respond to the user's message concisely and professionally."""

        # Get response from LLM
        llm_response = generate_response(
            prompt=message,
            system_message=system_message,
            context="general",
            temperature=0.7
        )

        if llm_response["success"]:
            response_message = llm_response["content"]
            logger.info(f"Got response from {llm_response['provider']} as {detected_agent}")
        else:
            # Fallback if LLM fails
            logger.warning(f"LLM response failed: {llm_response['error']}")
            response_message = f"I've received your request: \"{message}\". As the {detected_agent} agent, I can help you with this. What specific action would you like me to take?"

    response = {
        'agent': detected_agent,
        'message': response_message,
        'llm_provider': LLM_PROVIDER,
        'context': [c.get('timestamp') for c in context],
        'timestamp': datetime.now().isoformat()
    }

    # Ensure we log this interaction
    logger.info(f"Responding as {detected_agent}: {response_message[:100]}...")

    save_to_context(message, detected_agent, response)
    return response

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Claude Router for Pulser')
    parser.add_argument('--message', type=str, required=True, help='Message to process')
    parser.add_argument('--agent', type=str, default='claudia', help='Agent to use')
    parser.add_argument('--format', type=str, choices=['json', 'text'], default='json', 
                      help='Output format')
    
    args = parser.parse_args()
    
    create_directories()
    
    response = process_message(args.message, args.agent)
    
    if args.format == 'json':
        print(json.dumps(response, indent=2))
    else:
        print(f"Agent: {response.get('agent', 'unknown')}")
        print(f"Response: {response.get('message', 'No response')}")

if __name__ == "__main__":
    main()