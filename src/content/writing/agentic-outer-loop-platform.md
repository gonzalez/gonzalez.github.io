---
title: The agentic outer loop platform
description: Notes on the outer loop that runs around a coding agent — setup, validation, conventions — and where the platform itself lives.
createdDate: 2026-11-05
tags: [agentic, tooling, platforms]
maturity: growing
---

The interesting part of agentic development is rarely the prompt. It is the
**outer loop** — everything that surrounds a coding session: the environment
the agent starts from, the checks that run after every change, and the
conventions that keep a repository legible to both humans and agents.

The platform I run that loop on is public:
[gonzalez/agent-dev-setup](https://github.com/gonzalez/agent-dev-setup).

## What the loop is responsible for

- **Setup** — a reproducible environment, so every session starts from known
  state instead of archaeology.
- **Validation** — tests and checks that run locally after each change,
  before anything is published.
- **Discipline** — small, reviewable changes, with the operator keeping the
  merge gate rather than the agent.

## A concrete example

This very site runs its loop as a single command: the Python rasterizer
suite, `astro check`, a static build, and a set of site-contract probes must
all pass before a change counts as done. Nothing publishes without it —
publishing is a deliberate push, never a side effect of a green run.

## Status

Growing. The loop works and has real runs behind it; I'll promote this note
to evergreen once its shape stops changing.
