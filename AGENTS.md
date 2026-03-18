# Agents Configuration

## Project Context
SoundLog2 - A music logging and discovery application.

## Dev Commands
- Run all tests: `npm test`
- Run specific test: `npm test -- <path>`
- Lint: `npm run lint`
- Type check: `npm run typecheck`

## Integration Test Approach
Integration tests should verify the full HTTP request lifecycle:
1. Create H3 app with route
2. Start test server listener
3. Make fetch requests to localhost
4. Assert on HTTP response status and body

Direct handler invocation (calling the handler function with a mock event) is considered a unit test, not an integration test.

## Task 7: Integration Tests - Spec Compliance Notes
When implementing integration tests:
- Use `vi.doMock` inside each test for isolation (as shown in spec)
- Set up actual HTTP server with `createApp`, `toNodeListener`, and `fetch`
- Do not test handlers directly with mock events
- Verify HTTP response status and parsed JSON body

## Git Worktree Usage
Feature work should be done in isolated worktrees:
```bash
git worktree add .worktrees/<feature-name> main
cd .worktrees/<feature-name>
```
