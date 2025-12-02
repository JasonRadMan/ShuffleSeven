# Shuffle 7 - Daily Mindset Support PWA

## Overview

Shuffle 7 is a Progressive Web Application (PWA) designed as a mindset support tool that provides daily inspirational card draws and monthly lifelines. The application features a visually striking 3D CSS carousel interface where users can draw cards from seven different categories: Wisdom, Health, Challenge, Leadership, Tongue N Cheek, Possibilities, and Knowledge. Built as a full-stack application with React frontend and Express backend, it emphasizes offline functionality and user engagement through carefully managed drawing mechanics.

**Key Features:**
- Daily card draws with 3D flip animation and sound effects
- Share functionality using Web Share API with clipboard fallback
- Image download capability for wallpaper/screensaver use with device-specific instructions
- User authentication with session management
- Comprehensive journal system with database persistence
- Password visibility toggles on all authentication forms
- Journal button in card reveal modal (appears after card flip for authenticated users)
- Push notifications for daily card reminders (PWA must be installed on iOS/iPadOS 16.4+)

**Recent Changes (December 2, 2025):**
- Added sound on/off toggle button with localStorage persistence on home page
- Comprehensive responsive design overhaul for all screen sizes (320px to desktop):
  - Carousel: Responsive heights (280px mobile → 420px desktop), constrained animation overlay
  - CardRevealModal: Responsive card heights, max-height viewport constraint, overflow scrolling
  - Home page buttons: Responsive padding, text sizing, and gap spacing
  - Header navigation: Flex-wrap, smaller mobile padding, responsive text sizes
  - Footer/AdBox: Responsive heights, padding, and mobile-specific ad size labels
  - JournalModal: Responsive heights, margins, and typography for mobile

**Previous Changes (December 2, 2025):**
- Implemented server-side push notification infrastructure using web-push library
- Created daily scheduler that sends card reminders at 8:00 AM
- Added VAPID key management (public key exposed via API, private key secure on server)
- Updated frontend to fetch VAPID public key dynamically from server
- Added test notification endpoint for users to verify push notifications work
- Fixed dialog accessibility warnings by adding screen-reader-only DialogTitle elements
- Cross-platform push support: Android (full), iOS/iPadOS (requires PWA install to home screen, iOS 16.4+)

**Previous Changes (November 24, 2025):**
- Changed draw button text from "TODAY'S CARD DRAWN" to "SEE YOU TOMORROW!" after user draws
- Added Journal button to CardRevealModal alongside Share and Save Image buttons
- Journal button only appears for authenticated users who have drawn cards saved to database
- Updated useShuffleState hook to track currentDrawnCardId from database
- Journal modal opens directly from card reveal for immediate journaling
- Fixed button visibility issues by adjusting z-index and positioning

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses a modern React-based single-page application built with Vite as the build tool. The architecture follows a component-based design pattern with shadcn/ui components for consistent UI elements. The application uses Wouter for lightweight client-side routing and TanStack Query for state management and data fetching. TypeScript provides type safety throughout the frontend codebase.

The visual centerpiece is a 3D CSS carousel implemented with transform animations that displays card backs in a rotating ring formation. Users can pause the rotation by clicking and draw cards through designated buttons with usage restrictions enforced client-side.

### Backend Architecture
The server is built with Express.js and follows a RESTful API pattern, though currently serves primarily as a static file server for the PWA assets. The backend is structured with separate route handling and storage abstraction layers, allowing for future database integration while currently using in-memory storage for user data.

### PWA Implementation
The application implements full PWA functionality with a service worker for offline caching, a web app manifest for installation capabilities, and localStorage for persistent state management. The service worker caches all essential assets including HTML, CSS, JavaScript, card data, and icons to ensure functionality when offline.

### State Management Strategy
Application state is managed through a combination of React hooks, localStorage for persistence, and TanStack Query for server state. The core state includes:
- Daily draw tracking (locked to once per day by date)
- Monthly lifeline usage (maximum 5 per month, resets automatically)
- User settings and preferences
- Current card display state

Card drawing logic enforces business rules client-side, preventing multiple daily draws and limiting lifeline usage through date-based key management in localStorage.

### Component Design System
The UI leverages shadcn/ui components built on Radix UI primitives and styled with Tailwind CSS. The design system uses CSS custom properties for theming with a dark, mystical aesthetic featuring golden accents. Typography combines Inter for body text and Cinzel serif font for headers to create an elegant, spiritual ambiance.

### Data Structure
Card data is stored in a static JSON file containing structured entries with category, image URLs (using Unsplash), descriptive messages, and titles. The flat file approach supports the PWA's offline-first design while allowing for future migration to a database-driven system.

## External Dependencies

### UI Framework Dependencies
- **React 18+**: Core frontend library with modern hooks and concurrent features
- **Vite**: Build tool and development server with hot module replacement
- **shadcn/ui + Radix UI**: Accessible component library built on Radix primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Wouter**: Lightweight client-side routing library

### State Management
- **TanStack Query**: Server state management with caching and synchronization
- **localStorage**: Browser storage for persistent user state and preferences

### Database and ORM
- **Drizzle ORM**: Type-safe SQL ORM with PostgreSQL support
- **PostgreSQL**: Primary database (currently using Neon serverless)
- **Drizzle Kit**: Database migrations and schema management

### Backend Framework
- **Express.js**: Web application framework for Node.js
- **TypeScript**: Type safety across the full stack
- **web-push**: VAPID-based push notifications for PWA

### PWA Technologies
- **Service Worker**: Asset caching and offline functionality
- **Web App Manifest**: Installation and app metadata
- **Unsplash**: External image service for card illustrations

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS + Autoprefixer**: CSS processing and vendor prefixing
- **Replit**: Development environment and deployment platform