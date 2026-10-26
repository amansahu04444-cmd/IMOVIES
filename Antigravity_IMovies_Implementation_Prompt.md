# Antigravity Implementation Prompt --- IMovies

You are acting as a senior full-stack engineer working inside the
existing IMovies MERN project repository.

## Primary instruction

First study the entire existing codebase and
`IMovies_Project_Documentation.md` (or the documentation file supplied
with this prompt). Convert the documentation into an implementation plan
and then implement the tasks in the existing project. Do not blindly
rewrite the project or replace working code. Preserve existing
conventions and working features.

## Non-negotiable rules

1.  **Inspect before editing.** Start by examining the repository tree,
    `package.json` files, environment examples, frontend entry points,
    API routes, middleware, controllers, services, Mongoose models, and
    existing tests.
2.  **Create a source-of-truth assessment.** Classify each feature as
    `IMPLEMENTED`, `PARTIAL`, `MISSING`, or `UNVERIFIED`. Use code and
    test evidence, not assumptions.
3.  **Do not invent project facts.** Do not invent deployed URLs, GitHub
    URLs, credentials, API keys, test results, package names, or
    existing features.
4.  **Do not overclaim.** A feature is complete only when implementation
    and relevant verification support that claim.
5.  **Preserve the stack.** Use the existing MERN architecture. Do not
    migrate frameworks or add a new database, state library, payment
    provider, or real-time system unless justified by a documented
    requirement and approved by the current project design.
6.  **Avoid destructive rewrites.** Do not delete working files or
    replace large parts of the codebase simply to match a suggested
    folder structure.
7.  **Make small, coherent changes.** Implement one task at a time,
    inspect the diff, and run relevant checks after each meaningful
    change.
8.  **Do not hardcode secrets.** Keep credentials in environment
    variables, update `.env.example` with placeholder values only, and
    verify `.gitignore`.
9.  **Maintain API compatibility.** Before changing endpoint paths,
    request/response shapes, auth token handling, or schema fields, find
    every frontend/backend caller and update them consistently.
10. **Handle failures honestly.** If a command fails, inspect the actual
    error, diagnose the cause, fix it, and rerun. Never report success
    if a check failed or was skipped.
11. **Do not run destructive database migrations or delete user data.**
    Explain any risky schema/index migration before proceeding and
    prefer backward-compatible changes.
12. **Do not add fake data to production.** Seed data may be added only
    through an explicit development/seed workflow and must be clearly
    identified.
13. **Do not add optional features just to make the project look
    bigger.** Prioritize a complete, reliable core booking flow over
    unneeded features.
14. **Use the existing package manager and scripts.** Do not assume
    scripts exist; inspect package manifests first.
15. **Do not guarantee zero errors by assertion.** Reduce errors through
    incremental implementation and verification, then report remaining
    risks explicitly.

## Phase 1 --- Repository audit (no code changes yet)

1.  Inspect the full repository structure and all relevant package
    manifests.
2.  Identify frontend framework/version, backend framework/version,
    database setup, scripts, routes, models, auth flow, environment
    variable names, and existing tests.
3.  Trace the current user journey from login through movie selection,
    showtime, seat selection, booking, and booking history.
4.  Trace the admin journey for movie, theatre, screen, and show
    management.
5.  Identify incomplete TODOs, broken imports, dead code, duplicated
    logic, mismatched API paths, inconsistent schemas, and missing error
    handling.
6.  Run existing safe checks before making changes: install status,
    lint/typecheck/build/test scripts that are actually present. Do not
    run destructive commands.
7.  Create/update `docs/PROJECT_AUDIT.md` with:
    -   Current architecture and repository map.
    -   Existing scripts and how to run the project.
    -   Feature status table (`IMPLEMENTED`, `PARTIAL`, `MISSING`,
        `UNVERIFIED`).
    -   Existing failures with exact command and concise error summary.
    -   Risks, assumptions, and recommended priorities.
8.  Do not start broad implementation until the audit and task plan are
    clear.

## Phase 2 --- Turn the documentation into a task plan

Create/update `docs/IMPLEMENTATION_PLAN.md`. Convert each relevant
requirement into small, verifiable tasks. Each task must include:

-   Task ID.
-   Requirement and user value.
-   Existing files/modules involved.
-   Dependencies or blockers.
-   Implementation steps.
-   Acceptance criteria.
-   Verification command/test.
-   Status: `TODO`, `IN_PROGRESS`, `BLOCKED`, or `DONE`.

Order work by dependency and risk. Recommended priority:

### P0 --- Project stability

-   Make sure frontend and backend install/build/start using the
    existing scripts.
