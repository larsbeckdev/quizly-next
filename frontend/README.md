# Quizly Frontend (Next.js)

The frontend for Quizly, built with Next.js App Router, shadcn/ui (Base UI,
`base-mira` style), TanStack Query and Tailwind v4. It talks to the Django
REST API in [../backend/](../backend/).

A signed-in user pastes a YouTube link, the backend turns the video into ten
multiple choice questions, and the user plays the quiz, sees the score and
compares every answer with the solution.

## Requirements

- Node 24 (managed with fnm)
- The Quizly Django backend running and reachable

## Getting started

```powershell
npm install
npm run dev
```

The app expects the API at `http://<host the page was opened from>:8000/api`.
Open the frontend and the API under the **same host name**, `localhost` with
`localhost` or `127.0.0.1` with `127.0.0.1`. The auth cookies are
`SameSite=Lax`, and the browser treats the two names as different sites.

Two environment variables adjust the API address, both inlined at build time
(`lib/api/client.ts`):

```dotenv
# Port of the API on the same host the page was loaded from. Default 8000.
NEXT_PUBLIC_API_PORT=3070

# Full base URL, wins over the port. Only needed when the API is not on
# <same host>:<port>, for example behind a domain.
NEXT_PUBLIC_API_BASE_URL=https://demo.example.com/api
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint incl. the React Compiler rules |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

## Routes

| Route | Content |
| --- | --- |
| `/login`, `/register` | Authentication, redirects to `/` when a session exists |
| `/` | Quiz generator with loading overlay and the most recent quizzes |
| `/library` | Quizzes of today, of the last seven days and all of them, each deletable |
| `/quizzes/[quizId]` | Title and description editing, the embedded video, start or resume |
| `/quizzes/[quizId]/play` | The quiz itself, then the result with retry and answer review |
| `/imprint`, `/privacy` | Legal pages, reachable without a session |

## API coverage

| Endpoint | Module |
| --- | --- |
| `POST /api/register/`, `POST /api/login/`, `POST /api/logout/` | `lib/api/auth.ts` |
| `POST /api/token/refresh/` | `lib/api/client.ts` |
| `GET, POST /api/quizzes/` | `lib/api/quizzes.ts` |
| `GET, PATCH, DELETE /api/quizzes/{id}/` | `lib/api/quizzes.ts` |

## Structure

```text
app/
  (auth)/       login and registration
  (app)/        the signed-in shell: start page, library, quiz detail and player
  (legal)/      imprint and privacy
  fonts/        Kantumruy Pro, K2D and Gugi, self hosted
components/
  auth/ brand/ forms/ layout/ quizzes/
  ui/           shadcn components
hooks/          TanStack Query hooks
lib/
  api/          the API client and one module per resource, zod schemas
  auth/         session hint, sign-in helpers and the useSession hook
```

## Notes

- Both JWTs live in HttpOnly cookies the page cannot read. Every request is
  sent with `credentials: "include"`. On a 401 the client calls
  `token/refresh/` once, shared by all requests failing at that moment, and
  repeats the request. When the refresh fails too, the user is sent to the
  login page.
- `localStorage` holds only a hint: the user from the login response under
  `quizly.session`, used by the header and the route gates. It contains no
  token; the API decides who is signed in.
- Quiz progress is kept per quiz under `quizly.progress.<id>`, so a reload
  resumes at the same question with the same answers.
- Creating a quiz is a single synchronous request that can take minutes.
  The overlay stays until the backend answers.
- The theme follows the system setting and can be toggled with the `d` key
  outside of input fields.
