import { useState, useEffect } from 'react';
import { checkHealth } from '../api-connector';

export default function Home() {
  const [status, setStatus] = useState('Checking...');
  const [timestamp, setTimestamp] = useState('');
  
  useEffect(() => {
    async function checkBackendStatus() {
      try {
        const health = await checkHealth();
        setStatus(health.status);
        setTimestamp(health.timestamp);
      } catch (error) {
        setStatus('offline');
        console.error('Error checking health:', error);
      }
    }
    
    checkBackendStatus();
  }, []);
  
  return (
    <div className="container">
      <main>
        <h1>Pulser Web Interface</h1>
        
        <div className="status-card">
          <h2>Backend Status: <span className={status === 'ok' ? 'online' : 'offline'}>{status}</span></h2>
          {timestamp && <p>Last updated: {new Date(timestamp).toLocaleString()}</p>}
        </div>
        
        <div className="navigation">
          <a href="/chat" className="nav-link">Chat with Agents</a>
          <a href="/sketch" className="nav-link">UI Prototyper</a>
          <a href="/tasks" className="nav-link">Task Execution</a>
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
          background-color: #f7f9fc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
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
          color: #1e1e2e;
        }
        
        .status-card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          text-align: center;
        }
        
        .online {
          color: #10B981;
          font-weight: bold;
        }
        
        .offline {
          color: #EF4444;
          font-weight: bold;
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
        }
        
        .nav-link:hover {
          background-color: #6D28D9;
        }
      `}</style>
    </div>
  );
}