-   Confirm environment variables and database connection handling.
-   Fix existing blocking errors before adding features.
-   Standardize error responses only if doing so does not break callers.

### P1 --- Authentication and authorization

-   Registration/login validation.
-   Password hashing and safe responses.
-   Token validation and expiry.
-   Server-side role authorization for admin routes.
-   Booking ownership checks.
-   Add regression tests for unauthorized access.

### P2 --- Core movie and show flow

-   Movie listing/details/search/filter.
-   Theatre/showtime retrieval.
-   Admin CRUD for movies/theatres/shows where missing.
-   Validate IDs, request data, and show schedules.
-   Verify frontend API URLs and loading/error states.

### P3 --- Reliable seat and booking workflow

-   Server-side seat availability checks.
-   Prevent duplicate seat booking under concurrent requests using a
    design compatible with the existing schema/database.
-   Calculate prices on the server.
-   Keep booking, seat, and payment states consistent.
-   Implement booking history and ownership-safe detail access.
-   Implement cancellation only if it is in scope and can safely release
    seats.
-   Add tests for duplicate requests and edge cases.

### P4 --- Optional features, only if requested and realistically supportable

-   Payment integration.
-   Socket.IO live updates.
-   Temporary seat locks and expiry.
-   Notifications.
-   Favorites, reviews, ratings.
-   Analytics/reports.

Do not begin P4 until P0--P3 are stable or the audit proves they are
already complete.

## Phase 3 --- Implement incrementally

For each task:

1.  Read the relevant code and understand the existing pattern.
2.  Write or update tests for expected behavior and failure cases.
3.  Implement the smallest maintainable change.
4.  Check imports, validation, permissions, API contracts, and edge
    cases.
5.  Run focused tests and relevant build/lint/type checks.
6.  Inspect the diff for unrelated changes, secrets, debug statements,
    and accidental file deletion.
7.  Update the task status only after verification passes.
8.  If the change breaks a previously passing test, fix it before
    continuing.

Do not implement the entire application in one huge code generation
step. Keep changes traceable and easy to review.

## Phase 4 --- Booking correctness and security checks

Pay special attention to:

-   Two users trying to book the same seat simultaneously.
-   Duplicate form submission or repeated API requests.
-   Booking amount tampering from the frontend.
-   User requesting another user's booking.
-   Non-admin calling admin APIs directly.
-   Invalid or expired JWTs.
-   Invalid ObjectIds and malformed request bodies.
-   Show schedule conflicts.
-   Payment callback replay or forged success if payments exist.
-   Seat release after failed/expired reservations.
-   Environment secrets accidentally exposed to the client or committed
    to Git.

Use transactions only when supported by the configured MongoDB
deployment and when justified by the data flow. Otherwise choose a
correct atomic design appropriate to the current schema and document its
limits. Do not claim concurrency safety without a test or clear
verification.

## Phase 5 --- Documentation and developer experience

Keep documentation aligned with actual implementation. Update:

-   `README.md`
-   `docs/PROJECT_AUDIT.md`
-   `docs/IMPLEMENTATION_PLAN.md`
-   `docs/API.md` or `docs/API_CONTRACT.md`, if useful
-   `.env.example` files
-   Any setup/test instructions affected by code changes

The README should include actual setup commands, real scripts from
package manifests, required environment variables with placeholder
values, and verified features. Keep Demo and GitHub links as
placeholders unless actual URLs are available in the repository or
explicitly supplied by the user. Never fabricate them.

## Phase 6 --- Final verification

After implementation, run all relevant scripts that exist in the
project:

-   Dependency installation check if needed.
-   Backend tests.
-   Frontend tests.
-   Lint/typecheck.
-   Production build.
-   API smoke tests or documented manual test steps.
-   A full core flow: login → browse movies → select show → select seats
    → create booking → view booking history.
-   Admin flow: login as admin → create/update a movie/show → verify
    public listing.
-   Security checks for role and booking ownership.

Do not claim tests passed unless they were actually run. If a test
cannot run because of missing credentials, services, or environment,
report the exact blocker and provide a safe way to verify it later.

## Required final response

When work is complete, provide:

1.  Summary of repository findings.
2.  Features implemented and files changed.
3.  Task IDs marked `DONE`, `BLOCKED`, or still `TODO`.
4.  Exact verification commands run and their actual results.
5.  Any unresolved bugs, assumptions, or environment blockers.
6.  Steps to run the application locally.
7.  Any manual checks still required.
8.  Confirmation that demo/repository URLs were not invented.

Begin with **Phase 1: Repository audit**. Do not make code changes until
the audit and implementation plan are written and the current baseline
checks are understood. Then proceed incrementally through the
prioritized tasks.
