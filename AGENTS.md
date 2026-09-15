# Repository Instructions

## Project

- Backend: a Spring Boot 4.0.8 application using Java 17; the entrypoint is `src/main/java/com/udea/lab1arq/Lab1arqApplication.java`.
- Runtime code is organized as controllers -> services -> repositories, with JPA entities in `entity`, API models in `DTO`, and MapStruct mappers in `mapper`.
- The main HTTP resources are `/api/customers` and `/api/transactions`.
- Frontend: a separate React 19 + Vite 8 SPA in `frontend/` (plain JSX, no TypeScript). It owns no business logic; it only consumes the `/api` routes above.

## Commands

- Use the Maven wrapper from the repository root: `./mvnw` on Unix-like shells or `./mvnw.cmd` on Windows PowerShell.
- Run the full test suite with `./mvnw.cmd test` (or `./mvnw test`); run a focused test with `./mvnw.cmd -Dtest=ClassName#methodName test`.
- Build the application with `./mvnw.cmd package`; Maven compilation also generates MapStruct implementations under `target/generated-sources/annotations`.
- Do not edit `target/` or other generated output; change the mapper interfaces or source configuration instead.
- The frontend has its own toolchain and must be run from the `frontend/` directory: `npm install`, then `npm run dev` (dev server on `5173`) or `npm run build` (outputs to `frontend/dist`).

## Frontend And API Contracts

- `frontend/vite.config.js` proxies `/api` to `http://localhost:8088`, so the SPA never needs CORS and the backend has no CORS configuration. Calling the API from any other origin requires adding CORS to the controllers first.
- Validation failures (`400`) are returned by the controllers as a bare `String` body, not a JSON object, so the bytes are not valid JSON. `frontend/src/api.js` reads the body as text and only then attempts `JSON.parse`; keep that fallback if you touch error handling.
- Not-found responses (`404`) come from `ResponseStatusException` and use Spring Boot's default error payload, which does include `message`.
- `/api/transactions/{id}` and `/api/transactions/account/{accountNumber}` must keep their current paths: account numbers are numeric strings, so a path-variable type constraint cannot disambiguate them.
- `transferMoney`, `updateTransaction`, and `deleteTransaction` all mutate `customers.balance` and are `@Transactional`. `PUT` reverts the previous amounts before applying the new ones and `DELETE` reverts them entirely, so either can drive a balance negative by design.
- `Transaction.timestamp` is a `LocalDateTime`, serialized without offset and with up to 7 fractional digits (e.g. `2026-09-15T11:46:14.6599196`); JavaScript `Date` parses this, but do not assume 3-digit milliseconds.

## Runtime And Tests

- The application expects PostgreSQL at `localhost:5432`, database `udeabank`, with the credentials currently defined in `src/main/resources/application.properties`; it listens on port `8088`.
- JPA uses `spring.jpa.hibernate.ddl-auto=update`, so starting the app can modify the configured database schema. There is no separate test profile or embedded database configured.
- The existing `@SpringBootTest` therefore requires a reachable PostgreSQL instance; database-dependent tests should provide equivalent test configuration rather than assuming an in-memory database.
