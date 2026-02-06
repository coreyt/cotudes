# cotudes Design Principles and Best Practices

## 9 Design Principles

### 1. Real Work, Not Toy Examples

Every cotude must involve a genuine engineering task that produces working
software. "Write a prompt for a TODO app" is not a cotude. "Build a REST API
endpoint with proper error handling, test coverage, and documentation --
collaborating with an agent using spec-driven development" is a cotude.

### 2. The Trap Must Be Authentic

The "trap" in each cotude must be a mistake that real practitioners actually
make, as documented in practitioner literature. Fabricated traps that no one
would actually fall into teach nothing. Every trap must be traceable to a
documented anti-pattern.

Trap severity scale:
- **5 (Instinctive)**: Virtually every developer does this initially (e.g., vague prompting)
- **4 (Common)**: Most developers without training make this mistake (e.g., no persistent context)
- **3 (Intermediate)**: Experienced developers with some agent exposure still hit this (e.g., echo-chamber review)
- **2 (Advanced)**: Only surfaces in complex workflows (e.g., parallel agent conflicts)
- **1 (Subtle)**: Requires deep agent fluency to recognize (e.g., context window economics)

### 3. One Primary Skill Per Etude

Each cotude targets one primary competency from the 10 Core Competencies.
Secondary competencies may be exercised, but the primary skill must be the clear
focus. If an etude tries to teach specification writing AND parallel
orchestration AND context engineering, it teaches none of them well.

### 4. Respect the Learner's Expertise

Cotudes are for engineers, not beginners. Associate-level etudes assume the
learner knows how to code. Staff-level etudes assume deep technical expertise.
Never condescend. The agent collaboration skill is new; their engineering
knowledge is not.

For Associate path: assume they know basic programming, data structures, and
version control. Don't explain what a function is. Do explain what makes a
specification effective.

For Staff+ paths: assume they can architect systems, review code, and debug
complex issues. Don't explain engineering fundamentals. Do challenge their
assumptions about how their expertise should adapt to agent collaboration.

### 5. Contrast Is the Teacher

The most powerful learning moment in each cotude is the **contrast** between the
ineffective approach (trap) and the effective approach (axiom in practice). Both
approaches must be demonstrated on the same task so the learner can see the
difference in outcome, not just be told about it.

### 6. Axioms Must Be Memorable

Each cotude produces one crisp axiom -- a principle the learner carries forward.
These should be:
- Concise (one sentence)
- Actionable (directly applicable to future work)
- Non-obvious (the learner wouldn't have guessed it before the exercise)

Examples:
- "Incremental decomposition with verification gates produces dramatically better
  agent output than monolithic requests."
- "The agent's context window is not a database -- every token you add competes
  for attention."
- "If you can't evaluate the output, you shouldn't delegate the task."

### 7. Working Software Is the Measure

An etude is not complete until working software exists. Not a plan. Not a
conversation. Not a prompt template. Working, tested, reviewed code that the
learner can explain and defend.

### 8. The Interaction Is the Artifact

Unlike traditional coding exercises where only the output matters, cotudes
require the learner to preserve and annotate their agent interaction. The
*process* of collaboration is as important as the product. This is the equivalent
of showing your work in mathematics.

### 9. Language and Tool Agnostic

Core principles transfer across Claude Code, Codex, Jules, Antigravity, Cursor,
and whatever comes next. Etudes may specify a tool for practical execution, but
the axioms should not be tool-specific. If a principle only works with one
specific agent, it's not a principle -- it's a workaround.

## Quality Checklist

### Requirement A (Agent Skill)

- [ ] Does the etude target exactly one primary competency?
- [ ] Is the trap authentic and documented in practitioner literature?
- [ ] Does the contrast clearly demonstrate the superior approach?
- [ ] Is the axiom concise, actionable, and non-obvious?
- [ ] Would the skill transfer to a different agent tool?

### Requirement B (Real Engineering)

- [ ] Does the etude produce working, tested software?
- [ ] Is the engineering task non-trivial?
- [ ] Does the task match the target role's actual work?
- [ ] Are success criteria clear and automatable?
- [ ] Does the codebase context feel realistic?

### Etude Structure

- [ ] Metadata (path, number, competency, trap severity, prerequisites)
- [ ] Overview (what the learner will build and learn)
- [ ] The Setup (codebase context and task description)
- [ ] The Trap (natural approach and its failure signal)
- [ ] The Approach (effective agent collaboration pattern)
- [ ] The Axiom (one-sentence principle)
- [ ] Verification (how to confirm success)
- [ ] Reflection Prompts (questions for the interaction log)

## Coding Standards for Etude Codebases

Etude starter codebases should:

- Use strong typing (TypeScript over JavaScript, typed Python over untyped)
- Include a working test suite (even if minimal)
- Have clear build/run/test commands documented
- Include a CLAUDE.md or equivalent context file
- Be self-contained (no external service dependencies unless the etude is
  specifically about that)
- Use standard, well-known frameworks (not obscure libraries)
- Compile and pass tests in the initial state

## Anti-Patterns in Etude Design

- **The Lecture**: An etude that is mostly explanation with a tiny exercise.
  Ratio should be ≥60% doing, ≤40% reading.
- **The Guessing Game**: An etude where the "correct" approach isn't clearly
  superior -- the learner can't tell which worked better.
- **The Tool Demo**: An etude that teaches a specific tool feature rather than a
  transferable skill.
- **The Perfection Trap**: An etude that implies there's one "correct" way to
  interact with an agent. Multiple approaches can embody the same principle.
- **The Island**: An etude with no connection to the learner's actual work.
  Every etude should feel like something they'd encounter in their job.
