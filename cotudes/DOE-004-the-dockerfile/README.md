# DOE-004: The Dockerfile

> **Axiom**: A Dockerfile that builds is not a Dockerfile that ships -- give agents your production constraints, not just your application code.

## Metadata

| Field | Value |
|-------|-------|
| **Path** | Staff DevOps / CI/CD Engineer |
| **Number** | DOE-004 |
| **Primary Competency** | Context Engineering |
| **Secondary Competency** | Output Evaluation |
| **Trap Severity** | 3 (Moderate) |
| **Prerequisites** | DOE-001 through DOE-003 |
| **Duration** | 1-2 sessions |
| **Stack** | Docker |

## Overview

You will ask an agent to write a Dockerfile for a Node.js service. The agent
will produce a working image that is 1.2 GB, runs as root, includes build tools
in the final image, and invalidates the layer cache on every code change. You
will then provide production constraint context and watch the agent produce a
120 MB, non-root, multi-stage image with proper layer ordering.

## Why Your Coding Agent Cares

Agents treat Dockerfiles as build scripts. Given "write a Dockerfile for this
Node.js app," the agent produces something that builds and runs the application.
Mission accomplished -- from the agent's perspective.

But "builds and runs" is not your acceptance criteria. Your acceptance criteria
include image size (because you pay for registry storage and transfer, and
deployment speed is proportional to image size), security posture (because
container scanning tools will flag root users and unnecessary packages), layer
caching (because a Dockerfile that invalidates the cache on every `COPY . .`
turns a 10-second build into a 3-minute build), and base image policy (because
your organization has approved base images and `node:latest` is not one of
them).

The agent doesn't know any of this. It has no context about your registry
costs, your security scanning requirements, your build time SLOs, or your
approved base image list. Without that context, it defaults to the simplest
Dockerfile that works: a single-stage build on the full `node` image, running
as root, copying everything, installing everything.

This is a pure context engineering problem. The agent is capable of writing
excellent Dockerfiles -- multi-stage builds, non-root users, `.dockerignore`
files, optimized layer ordering. It just needs to know that you require these
things. The gap between the bad Dockerfile and the good one is not skill; it
is context.

## The Setup

The `starter/` directory contains a Node.js/TypeScript API service:

- `src/` -- TypeScript source (~20 files)
- `package.json` and `package-lock.json`
- `tsconfig.json`
- `test/` -- unit tests
- No Dockerfile, no `.dockerignore`

The service compiles to JavaScript via `tsc` and runs with `node dist/index.js`.
It has both `dependencies` and `devDependencies` (test frameworks, type
definitions, build tools).

```bash
cd starter/
npm install
npm run build
npm start     # Verify it runs
```

**Your assignment in two phases**:

1. Ask an agent to write a Dockerfile
2. Provide production constraints and ask again

## Part 1: The Natural Approach

Start your agent and give it the task:

> "Write a Dockerfile for this Node.js service."

Let the agent produce the Dockerfile. Build and run it:

```bash
docker build -t order-processor:v1 .
docker images order-processor:v1    # Note the image size
docker run --rm order-processor:v1
```

The image will build. The application will run. Everything works.

### Checkpoint

Record in your interaction log:

- [ ] What is the image size? (Record the exact number.)
- [ ] What base image did the agent choose? Is it `node:latest`, `node:20`,
      or something else?
- [ ] Does the Dockerfile use a multi-stage build?
- [ ] What user does the container run as? (`docker run --rm order-processor:v1 whoami`)
- [ ] Are `devDependencies` included in the final image?
- [ ] Are build tools (`tsc`, type definitions) in the final image?
- [ ] What is the layer ordering? Does changing a source file invalidate the
      `npm install` layer?
- [ ] Is there a `.dockerignore` file?
- [ ] Run a container scan: `docker scout cves order-processor:v1` or
      `trivy image order-processor:v1`. How many vulnerabilities?

## Part 2: The Effective Approach

Reset the codebase (delete the Dockerfile and `.dockerignore`). This time,
create a constraint document before engaging the agent.

**Step 1: Write a Dockerfile specification.**

Create `DOCKERFILE_SPEC.md`:

