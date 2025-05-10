# Contributing to Pulser Web Interface

Thank you for your interest in contributing to the Pulser Web Interface! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Create a branch for your work

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/pulser-web-interface.git
cd pulser-web-interface

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Install dependencies
npm install

# Create a branch for your work
git checkout -b feature/your-feature-name
```

## Development Workflow

1. Make your changes
2. Write tests for your changes
3. Ensure code follows project standards
4. Commit your changes
5. Push to your fork
6. Submit a pull request

## Pull Request Process

1. Update the README.md or documentation with details of changes if needed
2. Update the version number in relevant files following semantic versioning
3. Ensure all tests pass and linting is clean
4. Submit your pull request with a clear description of the changes

## Coding Standards

- Follow the existing code style
- Write meaningful commit messages
- Add appropriate comments and documentation
- Write unit tests for new functionality

## Component Development

When creating new UI components:

1. Follow the component structure defined in UI.md
2. Ensure responsive design works on all target breakpoints
3. Include appropriate theming support
4. Implement accessibility features

## Documentation

- Update documentation for any changed features
- Add JSDoc comments to exported functions and components
- Keep UI.md and UI_VISUALIZATION.md in sync with your UI changes

## Testing

- Write unit tests for utility functions
- Add component tests for UI components
- Test across multiple browsers and devices when changing UI

## Need Help?

If you have questions or need help with the contribution process, please reach out to the maintainers.

Thank you for contributing to the Pulser Web Interface!