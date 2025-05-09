/**
 * SketchPrototyper.js
 *
 * Component for the /sketch UI route that allows users to generate HTML/CSS
 * from text prompts using Claude, with live preview and code export.
 * Includes features for component splitting, Echo-assisted review,
 * refinements, and Pulser integration.
 */

import { useState, useEffect, useRef } from 'react';
import { generateSketch, refineSketch, pushSketchToPulser } from './api-connector';
import EchoReviewPanel from './components/EchoReviewPanel';
import ComponentSplitter from './components/ComponentSplitter';
import RefinePromptInput from './components/RefinePromptInput';
import PulserIntegration from './components/PulserIntegration';

// CSS styles for the sketch UI
const styles = `
.sketch-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background-color: #f7f9fc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.sketch-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #1e1e2e;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sketch-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.sketch-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sketch-sidebar {
  width: 400px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.sketch-input-container {
  margin-bottom: 1.5rem;
}

.sketch-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #444;
}

.sketch-textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.sketch-textarea:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.sketch-button {
  background-color: #7C3AED;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sketch-button:hover {
  background-color: #6D28D9;
}

.sketch-button:disabled {
  background-color: #A78BFA;
  cursor: not-allowed;
}

.sketch-button + .sketch-button {
  margin-left: 0.5rem;
}

.sketch-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sketch-secondary-button {
  background-color: #fff;
  color: #1e1e2e;
  border: 1px solid #ddd;
}

.sketch-secondary-button:hover {
  background-color: #f5f5f5;
  color: #1e1e2e;
}

.sketch-preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sketch-preview-toolbar {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.sketch-preview-tab {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.sketch-preview-tab.active {
  background-color: #7C3AED;
  color: white;
}

.sketch-preview-area {
  flex: 1;
  overflow: auto;
  background-color: white;
}

.sketch-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.sketch-code-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  white-space: pre-wrap;
  padding: 1rem;
  overflow: auto;
  height: 100%;
  background-color: #1e1e2e;
  color: #f8f8f2;
}

.sketch-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.sketch-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #7C3AED;
  width: 40px;
  height: 40px;
  animation: sketch-spin 1s linear infinite;
}

@keyframes sketch-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sketch-notification {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.sketch-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
`;

/**
 * SketchUI Component
 * Provides a UI for generating HTML/CSS/JS from text prompts
 */
