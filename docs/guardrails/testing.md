# Test Guardrails

## Test Category Semantics

| Category | Location | Speed | External Dependencies | CI Default |
|---|---|---|---|---|
| Unit | `tests/DotNet/BlazorFlowGraph.*.Tests` | Fast (< 1 s per test) | None | Yes |
| Integration | (future: `tests/integration/`) | Slow (may take seconds) | Network, DB, containers | Explicit |
| E2E | (future: `tests/e2e/`) | Slow (browser automation) | Browser, running server | Explicit |
| Benchmark | `benchmarks/` | Variable | None | Never |

## Unit Test Rules

Unit tests must:

- be fast — complete in under 1 second each
- be deterministic — same result every run
- use no network, real databases, browser automation, or sleeps
- test observable behavior, not implementation details
- not assert on internal state unless necessary for correctness

## Slow / Integration Test Rules

Integration tests may:

- use in-process test doubles, test hosts, or substitutes for real infrastructure
- take longer than unit tests

Integration tests must:

- be deterministic
- not require a running external service unless explicitly orchestrated

## Agent Testing Guardrails

Agents must:

- run `./eng/check.sh` before declaring work complete
- not write unit tests that sleep or have timing-dependent assertions
- not write unit tests that hit real network endpoints
- place integration tests in the integration test project, not the unit test project
- not generate broad generated tests that assert on implementation details

## TUnit Conventions

Tests use TUnit with Microsoft Testing Platform (MTP).

- Test methods are annotated with `[Test]`
- Assertions use `await Assert.That(value).IsEqualTo(expected)` style
- Test projects are run with `dotnet run --no-build --configuration Release --project <path>`
