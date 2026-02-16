# Tiny Inventory

A full-stack inventory management system for tracking stores and their products.

## Run Instructions

**Prerequisites:** Docker and Docker Compose

```bash
docker compose up --build
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/api
- Seed data is automatically loaded on first startup

## API Overview

```
GET/POST            /api/stores                 List or create stores
GET/PATCH/DELETE    /api/stores/:id             Get, update, or delete a store
GET/POST            /api/stores/:id/products    List or add products for a store
GET                 /api/products?category=&minPrice=&maxPrice=&inStock=&search=&sortBy=&page=&limit=
                                                            List products (filtered, paginated)
GET/PATCH/DELETE    /api/products/:id                       Get, update, or delete a product
GET                 /api/reports/low-stock?threshold=5      Low stock report with restock cost
```

## Decisions & Trade-offs

In my opinion it's important to pick tools both right for the job and the ones that the team is familiar with (if possible). Picking something standard/popular makes it possible to find people that already know the tech.

**NestJS** probably at first most people would think: simple task, let's use express or something lightweight. So, why NestJS? From my experience AI(claude) works better with well documented frameworks. That's not a deal breaker for a long term project, but with limited time it makes a difference. Another reason is the task is typical CRUD, Nest has patterns ready to use for that.

**TypeORM** established solution I've been using for a long time and my default choice for personal projects. Works well with NestJS.

**Database** PostgreSQL is the natural choice for relational data. SQLite is nice for test purposes, but since we have Docker I think it's better to use the same database as we plan for production as it is easy to setup. I once joined a project which had SQLite for development (in 2016). We introduced Docker and moved to PostgreSQL. It's always better to have the same / closest setup to production environment to minimize chances of something going wrong because of the differences.

No database indexes added. With the current dataset this has no impact, but at scale these would be needed.

The data model uses a one-to-many Store-to-Product relationship for simplicity. A many-to-many would be more natural to me (one product can be sold in multiple stores), but the task would get much more complicated and one-to-many meets the requirements, so I decided to go with simple approach.

**Vite + React over Next.js** because there's no need for SSR, the Docker setup is simpler (nginx serving static files). TanStack Query handles data fetching with built-in caching, automatic loading/error states, and cache invalidation on mutations.

**nuqs** manages filter state via URL query parameters, making filters shareable, bookmarkable, and resilient to page refresh. 

**shadcn/ui** gives copy-paste components you own. Popular and I like it for clean design.

**Pagination** uses offset-based approach for simplicity. Cursor-based would be better at scale to avoid skip performance degradation on large datasets.

**Seed data** runs on startup via NestJS OnModuleInit, only when the database is empty. It is skipped in production via a NODE_ENV check.

**Low stock report** is the non-trivial operation: it aggregates products below a configurable threshold across all stores, groups them by store, and computes per-product deficit and estimated restock cost.

The logic implemented in the reports service is functional and works for small data. If we had a use case with a lot of data we would have to think this all over. Use a SQL aggregation (it's more efficient than calculating in node) and limit the number of displayed items.



## Testing Approach

Decided to focus on integration tests with 80+% coverage to ensure everything is production ready. If this was a real production application I'd consider adding E2E tests to test critical flows, as they are even closer to real user experience.

**Backend**: Integration tests with Jest and Supertest against a SQLite in-memory database. Tests cover API contracts end-to-end — validation errors, 404 responses, filtering, pagination, and aggregation correctness for the low-stock report.

**Frontend**: Two-layer testing approach using Vitest and React Testing Library. Integration tests with MSW (Mock Service Worker) test the full component → hook → API client chain for both read and mutation flows, verifying that data fetching, cache invalidation, and UI updates work end-to-end. Targeted component tests cover form validation and error states.

## If I Had More Time

- Authentication
- CI/CD pipeline with GitHub Actions
- Setup database migrations
