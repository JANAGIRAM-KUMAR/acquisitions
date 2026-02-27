# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
A Node.js Express REST API for user acquisition management with authentication. Uses Drizzle ORM with Neon PostgreSQL database.

## Architecture

### Application Structure
- **Entry point**: `src/index.js` loads environment variables and starts `src/server.js`
- **Server**: `src/server.js` listens on PORT (default 3000)
- **Application**: `src/app.js` configures Express middleware (helmet, cors, morgan, cookie-parser) and routes
- **Layered architecture**: Controllers → Services → Models pattern

### Path Aliases
The project uses Node.js subpath imports (defined in package.json):
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

Always use these path aliases when importing from these directories.

### Core Components
- **Database**: Drizzle ORM with Neon serverless PostgreSQL driver (`src/config/database.js`)
- **Logging**: Winston logger configured for file and console output (`src/config/logger.js`)
  - Logs to `logs/error.log` and `logs/combined.log`
  - Console logging enabled in non-production environments
- **Authentication**: JWT-based with httpOnly cookies
  - Token expiration: 1 day
  - Cookie max age: 15 minutes
- **Validation**: Zod schemas in `src/validations/`
- **Password hashing**: bcrypt with salt rounds of 10

### Database Schema (Drizzle ORM)
Models are defined in `src/models/*.js` using Drizzle's pgTable syntax. Current schema:
- **users table**: id (serial), name, email (unique), password, role (default: 'user'), createdAt, updatedAt

## Development Commands

### Running the Application
```bash
npm run dev          # Development mode with --watch flag (auto-restarts on file changes)
npm start            # Production mode
```

### Database Management (Drizzle)
```bash
npm run db:generate  # Generate migration files from schema changes in src/models/*.js
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Drizzle Studio GUI for database inspection
```

### Code Quality
```bash
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run format       # Format all files with Prettier
npm run format:check # Check if files are formatted correctly
```

## Development Guidelines

### Code Style
- **ESLint**: 2-space indentation, single quotes, semicolons required, unix line breaks
- **Prettier**: Configured with single quotes, trailing commas (es5), 80 char line width
- **Modern JavaScript**: Use ES modules, arrow functions, const/let (no var), object shorthand

### Adding New Database Models
1. Create model file in `src/models/` using Drizzle pgTable syntax
2. Export the table schema
3. Run `npm run db:generate` to create migration
4. Review generated SQL in `drizzle/` directory
5. Run `npm run db:migrate` to apply migration

### Adding New Routes
1. Create validation schema in `src/validations/` using Zod
2. Create service functions in `src/services/` for business logic
3. Create controller in `src/controllers/` that:
   - Validates request using Zod's safeParse
   - Calls service functions
   - Logs operations using logger
   - Returns appropriate status codes and JSON responses
4. Create route file in `src/routes/` and import in `src/app.js`

### Error Handling Pattern
Controllers should:
- Use try-catch blocks
- Log errors with `logger.error()`
- Return appropriate HTTP status codes (400 for validation, 409 for conflicts, etc.)
- Pass unhandled errors to next() for Express error handler

### Environment Variables
Required variables in `.env`:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Winston log level (default: info)
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing

### Logging
Use the Winston logger from `#config/logger.js`:
- `logger.info()` for general information
- `logger.error()` for errors (includes stack traces)
- Morgan middleware logs HTTP requests automatically

### Security
- Passwords are hashed with bcrypt before storage
- JWT tokens stored in httpOnly, secure (production), sameSite: Strict cookies
- Helmet middleware enabled for security headers
- CORS enabled for cross-origin requests
