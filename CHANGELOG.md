# hidi - Changelog

## [UNRELEASED]

### Features

- Support registering `null` as a literal dependency value. `container.register('key', null)` now registers null as actual data (distinct from undefined/not-found).
