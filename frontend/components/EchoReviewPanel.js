/**
 * EchoReviewPanel.js
 * 
 * A component to display visual feedback from the Echo agent about 
 * generated UI components.
 */

import { useState } from 'react';

const EchoReviewPanel = ({ review }) => {
  const [expanded, setExpanded] = useState(false);

  if (!review) return null;

  // Extract various feedback categories
  const {
    layout = {},
    accessibility = {},
    designConsistency = {},
    overallScore = 0,
    qualityTags = [],
    detailedFeedback = ''
  } = review;

  // Color coding based on score
  const getScoreColor = (score) => {
    if (score >= 8) return '#10B981'; // green
    if (score >= 6) return '#FBBF24'; // yellow
    return '#EF4444'; // red
  };

  // Tag emoji mapping
  const tagEmojis = {
    'clear': '💡',
    'cramped': '🟨',
    'modern': '🔥',
    'accessible': '♿',
    'responsive': '📱',
    'good-contrast': '👁️',
    'poor-contrast': '👓',
    'over-complicated': '🔄',
    'minimalist': '⚪',
    'colorful': '🌈',
    'text-heavy': '📚',
    'image-heavy': '🖼️',
    'dark-mode-ready': '🌙',
    'light-mode-ready': '☀️'
  };

  return (
    <div className="echo-review-panel">
      <div 
        className="echo-review-summary"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="score-indicator" style={{ backgroundColor: getScoreColor(overallScore) }}>
          {overallScore.toFixed(1)}
        </div>
        <div className="quality-tags">
          {qualityTags.map((tag, index) => (
            <span key={index} className="quality-tag">
              {tagEmojis[tag.toLowerCase()] || '🏷️'} {tag}
            </span>
          ))}
        </div>
        <div className="expand-toggle">
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>

      {expanded && (
        <div className="echo-review-details">
          <div className="review-category">
            <h4>Layout</h4>
            <div className="category-score" style={{ backgroundColor: getScoreColor(layout.score || 0) }}>
              {layout.score?.toFixed(1) || 'N/A'}
            </div>
            <p>{layout.feedback || 'No layout feedback available'}</p>
          </div>

          <div className="review-category">
            <h4>Accessibility</h4>
            <div className="category-score" style={{ backgroundColor: getScoreColor(accessibility.score || 0) }}>
              {accessibility.score?.toFixed(1) || 'N/A'}
            </div>
            <p>{accessibility.feedback || 'No accessibility feedback available'}</p>
          </div>

          <div className="review-category">
            <h4>Design Consistency</h4>
            <div className="category-score" style={{ backgroundColor: getScoreColor(designConsistency.score || 0) }}>
              {designConsistency.score?.toFixed(1) || 'N/A'}
            </div>
            <p>{designConsistency.feedback || 'No design consistency feedback available'}</p>
          </div>

          {detailedFeedback && (
            <div className="detailed-feedback">
              <h4>Detailed Feedback</h4>
              <p>{detailedFeedback}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .echo-review-panel {
          margin: 1rem 0;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          background-color: white;
          overflow: hidden;
        }
        
        .echo-review-summary {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          background-color: #fafafa;
          transition: background-color 0.2s;
        }
        
        .echo-review-summary:hover {
          background-color: #f0f0f0;
        }
        
        .score-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .quality-tags {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .quality-tag {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background-color: #f3f4f6;
          font-size: 0.85rem;
        }
        
        .expand-toggle {
          font-size: 0.85rem;
          color: #6b7280;
          display: flex;
          align-items: center;
        }
        
        .echo-review-details {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-top: 1px solid #e0e0e0;
        }
        
        .review-category {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .review-category h4 {
          margin: 0;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .category-score {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.85rem;
          margin-left: 0.5rem;
        }
        
        .review-category p {
          margin: 0;
          color: #4b5563;
          font-size: 0.9rem;
        }
        
        .detailed-feedback {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e0e0e0;
        }
        
        .detailed-feedback h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }
        
        .detailed-feedback p {
          margin: 0;
          color: #4b5563;
          font-size: 0.9rem;
          white-space: pre-line;
        }
      `}</style>
    </div>
  );
};

export default EchoReviewPanel;