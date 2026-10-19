# API Status & Field Contract

This document tracks the integration status between the React frontend and the Node.js/Express/MongoDB backend (`/api/v1`).

---

## 1. Endpoint Status Table

| Feature | Method | Endpoint | Status | Backend Field Names (Expected / Assumed) | Notes |
|---|---|---|---|---|---|
| **Register** | `POST` | `/auth/register` | **Ready** | `fullName` (or `name`), `email`, `password`, `role` (`'employee'` \| `'employer'`) | Returns `{ message, user }` or `{ token, user }`. Frontend strips `confirmPassword`. |
| **Login** | `POST` | `/auth/login` | **Ready** | `email`, `password` | Returns `{ token, user: { _id, name, email, role } }`. |
| **Own Profile** | `GET` | `/users/me` | **Ready** | Headers: `Authorization: Bearer <token>` | Returns logged-in user object `{ _id, name, email, role }`. |
| **Employer Dashboard Test** | `GET` | `/employers/dashboard` | **Ready** | Headers: `Authorization: Bearer <token>` | Returns summary counts: active jobs, closed jobs, total applicants, recent jobs. |
| **Create Job** | `POST` | `/jobs` | **Ready** | `title`, `company`, `description`, `skills` (array of strings), `location`, `workMode` (`On-site` \| `Hybrid` \| `Remote`), `employmentType` (`Full-time` \| `Part-time` \| `Contract` \| `Internship`), `experience` (number), `salary` (`{ min, max, period, currency, type }`) | Handled via `fieldMap.js`. |
| **Browse / Search Jobs** | `GET` | `/jobs` | **Ready** | Query params: `search`, `location`, `workMode`, `employmentType`, `page`, `limit` | Returns `{ jobs: [...], total, page, totalPages }`. Client-side fallback applied for unsupported filters. |
| **Update Job** | `PATCH` | `/jobs/:id` | **Implemented; Needs Testing** | Job fields as above, `status` (`'Open'` \| `'Closed'`) | Needs live backend verification. |
| **Delete Job** | `DELETE` | `/jobs/:id` | **Implemented; Needs Testing** | Route param: `id` | Needs live backend verification. Requires confirmation dialog. |
| **Employee Profile** | `GET`/`PUT` | `/profile/me` | **Not Available Yet** | Mocked (`VITE_USE_MOCKS_PROFILE=true`) | Full candidate profile including skills, experience, education, preferences. |
| **Applications (Employee)** | `GET`/`POST`| `/applications` | **Not Available Yet** | Mocked (`VITE_USE_MOCKS_APPLICATIONS=true`) | Candidate application tracking with status badges. |
| **Applicants (Employer)** | `GET`/`PATCH`| `/employers/jobs/:id/applicants` | **Not Available Yet** | Mocked (`VITE_USE_MOCKS_APPLICATIONS=true`) | Applicant pipeline per job posting. |
| **Recommendations** | `GET` | `/recommendations/jobs` | **Not Available Yet** | Mocked (`VITE_USE_MOCKS_RECOMMENDATIONS=true`) | Job relevance estimate with transparent compatibility breakdown. |
| **Resume Parsing** | `POST` | `/resumes/parse` | **Unconfirmed** | Mocked (`VITE_USE_MOCKS_RESUME=true`) | `multipart/form-data` with `file`. Extracts fields for profile auto-fill. |

---

## 2. Assumptions & Single Source of Truth (`src/api/fieldMap.js`)

Because the backend repository is hosted separately, the following standard Mongoose/Express conventions are assumed and centralized in `src/api/fieldMap.js`:

1. **User Identity & Roles**:
   - Backend user object uses `_id` or `id`.
   - Role names are lowercase `'employee'` and `'employer'`.
2. **Job Schema**:
   - Backend expects `skills` as an array of strings (e.g., `["React", "TypeScript", "Node.js"]`).
   - Salary can be flattened or nested (`salaryMin`, `salaryMax`, `salaryPeriod`, `salaryCurrency`, `salaryType` vs `salary: { min, max, period, currency, type }`). `fieldMap.js` provides bidirectional transformation so any backend schema change only touches that single file.
3. **Pagination Response**:
   - Handled gracefully for `{ data: [...], total, page }`, `{ jobs: [...], count }`, or direct array responses.

---

## 3. Questions for Backend Developer

1. **Resume Parsing Endpoint**:
   - What is the exact route path for resume parsing? (e.g. `/resumes/parse`, `/resumes/upload`, or `/users/resume`)?
   - What is the multipart field key? (default assumed: `file` or `resume`)?
   - Does the response include confidence scores or missing field arrays?
2. **Employee Profile Endpoint**:
   - What route will be assigned to employee profile? Will it be `/users/profile` or `/employees/profile`?
   - Does it support photo upload or URL reference?
3. **Job Search Query Parameters**:
   - Which filters are evaluated on the server side? (`search`, `location`, `workMode`, `employmentType`, `minSalary`, `skills`)?
   - Does the backend support comma-separated multi-skills query (e.g., `?skills=React,Node.js`)?
4. **CORS Configuration**:
   - Confirm backend `CLIENT_URL` is set to `http://localhost:5173`.
