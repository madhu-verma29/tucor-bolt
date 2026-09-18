# TUCOR backend — Phase 1
Spring Boot 3 / Java 21 / PostgreSQL authentication backend. UI structure/styles are intentionally untouched.

## Local
1. From backend: `docker compose up -d`
2. Set environment variables from `.env.example` (defaults already match compose).
3. Run `./mvnw spring-boot:run` if wrapper is added, or `mvn spring-boot:run`.

API: POST /api/auth/register, POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout, GET /api/auth/me.
Roles: BUYER, SELLER, ADMIN. ADMIN self-registration is blocked. Passwords use BCrypt; access JWTs are short lived; refresh tokens are random, SHA-256 hashed in DB, rotated on refresh and revocable on logout. Five failed logins lock the account for 15 minutes.

## Production
Replace DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD, JWT_SECRET and CORS_ORIGINS. Never commit production secrets. Flyway owns schema migrations.

## Phases
Phase 2: buyer profile/listings/orders/payments. Phase 3: seller profile/listings/pickups/payments. Phase 4: admin verification/workflow/management APIs.
