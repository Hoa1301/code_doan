# Task Completion Workflow

After completing a coding task, follow these steps to ensure quality and consistency:

1.  **Linting**: Run `yarn lint` to check for code style issues and potential errors. Fix any reported issues.
2.  **Formatting**: Run `yarn format` to ensure code adheres to the project's formatting rules (Prettier).
3.  **Testing**:
    - Run `yarn test` to execute unit tests and ensure no regressions.
    - If new features were added, ensure corresponding tests are included.
    - Run `yarn test:e2e` if the changes affect API endpoints or integration flows.
4.  **Build**: Run `yarn build` to verify that the project compiles successfully without errors.
5.  **Review**: Check `git status` and `git diff` to review changes before committing.
