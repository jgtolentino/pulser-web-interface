/**
 * API mock endpoint for /api/sketch_generate
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, options = {}, refinement = null } = req.body;

  if (!prompt && !refinement) {
    return res.status(400).json({ error: 'Prompt or refinement is required' });
  }

  // Create a realistic-looking HTML response
  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Component</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .hero {
      background-color: #121212;
      color: #ffffff;
      border-radius: 12px;
      padding: 4rem 2rem;
      text-align: center;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    
    .hero p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      color: #e0e0e0;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #7C3AED;
      color: white;
      padding: 0.8rem 2rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .cta-button:hover {
      background-color: #6D28D9;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    @media (max-width: 768px) {
      .hero {
        padding: 3rem 1.5rem;
      }
      
      .hero h1 {
        font-size: 2rem;
      }
      
      .hero p {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <section class="hero">
      <h1>${prompt.includes('hero') ? 'Welcome to Pulser' : 'Generated Component'}</h1>
      <p>This is a mock component generated based on your prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"</p>
      <button class="cta-button">Get Started</button>
    </section>
  </div>
</body>
</html>`;

  // Create a mock Echo review
  const echoReview = {
    layout: {
      score: 8,
      feedback: "Clean layout with good use of spacing and hierarchy."
    },
    accessibility: {
      score: 7,
      feedback: "Good contrast and readability, but could improve keyboard focus states."
    },
    designConsistency: {
      score: 9,
      feedback: "Consistent design language with Pulser's design system."
    },
    overallScore: 8,
    qualityTags: ["responsive", "clean", "modern", "accessible"],
    detailedFeedback: "This component features a clean, modern design with good responsive behavior. The dark background with light text provides strong contrast for readability. The purple CTA button matches Pulser's brand colors and stands out well. The layout is well-structured with appropriate spacing. For future iterations, consider improving keyboard focus states and adding more interactive elements."
  };

  // Return a successful response
  res.status(200).json({
    success: true,
    code: 0,
    output: htmlTemplate,
    echoReview,
    error: "",
    meta: {
      isMockResponse: true,
      prompt
    }
  });
}