```markdown
## Dockerfile Requirements

### Base Image
- Use node:20-alpine for both build and runtime stages
- If a build stage needs compilation tools, use node:20-alpine with
  explicit apk add for only what's needed, and do not carry those
  into the runtime stage

### Multi-Stage Build
- Stage 1 (build): install ALL dependencies, compile TypeScript
- Stage 2 (production): copy only compiled output and production
  dependencies
- devDependencies must NOT be in the final image

### Security
- Final stage must run as a non-root user (create and switch to it)
- No secrets or credentials in the image
- Read-only root filesystem compatible (no writes to / at runtime)

### Layer Optimization
- Copy package.json and package-lock.json BEFORE copying source code
- Run npm ci (not npm install) for deterministic builds
- Source code copy should be the last layer that changes frequently
- Use .dockerignore to exclude node_modules, .git, test/, docs/

### Size Budget
- Final image must be under 200 MB
- Target: under 150 MB

### Labels and Metadata
- Include LABEL with maintainer, version, and description
- Include HEALTHCHECK instruction
- Expose the correct port

### Build Args
- Accept NODE_ENV as a build arg (default: production)
- Accept APP_VERSION as a build arg
```

**Step 2: Prompt with constraints.**

Start a fresh agent session:

> "Read DOCKERFILE_SPEC.md. Then write a Dockerfile and .dockerignore for
> this Node.js service. Follow every requirement in the spec."

Build and evaluate:

```bash
docker build -t order-processor:v2 .
docker images order-processor:v2
docker run --rm order-processor:v2 whoami
docker scout cves order-processor:v2   # or trivy
```

**Step 3: Test layer caching.**

Change a source file and rebuild:

```bash
# Touch a source file
echo "// comment" >> src/index.ts

# Rebuild -- observe which layers are cached
docker build -t order-processor:v2-modified .
```

If layer caching is correct, the `npm ci` layer should be cached and only
the source copy and build layers should re-run.

### Checkpoint

- [ ] What is the image size? Compare to Part 1.
- [ ] Does the container run as non-root?
- [ ] Are `devDependencies` excluded from the final image?
- [ ] How many vulnerability findings compared to Part 1?
- [ ] Does modifying source code preserve the dependency install cache?
- [ ] Is the `.dockerignore` file present and correct?
- [ ] Does the image include a `HEALTHCHECK`?
- [ ] Is the total build time acceptable? Does caching work on rebuild?

## The Principle

A Dockerfile is a compression of your operational requirements into a build
recipe. When you write one yourself, you bring years of context: you know your
base image policy because you fought the battle to standardize it. You know
to use multi-stage builds because you debugged a production issue caused by
`gcc` being in a runtime container. You know to run as non-root because your
security team's scanner will reject anything else.

The agent has none of this context. It has seen thousands of Dockerfiles in its
training data, and many of them are tutorials that use `node:latest`, run as
root, and skip multi-stage builds. Without your constraints, the agent produces
a statistically average Dockerfile -- and the statistical average is not
production-grade.

Context engineering for Dockerfiles is straightforward: write down what you
already know. Your base image policy, your size budget, your security
requirements, your layer caching expectations. These constraints exist in your
head or in scattered wiki pages. Consolidating them into a machine-readable
specification gives the agent the same operational context you carry
instinctively.

The difference between Part 1 and Part 2 is not agent capability. It is the
information available to the agent. Same model, same code, dramatically
different output. This is the leverage of context engineering: you convert your
infrastructure expertise into agent input, and the agent converts it into
compliant output.

> **A Dockerfile that builds is not a Dockerfile that ships -- give agents your production constraints, not just your application code.**

## Reflection

Record in your interaction log:

1. **Size delta**: What was the image size difference between Part 1 and Part 2?
   Calculate the registry storage and transfer cost difference at your
   deployment scale.
2. **Vulnerability delta**: How many CVEs were eliminated by switching base
   images and removing unnecessary packages?
3. **Cache effectiveness**: How much build time does proper layer ordering save
   on a typical code change? Multiply by your daily build count.
4. **Specification reuse**: Could the `DOCKERFILE_SPEC.md` you wrote apply to
   other services in your organization? What would you generalize?
5. **Context inventory**: What other operational constraints do you carry in
   your head that agents don't know about? List three.

## Going Further

- Create a Dockerfile linter configuration (hadolint) that enforces your
  organizational policies. Run it in CI as part of the guardrail pipeline
  from DOE-003.
- Write a base image policy as a reusable context document. Test it against
  five different service types (Node.js, Python, Go, Java, static site) and
  refine it based on what the agent gets wrong.
- Extend the exercise to Docker Compose. Give the agent a multi-service
  architecture and observe how it handles networking, volume mounts, and
  dependency ordering between containers.
