/**
 * PulserIntegration.js
 *
 * A component providing options to push generated UI to Pulser system,
 * save to repositories, or create tasks.
 */

import { useState, useEffect } from 'react';

const PulserIntegration = ({ generatedHTML, componentName, isLoading, onPushToPulser }) => {
  const [destination, setDestination] = useState('task');
  const [fileName, setFileName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [pushStatus, setPushStatus] = useState('');

  // Generate suggested file name based on component name
  useEffect(() => {
    if (componentName) {
      setFileName(`${componentName.toLowerCase().replace(/\s+/g, '-')}.html`);
    } else {
      setFileName('sketch-ui.html');
    }

    // Also generate a task name if needed
    if (!taskName && componentName) {
      setTaskName(`Implement ${componentName} UI component`);
    }
  }, [componentName]);

  const handlePushClick = () => {
    setShowOptions(!showOptions);
    setPushStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!generatedHTML) return;
    
    try {
      setPushStatus('pushing');
      
      const pushData = {
        destination,
        code: generatedHTML,
        fileName,
        taskName: destination === 'task' ? taskName : undefined,
        repoPath: destination === 'repo' ? repoPath : undefined
      };
      
      await onPushToPulser(pushData);
      
      setPushStatus('success');
      setTimeout(() => {
        setShowOptions(false);
        setPushStatus('');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to push to Pulser:', error);
      setPushStatus('error');
    }
  };

  return (
    <div className="pulser-integration">
      <button 
        className="push-button"
        onClick={handlePushClick}
        disabled={isLoading || !generatedHTML}
      >
        🚀 Push to Pulser
      </button>
      
      {showOptions && (
        <div className="push-options">
          <form onSubmit={handleSubmit}>
            <div className="option-group">
              <label className="option-label">Destination</label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="destination"
                    value="task"
                    checked={destination === 'task'}
                    onChange={() => setDestination('task')}
                  />
                  Create Task
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="destination"
                    value="repo"
                    checked={destination === 'repo'}
                    onChange={() => setDestination('repo')}
                  />
                  Push to Repository
                </label>
              </div>
            </div>
            
            <div className="option-group">
              <label className="option-label" htmlFor="fileName">
                File Name
              </label>
              <input
                type="text"
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="text-input"
                required
              />
            </div>
            
            {destination === 'task' && (
              <div className="option-group">
                <label className="option-label" htmlFor="taskName">
                  Task Name
                </label>
                <input
                  type="text"
                  id="taskName"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="text-input"
                  required
                />
              </div>
            )}
            
            {destination === 'repo' && (
              <div className="option-group">
                <label className="option-label" htmlFor="repoPath">
                  Repository Path
                </label>
                <input
                  type="text"
                  id="repoPath"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  className="text-input"
                  placeholder="e.g., src/components/"
                  required
                />
              </div>
            )}
            
            <div className="push-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowOptions(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="confirm-button"
                disabled={pushStatus === 'pushing'}
              >
                {pushStatus === 'pushing' ? 'Pushing...' : 'Confirm'}
              </button>
            </div>
            
            {pushStatus === 'success' && (
              <div className="status-message success">
                Successfully pushed to Pulser!
              </div>
            )}
            
            {pushStatus === 'error' && (
              <div className="status-message error">
                Failed to push to Pulser. Please try again.
              </div>
            )}
          </form>
        </div>
      )}
      
      <style jsx>{`
        .pulser-integration {
          position: relative;
          margin-top: 1rem;
        }
        
        .push-button {
          padding: 0.75rem 1.5rem;
          background-color: #0F172A;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
        }
        
        .push-button:hover {
          background-color: #1E293B;
        }
        
        .push-button:disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }
        
        .push-options {
          margin-top: 1rem;
          padding: 1.5rem;
          background-color: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .option-group {
          margin-bottom: 1rem;
        }
        
        .option-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          color: #374151;
        }
        
        .radio-options {
          display: flex;
          gap: 1.5rem;
        }
        
        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #4B5563;
          cursor: pointer;
        }
        
        .text-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .text-input:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
        }
        
        .push-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .cancel-button {
          padding: 0.75rem 1.5rem;
          background-color: white;
          color: #4B5563;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .cancel-button:hover {
          background-color: #f9fafb;
        }
        
        .confirm-button {
          padding: 0.75rem 1.5rem;
          background-color: #0F172A;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .confirm-button:hover {
          background-color: #1E293B;
        }
        
        .confirm-button:disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }
        
        .status-message {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
          text-align: center;
        }
        
        .success {
          background-color: #D1FAE5;
          color: #065F46;
        }
        
        .error {
          background-color: #FEE2E2;
          color: #B91C1C;
        }
      `}</style>
    </div>
  );
};

export default PulserIntegration;