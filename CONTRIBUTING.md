# Contributing

Thank you for your interest in contributing to this project! We welcome contributions from everyone and appreciate your help in making this project better.

## Getting Started

### Setting Up Your Development Environment

Use the [Setup Guide](./docs/contributing/setup.md) to setup your environment.

## Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/short-description
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance and tooling

### Making Changes

- Keep changes focused and atomic
- Follow the existing code style and conventions
- Run linters/formatters and tests before committing

### Testing

- Add tests for new features and bug fixes
- Ensure all tests pass
- Always improve test coverage

## Commit Guidelines

### Commit Messages

Follow [conventional commits](https://www.conventionalcommits.org/) format

```
type(scope): subject

body

footer
```

**Type:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples:**

- `feat(auth): add login functionality`
- `fix(api): resolve timeout issue`
- `docs: update README`

### Best Practices

- Use the imperative mood ("add feature" not "added feature")
- Don't capitalize the subject line
- Keep the subject line under 50 characters
- Reference issue tickets (e.g., `Closes #123`)

## Submitting a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin feature/short-description
   ```

2. Create a Pull Request with:
   - Clear title and description
   - Reference to related issues
   - Explanation of changes and why they were made

3. Ensure CI/CD checks pass

4. Address review feedback promptly

## Code Style

- Follow the existing code conventions in the repository
- Write meaningful variable and function names
- Add comments for complex logic

## Documentation

- Update `README.md` for significant changes
- Add inline code comments for complex logic
- Update changelog (`CHANGELOG.md`) for notable changes
- Keep documentation up-to-date with code changes

## Reporting Issues

### Bug Reports

Include:

- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Error messages or screenshots

### Feature Requests

Include:

- Clear description of the proposed feature
- Motivation and use cases
- Potential implementation approach (optional)
- Examples if applicable

## Community Guidelines

- Be respectful and inclusive
- Assume good intent
- Provide constructive feedback
- Help others in the community
- Report code of conduct violations to [EMAIL]

## License

By contributing to this project, you agree that your contributions will be licensed under its license (see [License](./LICENSE.md)).

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## Questions?

Feel free to:

- Open an issue for questions
- Check existing discussions
- Reach out to maintainers

---

Happy contributing!
