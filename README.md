# Trading Framework

A modern, professional web application for tracking and analyzing trading performance. Built with React, TypeScript, and Tailwind CSS.

## Features

- 📊 Modern dashboard with real-time performance metrics
  * Key performance indicators with visual feedback
  * Interactive performance charts
  * Trade distribution analysis
  * Recent trades timeline
- 🎨 Sleek, modern UI with glassmorphism effects
- ✨ Smooth animations and transitions
- 📱 Fully responsive design
- 🔒 Secure authentication with Supabase
- 📝 Trade management and tracking
- 📓 Trading journal with emotional tracking
- 💡 Strategy documentation
- 📈 Discipline tracking system
- 🔄 Trade import functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trading-framework.git
cd trading-framework
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your Supabase credentials and other configuration.

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- React Router v6
- Chart.js
- React Icons
- Framer Motion
- Supabase

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── layouts/        # Layout components
  ├── pages/          # Page components
  ├── hooks/          # Custom React hooks
  ├── utils/          # Utility functions
  ├── types/          # TypeScript type definitions
  ├── assets/         # Static assets
  ├── services/       # API and external services
  ├── context/        # React context providers
  └── styles/         # Global styles and theme
```

## Features in Detail

### Dashboard
- Real-time performance metrics with visual indicators
- Interactive performance charts with multiple view options
- Trade distribution analysis with pie charts
- Recent trades timeline with detailed information
- Modern UI with glassmorphism effects and smooth animations

### Authentication
- Secure authentication using Supabase
- Google sign-in integration
- Protected routes and authenticated API calls
- Persistent session management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Changelog

### [Latest]
- Enhanced UI with modern design and better UX
- Added gradient backgrounds and glassmorphism effects
- Redesigned dashboard with focused key metrics
- Implemented smooth animations and transitions
- Improved chart visualizations
- Enhanced recent trades display
- Better visual hierarchy and spacing

### [Previous]
- Implemented Google authentication with Supabase
- Added protected routes and authentication context
- Set up proper routing with React Router
- Configured Supabase integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
