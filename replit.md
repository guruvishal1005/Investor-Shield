# Investor Shield App

## Overview

Investor Shield App is a full-stack web application designed to protect retail investors from fraud by providing three core features: advisor verification, fake app detection, and community reviews. The application allows users to verify financial advisors against SEBI registration data, check the legitimacy of trading apps, and share experiences through a community review system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives for accessible, modern interfaces
- **Styling**: TailwindCSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: JWT-based authentication with local storage persistence

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with JSON responses
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development**: Hot module replacement via Vite integration for full-stack development

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database
- **ORM**: Drizzle with schema-first approach for type safety
- **Migration System**: Drizzle Kit for database schema migrations
- **Data Models**: Users, Advisors, Apps, and Reviews with relational structure

### Authentication and Authorization
- **Authentication Strategy**: JWT-based stateless authentication
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: Client-side token storage with automatic header injection
- **Protected Routes**: Middleware-based route protection on both client and server

### Component Architecture
- **Design System**: Consistent component library with variants and proper TypeScript typing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Toast Notifications**: Radix UI toast system for user feedback
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### API Structure
- **Endpoints**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User authentication
  - `POST /api/verify-advisor` - Advisor verification with SEBI data
  - `POST /api/check-app` - App legitimacy verification
  - `POST /api/add-review` - Community review submission
  - `GET /api/recent-*` - Various data retrieval endpoints

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Neon Database
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **bcryptjs**: Password hashing and security
- **jsonwebtoken**: JWT token generation and verification

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library for consistent iconography

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

### Database and Validation
- **zod**: Runtime type validation and schema definition
- **drizzle-zod**: Integration between Drizzle and Zod for form validation
- **connect-pg-simple**: PostgreSQL session store (configured but not actively used due to JWT approach)