# Project Overview

## Purpose
A NestJS starter boilerplate, seemingly designed for a Point of Sale (POS) or inventory management system. It includes features for authentication, customer management, order processing, product/inventory management, and reporting.

## Tech Stack
- **Framework**: NestJS (v11)
- **Language**: TypeScript (v5.7)
- **Package Manager**: Yarn
- **Database**:
    - **MongoDB**: via Mongoose (v8)
    - **PostgreSQL**: via TypeORM (v0.3) & pg
    - Both are supported via a dynamic `DatabaseModule`.
- **Validation**: `class-validator`, `zod`, `nestjs-zod`.
- **Authentication**: Passport (`passport-jwt`, `passport-local`, `bcrypt`).
- **Documentation**: Swagger (`@nestjs/swagger`).
- **Testing**: Jest, Supertest.

## Key Directories
- `src/main.ts`: Application entry point.
- `src/modules`: Feature modules grouped by domain (e.g., `feature-auth`, `feature-product`).
- `src/common`: Shared utilities, configurations, decorators, exceptions, and database setup.
- `src/providers`: Abstract base classes.
- `test`: E2E tests.

## Environment
- `.env.example` provided.
- `nest-cli.json` for CLI configuration.
