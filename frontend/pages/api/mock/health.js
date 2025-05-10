/**
 * API mock endpoint for /api/health
 */
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.1',
    llmProvider: 'claude',
    environment: 'production',
    endpoints: [
      '/api/message',
      '/api/execute-task',
      '/api/voice',
      '/api/claude_code',
      '/api/sketch_generate',
      '/api/push_sketch',
      '/api/health'
    ],
    note: 'This is a mock API endpoint. The real backend is still being configured.'
  });
}