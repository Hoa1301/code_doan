# Style and Conventions

## Code Style
- **Linter**: ESLint with `typescript-eslint` and `eslint-plugin-prettier`.
- **Formatter**: Prettier.
- **Strictness**: `strictNullChecks` is enabled, but `noImplicitAny` is explicitly disabled in `tsconfig.json`.
- **Naming**:
    - Files: Kebab-case (e.g., `user.controller.ts`).
    - Classes/Functions: PascalCase/camelCase.
    - Directories: Kebab-case.

## Architecture Patterns
- **Modular Monolith**: Features are encapsulated in modules under `src/modules`.
- **Controller-Service-Repository**: Standard NestJS layering.
- **DTOs**: Used for request validation (`class-validator`, `zod`).
- **Schemas**: Database schemas defined in `schemas` directories within modules.
- **Abstract Base Classes**: Located in `src/providers/abstract-base` (e.g., `abstract-base.service.ts`, `abstract-base.entity.ts`).

## Database
- Dual support for MongoDB and PostgreSQL.
- Use `DatabaseModule.forRootAsync` to configure connections.
- Feature modules likely use `MongooseModule.forFeature` or `TypeOrmModule.forFeature`.

## Error Handling
- Custom exceptions in `src/common/exceptions`.
- Global filters/interceptors likely used (see `src/common/interceptors`).
