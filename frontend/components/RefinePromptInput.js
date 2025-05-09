/**
 * RefinePromptInput.js
 * 
 * A component for submitting refinement prompts to adjust generated HTML
 * without restarting the entire generation process.
 */

import { useState } from 'react';

const RefinePromptInput = ({ onSubmit, isLoading }) => {
  const [refinementPrompt, setRefinementPrompt] = useState('');
  
  // Common refinement suggestions
  const suggestions = [
    { label: 'Dark Theme', prompt: 'Convert to a dark theme with appropriate contrast' },
    { label: 'Mobile Friendly', prompt: 'Optimize for mobile screens' },
    { label: 'More Colorful', prompt: 'Add more vibrant colors' },
    { label: 'Simplified', prompt: 'Simplify the design, remove clutter' },
    { label: 'Modern Style', prompt: 'Make it look more modern and trendy' },
    { label: 'Corporate', prompt: 'Give it a professional corporate look' },
    { label: 'Add Animation', prompt: 'Add subtle CSS animations' }
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (refinementPrompt.trim() && onSubmit) {
      onSubmit(refinementPrompt);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setRefinementPrompt(suggestion);
    if (onSubmit) {
      onSubmit(suggestion);
    }
  };
  
  return (
    <div className="refine-prompt-container">
      <h3 className="refine-title">Refine the Design</h3>
      <p className="refine-description">
        Describe the changes you'd like to make to the generated design
      </p>
      
      <div className="suggestions">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-chip"
            onClick={() => handleSuggestionClick(suggestion.prompt)}
            disabled={isLoading}
          >
            {suggestion.label}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="refine-form">
        <textarea
          value={refinementPrompt}
          onChange={(e) => setRefinementPrompt(e.target.value)}
          placeholder="e.g., Make the header larger and use blue as the primary color"
          className="refine-textarea"
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          className="refine-button"
          disabled={isLoading || !refinementPrompt.trim()}
        >
          {isLoading ? 'Refining...' : 'Apply Changes'}
        </button>
      </form>
      
      <style jsx>{`
        .refine-prompt-container {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background-color: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .refine-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
        }
        
        .refine-description {
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
          color: #6b7280;
        }
        
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .suggestion-chip {
          padding: 0.4rem 0.8rem;
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 9999px;
          font-size: 0.8rem;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .suggestion-chip:hover {
          background-color: #e5e7eb;
        }
        
        .suggestion-chip:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .refine-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .refine-textarea {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          min-height: 80px;
          font-family: inherit;
          resize: vertical;
        }
        
        .refine-textarea:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
        }
        
        .refine-textarea:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
        
        .refine-button {
          padding: 0.75rem 1rem;
          background-color: #7C3AED;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .refine-button:hover {
          background-color: #6D28D9;
        }
        
        .refine-button:disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default RefinePromptInput;