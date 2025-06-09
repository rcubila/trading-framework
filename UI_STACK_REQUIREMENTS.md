# UI Stack Requirements

This document outlines the required stack for any UI implementation in this project.

## Core Framework
- Next.js 15.2.4
- React 19
- TypeScript 5

## UI Component Libraries
- Radix UI components
- Tailwind CSS 3.4.17
- Tailwind plugins:
  - tailwind-merge
  - tailwindcss-animate
  - class-variance-authority

## Form Handling
- react-hook-form
- @hookform/resolvers
- zod for validation

## Date and Time
- date-fns 4.1.0
- react-day-picker 8.10.1

## Charts and Data Visualization
- recharts

## UI Enhancements
- lucide-react for icons
- embla-carousel-react
- react-resizable-panels
- sonner for toasts
- vaul for drawer component

## Theme Support
- next-themes for dark/light mode

## Development Tools
- postcss 8.5
- autoprefixer 10.4.20

## Type Definitions
- @types/react 19
- @types/react-dom 19
- @types/node 22

## Project Structure
- Next.js routing system
- Next.js specific features
- Next.js build and development scripts

## CSS Architecture
- Tailwind CSS with plugins
- CSS variables for theming
- PostCSS configuration

## Component Architecture
- Radix UI components
- Component composition patterns
- Theme provider configuration

## Usage
When requesting UI implementations from v0, ensure the project follows this stack exactly. This ensures compatibility with the main project and maintains consistency across all UI components.

## Notes
- All versions specified are required for compatibility
- Do not mix different versions of the same library
- Ensure all dependencies are properly configured
- Follow the project's established patterns and conventions 