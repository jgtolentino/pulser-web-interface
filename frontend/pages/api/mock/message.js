/**
 * API mock endpoint for /api/message
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, agent = 'claudia' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Generate a simple response based on the agent
  let responseText;
  switch (agent) {
    case 'claudia':
      responseText = `I'm Claudia, the orchestration agent. I received your message: "${message}". The backend API is still being configured, so this is a simulated response.`;
      break;
    case 'echo':
      responseText = `Echo here! I specialize in voice and perception. Your message was: "${message}". This is a mock response as the backend is still being set up.`;
      break;
    case 'shogun':
      responseText = `Shogun agent reporting. I handle UI automation. You said: "${message}". Note that this is a simulated response during backend deployment.`;
      break;
    default:
      responseText = `Agent ${agent} received your message: "${message}". This is a mock response while the backend API is being configured.`;
  }

  // Simulate a response
  res.status(200).json({
    success: true,
    response: {
      agent,
      message: responseText,
      timestamp: new Date().toISOString(),
      status: 'mocked',
      meta: {
        isMockResponse: true,
        originalMessage: message
      }
    }
  });
}