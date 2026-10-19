# Smart Job Portal with Personalized Job Recommendation System

A modern, responsive, and accessible React frontend application built for the **Smart Job Portal with Personalized Job Recommendation System**. Designed according to strict professional design tokens (WCAG AA compliance, custom Vanilla CSS design tokens, Inter font, mobile slide-in drawer, and desktop split layouts).

---

## 🚀 Technology Stack
- **Framework & Tooling:** React 19, Vite, JavaScript (ES modules)
- **Routing:** React Router DOM (v6/v7 compatible architecture with guards)
- **Networking:** Axios client with JWT request interceptor and centralized error mapper
- **Form Management & Validation:** React Hook Form + Zod schema validation
- **Design System:** Vanilla CSS custom design tokens (`src/styles/design-tokens.css`, `src/styles/global.css`)
- **Icons:** Lucide React (`lucide-react`)
- **Dev Server:** `http://localhost:5173`
- **Backend API Base:** `http://localhost:5000/api/v1` (Express + MongoDB)

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)

### 2. Installation
```bash
# Clone the repository and install dependencies
cd c:/projects/wadpro
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (a `.env.example` is provided):
```bash
cp .env.example .env
```

**Environment Variables:**
```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Maximum file size allowed for resume parsing (in MB)
VITE_MAX_UPLOAD_SIZE_MB=5

# Feature Flags for Endpoints Not Yet Available in Backend
VITE_USE_MOCKS_PROFILE=true
VITE_USE_MOCKS_APPLICATIONS=true
VITE_USE_MOCKS_RECOMMENDATIONS=true
VITE_USE_MOCKS_RESUME=true

# Demo fallback mode if backend server is not running
VITE_ENABLE_DEMO_FALLBACK=true
```

> **IMPORTANT CORS REQUIREMENT FOR BACKEND:**
> The Node.js / Express backend must configure CORS to allow requests from the frontend dev server. The backend's `CLIENT_URL` environment variable must be set to `http://localhost:5173`.
> ```javascript
> // Backend CORS configuration example
> app.use(cors({
>   origin: process.env.CLIENT_URL || 'http://localhost:5173',
>   credentials: true
> }));
> ```

### 4. Running Locally
```bash
# Start Vite development server on http://localhost:5173
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🏛️ Architecture Highlights

### 1. Single Source of Truth for Field Mappings (`src/api/fieldMap.js`)
If backend database models or field naming conventions change (e.g. `experience` vs `experienceYears`, or nested vs flat salary objects), **only `src/api/fieldMap.js` needs to be updated**. All frontend components consume normalized models.

### 2. Centralized Error-to-Message Mapper (`src/utils/errorMapper.js`)
Handles:
- `HTTP 400`: Field-level validation messages from the response where available
- `HTTP 401`: Session expired, automatically clears token and redirects to `/login`
- `HTTP 403`: Access restricted (friendly 403 Forbidden page with role switchers)
- `HTTP 404`: Friendly 404 Not Found page
- `HTTP 413` & `415`: File too large or unsupported file type
- `HTTP 500`: Generic server error
- `Network Errors`: Backend unreachable notification explaining that `localhost` does not work across different machines

### 3. Authentication & Route Guards
- `AuthProvider` (`src/auth/AuthContext.jsx`): Manages token, user state, and role.
- `ProtectedRoute`: Requires active session.
- `RoleRoute`: UX role guard enforcing Employee vs. Employer access. If an employee tries to access `/employer/*`, a friendly 403 page is displayed.
- Clear state on logout and on any `401 Unauthorized` response.

### 4. Resume Upload & Profile Auto-Fill (`src/pages/employee/EmployeeProfilePage.jsx`)
- Supports `.pdf` and `.docx` with size limit checking (default 5 MB).
- Sends `multipart/form-data` with progress tracking (`onUploadProgress`) and `AbortController` cancellation.
- Auto-populates the **existing** profile form directly (no duplicate forms).
- Marks low-confidence/missing items with an amber **"Please review"** badge (icon + text) and hint.
- Shows banner: *"Review extracted information. Nothing has been saved yet."*
- Primary button: **Approve and Save Profile** (disabled on validation errors).
- Offers **Discard extracted data** to restore previous values.

### 5. Personalized Job Recommendations (`src/pages/employee/RecommendationsPage.jsx`)
- Cards show: Title, company, location, work mode, employment type, salary breakdown with currency and period.
- Overall match score (teal) labelled **"Job relevance estimate"**.
- Pinned mandatory note: *"This score estimates how well a job matches your profile. It does not predict your chances of being hired."*
- Breakdown: Skill coverage bar, Location compatibility, Experience compatibility, Salary compatibility, matched skills (green), missing skills (amber), and plain-language explanation.
- Labeled with a visible **Demo data** badge until backend recommendation API is deployed.

---

## 📋 Deviations from Spec
**None.** The implementation strictly complies with all specifications:
- React (Vite, JavaScript), React Router, Axios, React Hook Form, Zod.
- Port `http://localhost:5173` configured in `vite.config.js`.
- Vanilla CSS custom design system meeting WCAG AA contrast standards.
- Role-guarded routes with friendly 403 and 404 pages.
- Bidirectional field mapper in `src/api/fieldMap.js`.
- Complete verification across desktop and mobile (~375px) viewports with browser subagent recording artifacts.
