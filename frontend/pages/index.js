import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [status, setStatus] = useState('pending');
  const [timestamp, setTimestamp] = useState(new Date().toISOString());
  const [apiHealth, setApiHealth] = useState(null);

  // Check API health status
  useEffect(() => {
    async function checkApiHealth() {
      try {
        // Try mock endpoint directly first, then fall back to the regular endpoint
        const response = await fetch('/api/mock/health', {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (response.ok) {
          const health = await response.json();
          setApiHealth(health);
          setStatus('ok');
        } else {
          console.error('Health check failed:', response.status);
          setStatus('offline');
        }
      } catch (error) {
        console.error('Error checking health:', error);
        setStatus('offline');
      }
    }

    checkApiHealth();

    // Refresh every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="container">
      <Head>
        <title>Pulser Web Interface</title>
        <meta name="description" content="Pulser Web Interface - InsightPulseAI's modern web platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>🔮 Pulser Web Interface</h1>

        <div className="status-card">
          <h2>Backend Status: <span className={status === 'ok' ? 'online' : 'offline'}>
            {status === 'ok' ? 'Connected' : 'Deployment in Progress'}
          </span></h2>
          {timestamp && <p>Deployed: {new Date(timestamp).toLocaleString()}</p>}

          {apiHealth ? (
            <div className="api-info">
              <p>API Version: {apiHealth.version}</p>
              <p>Provider: {apiHealth.llmProvider || 'claude'}</p>
              <p className="note">Using mock API endpoints for demo purposes</p>
            </div>
          ) : (
            <p className="note">The backend API is being configured. Some features may be limited.</p>
          )}
        </div>

        <div className="navigation">
          <a href="/sketch" className="nav-link">UI Prototyper</a>
          <a href="/docs" className="nav-link">Documentation</a>
          <a href="https://github.com/jgtolentino/pulser-web-interface" className="nav-link">GitHub</a>
        </div>
      </main>
      
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #121212;
          color: #f8f9fa;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }

        main {
          padding: 4rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: #cdd6f4;
        }

        .status-card {
          background-color: #1e1e2e;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          width: 100%;
          text-align: center;
        }

        .online {
          color: #10B981;
          font-weight: bold;
        }

        .offline {
          color: #F59E0B;
          font-weight: bold;
        }

        .note {
          color: #a6adc8;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        .api-info {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.9rem;
        }

        .api-info p {
          margin: 0.3rem 0;
          color: #cdd6f4;
        }

        .navigation {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          width: 100%;
        }

        .nav-link {
          background-color: #7C3AED;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
          display: inline-block;
        }

        .nav-link:hover {
          background-color: #6D28D9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}