# Pulser Web Interface UI Specification

This document provides a comprehensive specification of the Pulser Web Interface UI architecture for Maya and onboarding purposes.

## 🧩 Component Structure

```
Pulser Web UI
├── Sidebar
│   ├── Task Sessions
│   ├── Agent Filters
│   └── Tag Navigator
├── TerminalPanel
│   └── Slash Command Input
├── OutputDisplay
│   ├── Markdown Renderer
│   ├── YAML/JSON Viewer
│   ├── Table + Chart Display (Sunnies)
│   └── Expandable Output Blocks
├── UploadPane
│   └── Drag/Drop + Echo Annotation
├── StatusBar
│   ├── Claudia Sync Log
│   ├── QA Ping (Caca)
│   ├── Deployment Info
│   └── Version Tag
└── PulseUPModule
    ├── Semantic Chunk Viewer
    ├── Tag Explorer
    └── Similarity Matcher (DeepSeekr1)
```

## 🎨 Design System

The Pulser Web Interface follows a consistent design system with these key characteristics:

- **Theme**: Dark-tech with cool ambient lighting
- **Style**: Minimalist UI with focused content areas
- **Agent Representation**: Avatar-based agent markers
- **Responsiveness**: Full responsive design for desktop and mobile
- **Color Palette**: Cool blues and purples with high contrast accents

## 📐 Component Details

### Sidebar

A collapsible navigation panel that provides access to different sessions, agents, and navigation options.

- **Task Sessions**: Shows current and historical task sessions
- **Agent Filters**: Allows filtering by specific agents (Claudia, Echo, etc.)
- **Tag Navigator**: Hierarchical navigation through content tags

### TerminalPanel

The primary input interface for interacting with the Pulser system.

- **Slash Command Input**: Supports `/command` style inputs for quick actions
- **Command History**: Maintains and allows recall of previous commands
- **Task Context Display**: Shows the current task context and relevant metadata

### OutputDisplay

The main content area for displaying responses and results from the system.

- **Render Modes**:
  - Markdown: Rich text formatting with code highlighting
  - YAML/JSON: Structured data display with collapsible nodes
  - Table: Tabular data visualization
  - Chart: Data visualization for metrics and analysis
- **Toggles**:
  - Raw View: Shows the unprocessed output
  - Cleaned View: Shows a formatted and enhanced view
  - Expandable Blocks: Sections can be expanded/collapsed for better focus

### UploadPane

Provides file upload and processing capabilities.

- **Supported File Types**: .pdf, .mp3, .json, .yaml
- **Tag Agents**: Automatically routes uploads to appropriate agents
  - Kalaw: Document processing and knowledge extraction
  - Echo: Audio transcription and analysis
  - Claudia: General orchestration of multi-file inputs

### PulseUPModule

Advanced semantic processing and exploration tools.

- **Tools**:
  - Semantic Chunk Viewer: Visualize semantic structure of content
  - Tag Explorer: Explore and navigate content by semantic tags
  - Similarity Matcher: Find similar content across the knowledge base
- **Integrations**:
  - Kalaw: Knowledge agent integration
  - Maya: Workflow agent integration

### StatusBar

Provides system status and contextual information.

- **Indicators**:
  - ClaudiaSync: Status of Claudia orchestration agent
  - CacaQA: Quality assessment status
  - Version Status: Current version and update information
  - Resource Load: System resource utilization

## 🎯 Interaction Patterns

### Command Flow

1. User enters a command in the TerminalPanel
2. Claudia orchestrates routing to appropriate agent
3. Results appear in the OutputDisplay
4. Status updates shown in StatusBar

### Upload Flow

1. User drags file to UploadPane
2. Upload is processed by the appropriate agent (Kalaw for documents, Echo for audio)
3. Results appear in the OutputDisplay
4. Tags and semantic chunks are made available in the PulseUPModule

### Exploration Flow

1. User selects content in the OutputDisplay
2. Related semantic chunks appear in the PulseUPModule
3. User can navigate through semantic connections via Tag Explorer
4. Similarity Matcher suggests related content

## 🔄 State Management

The Pulser Web Interface uses a hierarchical state management approach:

- **Global State**: Session context, active agents, system status
- **Component State**: Individual component view states and preferences
- **Persistence**: User preferences and history stored in local storage
- **Sync**: Critical state synced with backend via Claudia

## 🚀 Performance Considerations

- **Lazy Loading**: Components load only when needed
- **Virtualized Lists**: For handling large datasets in Task Sessions and Tag Navigator
- **Optimistic Updates**: UI updates immediately while waiting for backend confirmation
- **Progress Indicators**: Clear loading states for all asynchronous operations

## 🔒 Security Model

- **Agent Permissions**: Different agents have different access levels to UI functionality
- **Content Isolation**: Uploaded content is isolated to the current session
- **Authentication**: Integrated with the main Pulser authentication system
- **Data Protection**: Sensitive data is not persisted in browser storage

## 🌐 Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliance for all text elements

## 📱 Responsive Behavior

The interface adapts to different screen sizes with these approaches:

- **Mobile**: Sidebar collapses, components stack vertically
- **Tablet**: Limited sidebar, simplified multi-column layout
- **Desktop**: Full layout with optimal component sizing
- **Large Display**: Enhanced multi-panel view for power users

## 🔧 Configuration

The UI configuration is defined in `frontend/config/ui_config.yaml` and can be modified to enable/disable features or change appearance settings. See the [UI Configuration Reference](#ui-configuration-reference) for details.

## UI Configuration Reference

```yaml
# Pulser Web Interface Configuration
version: 2.0.1
ui_mode: hybrid        # Options: terminal, hybrid, graphical
theme: dark-tech       # Options: dark-tech, light-modern, system
branding:
  style: minimalist    # Options: minimalist, detailed, branded
  agent_markers: avatar # Options: avatar, icon, text
  responsive: true      
  lighting: cool-ambient # Options: cool-ambient, warm, neutral

# Component layout structure
layout:
  root:
    - Sidebar
    - TerminalPanel
    - OutputDisplay
    - UploadPane
    - StatusBar
    - PulseUPModule

# Component-specific configurations
components:
  # Configuration for each component...
```

## 🛠️ Development Guidelines

When extending the Pulser Web Interface, follow these guidelines:

1. **Component Isolation**: Keep components focused and independent
2. **Agent Integration**: Allow different agents to interact with UI components
3. **Responsive First**: Design for mobile first, then enhance for larger screens
4. **Accessibility**: Follow WCAG guidelines for all new features
5. **Theme Consistency**: Maintain the dark-tech visual language

## 📦 Delivery Requirements

New UI components should be delivered with:

1. Component implementation
2. Configuration extension in ui_config.yaml
3. Documentation update in this spec
4. Accessibility verification
5. Integration tests with agent system

## 🧪 Testing Protocol

Each component should include:

1. Unit tests for component logic
2. Integration tests with the agent system
3. Visual regression tests
4. Accessibility tests
5. Performance benchmarks