# ASE-001: The Vague Request

> **Axiom**: Agents don't read your mind -- the spec IS the product.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Associate Software Engineer |
| **Number** | ASE-001 |
| **Primary Competency** | Specification Writing |
| **Trap Severity** | 5 (Instinctive) |
| **Prerequisites** | ASE-000 (Environment Setup) |
| **Duration** | 1-2 sessions |
| **Stack** | TypeScript (Express, Vitest) |

## Overview

You will build a REST API for managing a bookmark collection. The task is the
same both times. The difference is how you describe it to the agent. The gap
between the two outcomes will teach you more about specification writing than
any lecture.

## Why Your Coding Agent Cares

When you ask an agent to "add CRUD endpoints for bookmarks," it must decide:
status codes, validation rules, error formats, pagination strategy, type
definitions, test coverage. It will make reasonable choices -- but they will be
its choices, not yours. You won't know what it decided until you read the
output. And by then, the cost of disagreement is a rewrite.

A specification eliminates ambiguity at the cheapest possible point -- before
the agent writes any code. Every constraint in the spec is one fewer decision
the agent has to guess about. Agents genuinely produce better code from specs,
because they don't have to hedge across multiple plausible interpretations.

The difference between "build me a REST API" and a structured spec is the
difference between the agent guessing your intent and implementing your intent.
The spec isn't overhead for the agent -- it's a signal boost.

## The Setup

The `starter/` directory contains a TypeScript Express server with:

- A working health check endpoint (`GET /health`)
- An in-memory data store pattern
- A `Bookmark` interface (partially defined)
- A test suite with Vitest configured
- Build, test, and lint scripts

```bash
cd starter/
npm install
npm run check   # build + lint + test -- all should pass
```

**Your assignment**: Add CRUD endpoints for bookmarks:

- `POST /bookmarks` -- create a bookmark
- `GET /bookmarks` -- list bookmarks (with pagination)
- `GET /bookmarks/:id` -- get a single bookmark
- `PUT /bookmarks/:id` -- update a bookmark
- `DELETE /bookmarks/:id` -- delete a bookmark

A bookmark has: `id`, `url`, `title`, `tags` (string array), and `createdAt`.

## Part 1: The Natural Approach

Start your agent in the `starter/` directory. Describe the task in your own
words -- however you would naturally ask for it. Something like:

> "Add CRUD endpoints for bookmarks to this Express app."

Let the agent work. When it finishes, run `npm run check`. If the code compiles
and tests pass, review what the agent produced.

### Checkpoint

Examine the agent's output against this checklist. For each item, record
pass/fail in your interaction log:

- [ ] Does `POST` return 201 (not 200)?
- [ ] Does `POST` validate that `url` is non-empty and a valid URL?
- [ ] Does `POST` validate that `title` is non-empty?
- [ ] Does `GET /bookmarks` support pagination (limit/offset or cursor)?
- [ ] Does `GET /bookmarks/:id` return 404 for missing bookmarks?
- [ ] Does `PUT` return 404 for missing bookmarks?
- [ ] Does `DELETE` return 404 for missing bookmarks?
- [ ] Are error responses in a consistent format (e.g., `{ error: string }`)?
- [ ] Do all fields have proper TypeScript types (no `any`)?
- [ ] Are edge cases tested (empty strings, missing fields, duplicate IDs)?

Count the failures. This is your baseline.

## Part 2: The Effective Approach

Reset the codebase to its original state. Before starting a new agent session,
write a specification document. Not code -- a document that describes exactly
what the API should do.

Create a file called `spec.md` with this structure:

```markdown
# Bookmark API Specification

## Data Model
- id: string (UUID v4, server-generated)
- url: string (required, must be valid URL starting with http:// or https://)
- title: string (required, 1-200 characters)
- tags: string[] (optional, defaults to empty array, max 10 tags, each 1-50 chars)
- createdAt: string (ISO 8601, server-generated)

## Endpoints

### POST /bookmarks
- Request body: { url, title, tags? }
- Success: 201 with created bookmark
- Validation errors: 400 with { error: string, details: string[] }
- Missing/invalid url: 400
- Missing/empty title: 400

### GET /bookmarks
- Query params: limit (default 20, max 100), offset (default 0)
- Success: 200 with { data: Bookmark[], total: number, limit: number, offset: number }

### GET /bookmarks/:id
- Success: 200 with bookmark
- Not found: 404 with { error: "Bookmark not found" }

### PUT /bookmarks/:id
- Request body: partial bookmark (only fields to update)
- Cannot update id or createdAt
- Success: 200 with updated bookmark
- Not found: 404
- Validation: same rules as POST for provided fields

### DELETE /bookmarks/:id
- Success: 204 (no body)
- Not found: 404

## Error Format
All errors: { error: string, details?: string[] }
```

Now start a new agent session. Give it the spec:

> "Implement the bookmark API according to this specification. Follow the
> conventions in the existing codebase. Write tests that cover every status
> code and validation rule listed in the spec."

### Checkpoint

Run the same checklist from Part 1. Count the failures. Compare.

- [ ] How many checklist items pass now vs. Part 1?
- [ ] How many follow-up prompts did the agent need?
- [ ] Is the code more consistent with the existing codebase?

## The Principle

When you ask an agent to "add CRUD endpoints," you are asking it to make dozens
of decisions: status codes, validation rules, error formats, pagination
strategy, type definitions, test coverage. The agent will make all of these
decisions. Most of them will be reasonable. Some will be wrong. The problem is
you won't know which are wrong until you review the output -- and by then the
code is written.

A specification externalizes these decisions. Every constraint you write down
is a constraint the agent won't have to guess about. The spec isn't overhead --
it's the interface between your intent and the agent's execution.

The instinct to "just describe it and let the agent figure it out" comes from
a reasonable place: when YOU write code, you make these decisions implicitly
as you type. But the agent isn't you. It has no access to your implicit
expectations. The only expectations that exist for the agent are the ones you
write down.

> **Agents don't read your mind -- the spec IS the product.**

## Reflection

Record in your interaction log:

1. **Specificity gap**: List three decisions the agent made in Part 1 that you
   didn't think to specify. Were they correct? How would you have known if
   they weren't?
2. **Time comparison**: How long did it take to write the spec vs. how long
   did you spend reviewing and correcting Part 1's output?
3. **Test quality**: Compare the tests from Part 1 and Part 2. Which cover
   more edge cases? Which would you trust more in production?
4. **Going forward**: For your next feature at work, what would a
   specification look like before you hand it to an agent?

## Going Further

- Add a `tags` filter to `GET /bookmarks` (e.g., `?tag=typescript`). Write the
  spec first, then implement with the agent. Notice how the spec prevents
  ambiguity about partial matching vs. exact matching.
- Add request rate limiting. Spec the behavior first: what status code? What
  headers? What limits? Then implement.
- Try giving the spec from Part 2 to a different agent tool. Does the
  specification transfer? Does the output quality remain consistent?
