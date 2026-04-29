# Suggested Commands

## Development
- `yarn install`: Install dependencies.
- `yarn start`: Run the application.
- `yarn start:dev`: Run the application in watch mode (recommended for development).
- `yarn start:debug`: Run the application in debug mode.
- `yarn start:prod`: Run the production build.

## Build
- `yarn build`: Build the application for production. Output is in `dist/`.

## Testing
- `yarn test`: Run unit tests.
- `yarn test:watch`: Run unit tests in watch mode.
- `yarn test:cov`: Run tests with coverage report.
- `yarn test:debug`: Debug tests.
- `yarn test:e2e`: Run end-to-end tests.

## Code Quality
- `yarn lint`: Lint code using ESLint.
- `yarn format`: Format code using Prettier.

## Database
- No explicit migration commands found in `package.json`, but `synchronize: true` is set for TypeORM in `DatabaseModule` (dev only).

## Deployment (AWS Mau)
- `mau deploy`: Deploy to AWS using NestJS Mau (if configured).
