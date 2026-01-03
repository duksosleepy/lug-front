# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LUG-Front is a Next.js 16 frontend application for managing warranty registrations and internal tools for LUG.vn. The app includes warranty form submission, Excel file processing for accounting and distribution data, and Sapo integration synchronization.

## Development Commands

### Development Server
```bash
npm run dev
```
Runs the Next.js development server with HTTPS enabled (`--experimental-https`). Accessible at https://localhost:3000.

### Production Build
```bash
npm run build
npm start
```
- `npm run build`: Creates production build
- `npm start`: Runs production server using custom `server.js` (HTTP server on port 3000)

### Linting
```bash
npm run lint
```

## Architecture

### Authentication System

The app uses a custom passphrase-based authentication system:
- **AuthContext** (`app/lib/AuthContext.tsx`): Provides authentication state via React Context
- Cookie-based session management with `js-cookie`
- Account lockout after 5 failed attempts (15-minute lockout duration)
- Passphrase hashed using SHA-512 (see `app/lib/crypto.ts`)
- Middleware (`middleware.ts`) protects routes except `/login`, `/warranty`, and `/warranty/success`

**Important**: Authentication state is synchronized between React state and cookies to prevent hydration mismatches.

### Backend Integration

The app proxies API calls to a Python backend (FastAPI) running on `http://localhost:8000`:

**Next.js rewrites** (in `next.config.ts`):
- `/api/warranty` → `http://localhost:8000/warranty`
- `/process/online` → `http://localhost:8000/process/online`
- `/process/offline` → `http://localhost:8000/process/offline`
- `/process-dual-files` → `http://localhost:8000/process/mapping`
- `/sapo/sync` → `http://localhost:8000/sapo/sync`
- `/process/accounting` → `http://localhost:8000/accounting`

**Environment variables**:
- `BACKEND_URL`: Backend base URL (defaults to `http://localhost:8000`)
- `NODE_ENV`: Set to `production` for production builds

### Phone Number Validation

Phone validation logic in `app/lib/phoneValidation.ts` **MUST exactly match** the backend Python implementation (`phone_utils.py`):
- Uses regex: `/^(84|0[3|5|7|8|9])([0-9]{8})\b/`
- Supports Vietnamese phone formats (10-digit with leading 0, 9-digit without, or 84 international prefix)
- Special test numbers: `["09999999999", "090000000", "0912345678"]`
- Functions: `isValidPhoneVN()`, `formatPhoneNumberVN()`, `getPhoneErrorMessage()`

**When modifying**: Any changes to phone validation must be coordinated with backend changes to maintain exact parity.

### Application Routes

**Public routes** (no authentication required):
- `/login` - Login page with passphrase authentication
- `/warranty` - Public warranty registration form
- `/warranty/success` - Warranty submission success page

**Protected routes** (require authentication):
- `/` - Home page (redirects from root)
- `/accounting` - Upload and process accounting Excel files
- `/dis-upload` - Upload and process distribution Excel files
- `/sapo-sync` - Trigger Sapo data synchronization

### Component Structure

**UI Components** (`app/components/ui/`):
- Built with Radix UI primitives (`@radix-ui/react-*`)
- Styled with Tailwind CSS using `class-variance-authority` for variants
- Components: Button, Card, Toast, Toaster
- Custom hook: `use-toast.ts` for toast notifications

**Feature Components** (`app/components/`):
- `WarrantyForm.tsx` - Main warranty registration form with image carousel for platform-specific instructions
- `ExcelProcessor.tsx` - Generic Excel file upload and processing component
- `DisProcessor.tsx` - Distribution data Excel processor
- `AccountingProcessor.tsx` - Accounting Excel file processor
- `AppWrapper.tsx` - Wraps app with toast provider
- `AuthHeader.tsx` - Header with logout functionality

### State Management

- Authentication: React Context (`AuthContext`)
- Form state: Local `useState` hooks
- Toast notifications: Custom hook (`use-toast.ts`)
- No global state management library (Redux, Zustand, etc.)

## Key Dependencies

- **Next.js 16**: App Router with React Server Components
- **React 19**: Latest React with concurrent features
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS 4**: Utility-first styling
- **Framer Motion**: Animation library
- **react-google-recaptcha**: ReCAPTCHA v2 integration for form submissions
- **google-libphonenumber**: Phone number validation (supplementary to custom validation)
- **date-fns**: Date formatting and manipulation
- **crypto-js**: Client-side passphrase hashing

## Styling Conventions

- Tailwind CSS with custom design tokens defined in `globals.css` using CSS variables (HSL format)
- Color system uses `hsl(var(--primary))` pattern for theming
- Component variants use `class-variance-authority` for type-safe variants
- CSS modules are NOT used; all styling is via Tailwind utility classes

## File Organization

```
app/
├── components/         # React components
│   ├── ui/            # Reusable UI primitives
│   └── *.tsx          # Feature-specific components
├── lib/               # Utilities and context
│   ├── AuthContext.tsx
│   ├── crypto.ts
│   ├── phoneValidation.ts
│   ├── utils.ts
│   └── hooks/         # Custom React hooks
├── utils/             # Test utilities
├── api/               # API routes (Next.js Route Handlers)
│   └── warranty/route.ts
├── [route]/           # Page routes (Next.js App Router)
│   └── page.tsx
├── layout.tsx         # Root layout with AuthProvider
└── globals.css        # Global styles and design tokens
```
### Next.js Excellence

Deliver exceptional Next.js applications.

Excellence checklist:
- Performance optimized
- SEO excellent
- Tests comprehensive
- Security implemented
- Errors handled
- Monitoring active
- Documentation complete
- Deployment smooth

Delivery notification:
"Next.js application completed. Built 24 routes with 18 API endpoints achieving 98 Lighthouse score. Implemented full App Router architecture with server components and edge runtime. Deploy time optimized to 45s."

Performance excellence:
- TTFB < 200ms
- FCP < 1s
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms
- Bundle size minimal
- Images optimized
- Fonts optimized

## Import Paths

Uses TypeScript path alias `@/*` configured in `tsconfig.json`:
```typescript
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/app/lib/AuthContext";
```

## Production Server

Custom Node.js HTTP server (`server.js`) is used for production:
- Plain HTTP (not HTTPS) on port 3000
- Development uses `next dev --experimental-https` for local HTTPS

## Important Notes

1. **Phone Validation Parity**: Frontend phone validation MUST match backend exactly. Both use the same regex pattern and normalization logic.

2. **Authentication Flow**:
   - Middleware checks `isAuthenticated` cookie on every request
   - AuthContext syncs cookie state with React state to prevent hydration issues
   - Lock-out state persists via cookies across page refreshes

3. **Backend Dependency**: This frontend requires a running Python backend (FastAPI) on `http://localhost:8000`. API routes in Next.js are minimal proxies.

4. **Form Submissions**: All warranty submissions include ReCAPTCHA validation. The form uses platform-specific image carousels (Shopee/TikTok) to guide users.

5. **TypeScript**: Strict mode enabled. Target ES2017 for compatibility.

6. **HTTPS in Development**: The dev server uses `--experimental-https` flag. Browsers may show certificate warnings for localhost.
