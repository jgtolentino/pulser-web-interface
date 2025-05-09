/**
 * api-connector.js
 *
 * Connection utility for communicating with the Pulser backend
 */

// Backend API URL - defaults to localhost, but can be overridden when deployed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/**
 * Send a message to the backend
 *
 * @param {string} message - Message text to send
 * @param {string} agent - Agent to route to (defaults to claudia)
 * @returns {Promise<Object>} - Response from the backend
 */
export const sendMessage = async (message, agent = 'claudia') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, agent }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Execute a task via the backend
 *
 * @param {string} task - Task to execute
 * @param {Object} params - Task parameters
 * @returns {Promise<Object>} - Task execution result
 */
export const executeTask = async (task, params = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/execute-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task, params }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing task:', error);
    throw error;
  }
};

/**
 * Send voice data for transcription and processing
 *
 * @param {string} audioData - Base64-encoded audio data
 * @returns {Promise<Object>} - Transcription and response
 */
export const processVoice = async (audioData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audioData }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing voice:', error);
    throw error;
  }
};

/**
 * Generate HTML/CSS/JS from a sketch prompt
 *
 * @param {string} prompt - Description of the UI to generate
 * @param {Object} options - Optional generation parameters
 * @returns {Promise<Object>} - Generated code
 */
export const generateSketch = async (prompt, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sketch_generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, options }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating sketch:', error);
    throw error;
  }
};

/**
 * Refine existing HTML with additional instructions
 *
 * @param {string} refinement - Instructions for refinement
 * @param {string} currentHTML - Current HTML to refine
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} - Refined HTML
 */
export const refineSketch = async (refinement, currentHTML, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sketch_generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refinement, currentHTML, options }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error refining sketch:', error);
    throw error;
  }
};

/**
 * Push generated HTML to Pulser system (task or repo)
 *
 * @param {Object} data - Data for push operation
 * @param {string} data.code - HTML code to push
 * @param {string} data.destination - Destination (task or repo)
 * @param {string} data.fileName - File name to save as
 * @param {string} data.taskName - Optional task name (for task destination)
 * @param {string} data.repoPath - Optional repo path (for repo destination)
 * @returns {Promise<Object>} - Push result
 */
export const pushSketchToPulser = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/push_sketch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error pushing sketch to Pulser:', error);
    throw error;
  }
};

/**
 * Execute code via Claude CLI
 *
 * @param {string} prompt - Prompt for Claude
 * @param {string} context - Context for execution (shell, html, etc.)
 * @returns {Promise<Object>} - Claude response
 */
export const executeClaudeCode = async (prompt, context = 'shell') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/claude_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, context }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing Claude code:', error);
    throw error;
  }
};

/**
 * Check backend health status
 *
 * @returns {Promise<Object>} - Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export default {
  sendMessage,
  executeTask,
  processVoice,
  generateSketch,
  refineSketch,
  pushSketchToPulser,
  executeClaudeCode,
  checkHealth,
};