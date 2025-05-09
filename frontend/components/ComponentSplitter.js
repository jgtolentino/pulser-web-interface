/**
 * ComponentSplitter.js
 * 
 * Component that handles splitting generated HTML into logical UI components
 * and allowing the user to view/edit them individually.
 */

import { useState, useEffect } from 'react';

const ComponentSplitter = ({ html, onSelectComponent }) => {
  const [components, setComponents] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Extract components from HTML on load or when HTML changes
  useEffect(() => {
    if (!html) {
      setComponents([]);
      return;
    }

    const extractedComponents = splitIntoComponents(html);
    setComponents(extractedComponents);
    
    // Reset selection to first component
    setSelectedIndex(0);
    if (extractedComponents.length > 0 && onSelectComponent) {
      onSelectComponent(extractedComponents[0]);
    }
  }, [html]);

  // Split HTML into logical components based on structure
  const splitIntoComponents = (rawHTML) => {
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, 'text/html');
    
    // Extract body content
    const bodyContent = doc.body;
    
    // Components to extract - major structural elements
    const componentSelectors = [
      // Headers and heroes
      'header', '.header', '#header', '.hero', '#hero', 
      // Main content sections
      'section', '.section', 'article', 'main > div', 
      // Features, pricing, etc.
      '.features', '#features', '.pricing', '#pricing',
      // Testimonials, team, etc.
      '.testimonials', '#testimonials', '.team', '#team',
      // Contact, CTA sections
      '.contact', '#contact', '.cta', '#cta',
      // Footer
      'footer', '.footer', '#footer'
    ];
    
    let componentElements = [];
    
    // Try to extract based on semantic structure
    for (const selector of componentSelectors) {
      const elements = bodyContent.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => {
          // Check if this element is already a child of a previously selected element
          let isChild = false;
          for (const comp of componentElements) {
            if (comp.contains(el)) {
              isChild = true;
              break;
            }
          }
          
          if (!isChild) {
            componentElements.push(el);
          }
        });
      }
    }
    
    // If no components were found with selectors, fall back to direct children of body
    if (componentElements.length === 0) {
      bodyContent.childNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          componentElements.push(node);
        }
      });
    }
    
    // If still no components, handle the body as a single component
    if (componentElements.length === 0) {
      return [{
        name: 'FullPage',
        label: 'Full Page',
        code: rawHTML,
        element: bodyContent
      }];
    }
    
    // Convert elements to component objects with names and code
    return componentElements.map((el, index) => {
      // Try to determine a sensible name based on element
      const tagName = el.tagName.toLowerCase();
      let name, label;
      
      if (tagName === 'header' || el.classList.contains('header') || el.classList.contains('hero')) {
        name = 'Header';
        label = 'Header/Hero Section';
      } else if (tagName === 'footer' || el.classList.contains('footer')) {
        name = 'Footer';
        label = 'Footer Section';
      } else if (el.classList.contains('features') || el.id === 'features') {
        name = 'Features';
        label = 'Features Section';
      } else if (el.classList.contains('pricing') || el.id === 'pricing') {
        name = 'Pricing';
        label = 'Pricing Section';
      } else if (el.classList.contains('testimonials') || el.id === 'testimonials') {
        name = 'Testimonials';
        label = 'Testimonials Section';
      } else if (el.classList.contains('team') || el.id === 'team') {
        name = 'Team';
        label = 'Team Section';
      } else if (el.classList.contains('contact') || el.id === 'contact') {
        name = 'Contact';
        label = 'Contact Section';
      } else if (el.classList.contains('cta') || el.id === 'cta') {
        name = 'CTA';
        label = 'Call to Action';
      } else {
        name = `Component${index + 1}`;
        label = `Component ${index + 1}`;
      }
      
      return {
        name,
        label,
        code: el.outerHTML,
        element: el
      };
    });
  };

  // Handle component selection
  const handleSelectComponent = (index) => {
    setSelectedIndex(index);
    if (onSelectComponent && components[index]) {
      onSelectComponent(components[index]);
    }
  };

  if (components.length === 0) {
    return null;
  }

  return (
    <div className="component-splitter">
      <div className="component-tabs">
        {components.map((component, index) => (
          <div 
            key={index}
            className={`component-tab ${selectedIndex === index ? 'active' : ''}`}
            onClick={() => handleSelectComponent(index)}
          >
            {component.label || component.name}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .component-splitter {
          margin-bottom: 1rem;
        }
        
        .component-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .component-tab {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          background-color: #f3f4f6;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .component-tab:hover {
          background-color: #e5e7eb;
        }
        
        .component-tab.active {
          background-color: #7C3AED;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ComponentSplitter;