export default function SketchUI() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [displayedCode, setDisplayedCode] = useState('');
  const [echoReview, setEchoReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'code'
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const iframeRef = useRef(null);

  // Function to generate HTML from the prompt
  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate code');
      return;
    }

    setIsLoading(true);
    setError('');
    setNotification('');
    setEchoReview(null);
    setSelectedComponent(null);

    try {
      const result = await generateSketch(prompt);

      if (result.success && result.output) {
        setGeneratedCode(result.output);
        setDisplayedCode(result.output);

        // Set Echo review if available
        if (result.echoReview) {
          setEchoReview(result.echoReview);
        }

        // Refresh the iframe to display the new code
        updateIframeContent(result.output);
        setNotification('Code generated successfully!');
      } else {
        setError(result.error || 'Failed to generate code. Please try again.');
      }
    } catch (err) {
      console.error('Error generating code:', err);
      setError('An error occurred while generating code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle component selection
  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
    setDisplayedCode(component.code);
    updateIframeContent(component.code);
  };

  // Function to handle refinement
  const handleRefinement = async (refinementPrompt) => {
    if (!refinementPrompt.trim() || !generatedCode) return;

    setIsRefining(true);
    setError('');
    setNotification('');

    try {
      // Use the selected component code for refinement if available,
      // otherwise use the full generated code
      const codeToRefine = selectedComponent ? selectedComponent.code : generatedCode;

      const result = await refineSketch(refinementPrompt, codeToRefine);

      if (result.success && result.output) {
        // If we're refining a component
        if (selectedComponent) {
          // Create a new component with the refined code
          const refinedComponent = {
            ...selectedComponent,
            code: result.output,
          };

          setSelectedComponent(refinedComponent);
          setDisplayedCode(result.output);
          updateIframeContent(result.output);
        } else {
          // If refining the entire code
          setGeneratedCode(result.output);
          setDisplayedCode(result.output);
          updateIframeContent(result.output);
        }

        // Set Echo review if available
        if (result.echoReview) {
          setEchoReview(result.echoReview);
        }

        setNotification('Refinement applied successfully!');
      } else {
        setError(result.error || 'Failed to refine code. Please try again.');
      }
    } catch (err) {
      console.error('Error refining code:', err);
      setError('An error occurred while refining code. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  // Function to push to Pulser system
  const handlePushToPulser = async (pushData) => {
    if (!displayedCode) return;

    try {
      // Include the HTML code in the push data
      const fullPushData = {
        ...pushData,
        code: displayedCode
      };

      const result = await pushSketchToPulser(fullPushData);

      if (result.success) {
        setNotification(`Successfully pushed to ${pushData.destination}!`);
        return result;
      } else {
        setError(result.error || `Failed to push to ${pushData.destination}. Please try again.`);
        throw new Error(result.error || 'Push failed');
      }
    } catch (err) {
      console.error('Error pushing to Pulser:', err);
      setError('An error occurred while pushing to Pulser. Please try again.');
      throw err;
    }
  };

  // Function to update the iframe content
  const updateIframeContent = (htmlContent) => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
  };

  // Function to copy code to clipboard
  const handleCopyCode = () => {
    if (!displayedCode) return;

    navigator.clipboard.writeText(displayedCode)
      .then(() => {
        setNotification('Code copied to clipboard!');
        setTimeout(() => setNotification(''), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy code:', err);
        setError('Failed to copy code to clipboard');
      });
  };

  // Export code as HTML file
  const handleExportCode = () => {
    if (!displayedCode) return;

    const blob = new Blob([displayedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `pulser-sketch-${selectedComponent?.name || 'ui'}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    setNotification('Code exported as HTML file!');
    setTimeout(() => setNotification(''), 3000);
  };

  // Update iframe when code changes
  useEffect(() => {
    if (displayedCode) {
      updateIframeContent(displayedCode);
    }
  }, [displayedCode]);

  return (
    <div className="sketch-container">
      <style>{styles}</style>

      <header className="sketch-header">
        <h1 className="sketch-title">Pulser Sketch - UI Prototyper</h1>
      </header>

      <div className="sketch-content">
        {/* Left Sidebar - Prompt Input */}
        <div className="sketch-sidebar">
          <div className="sketch-input-container">
            <label className="sketch-label" htmlFor="prompt-input">Describe the UI you want to generate:</label>
            <textarea
              id="prompt-input"
              className="sketch-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Generate a responsive landing page with a header, hero section, and CTA"
              disabled={isLoading || isRefining}
            />
          </div>

          {error && <div className="sketch-notification">{error}</div>}
          {notification && <div className="sketch-notification sketch-success">{notification}</div>}

          <div className="sketch-actions">
            <button
              className="sketch-button"
              onClick={handleGenerateCode}
              disabled={isLoading || isRefining || !prompt.trim()}
            >
              {isLoading ? 'Generating...' : 'Generate UI'}
            </button>

            {displayedCode && (
              <>
                <button
                  className="sketch-button sketch-secondary-button"
                  onClick={handleCopyCode}
                  disabled={isLoading || isRefining}
                >
                  Copy Code
                </button>

                <button
                  className="sketch-button sketch-secondary-button"
                  onClick={handleExportCode}
                  disabled={isLoading || isRefining}
                >
                  Export HTML
                </button>
              </>
            )}
          </div>

          {/* Echo Review Panel */}
          {echoReview && <EchoReviewPanel review={echoReview} />}

          {/* Refinement Input */}
          {displayedCode && (
            <RefinePromptInput
              onSubmit={handleRefinement}
              isLoading={isRefining || isLoading}
            />
          )}

          {/* Push to Pulser */}
          {displayedCode && (
            <PulserIntegration
              generatedHTML={displayedCode}
              componentName={selectedComponent?.name}
              isLoading={isLoading || isRefining}
              onPushToPulser={handlePushToPulser}
            />
          )}
        </div>

        {/* Right Area - Preview and Code */}
        <div className="sketch-preview-container">
          {/* Component Splitter */}
          {generatedCode && (
            <ComponentSplitter
              html={generatedCode}
              onSelectComponent={handleComponentSelect}
            />
          )}

          <div className="sketch-preview-toolbar">
            <div
              className={`sketch-preview-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </div>
            <div
              className={`sketch-preview-tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </div>
          </div>

          <div className="sketch-preview-area">
            {isLoading || isRefining ? (
              <div className="sketch-loader">
                <div className="sketch-spinner"></div>
                <p>{isLoading ? 'Generating UI...' : 'Refining UI...'}</p>
              </div>
            ) : (
              activeTab === 'preview' ? (
                <iframe
                  ref={iframeRef}
                  className="sketch-iframe"
                  title="Pulser Sketch Preview"
                  sandbox="allow-scripts"
                />
              ) : (
                <pre className="sketch-code-editor">
                  {displayedCode || 'Generate code to see it here'}
                </pre>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}