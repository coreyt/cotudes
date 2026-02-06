# cotudes

**Agentic Co-developer Etudes** -- structured exercises for learning to work
effectively with AI coding agents.

---

## What Is This?

An **etude** is a musical exercise designed to develop a specific technical skill
through deliberate practice. **cotudes** (co + etudes) applies this concept to a
skill that didn't exist three years ago: **collaborating with an autonomous
coding agent**.

Inspired by Peter Norvig's [pytudes](https://github.com/norvig/pytudes) and
[cpptudes](https://github.com/coreyt/cpptudes), this repository contains
structured coding exercises where you build real software while developing
specific agent collaboration skills.

Each cotude involves a real engineering task and follows a **trap-then-correct**
pattern:
1. You attempt the task using your natural instincts
2. You observe where those instincts produce poor agent interactions
3. You re-approach the task with an effective collaboration pattern
4. You articulate the principle that made the difference

## Why This Exists

Knowing how to use a tool is easy. Knowing how to collaborate effectively with
an autonomous coding agent is a distinct skill set that requires practice.

Practitioners across Claude Code, Codex, Jules, and Antigravity consistently
report the same lesson: **the hard part isn't the tool -- it's the mental model
shift from code writer to engineering director**. Specification writing, context
engineering, task decomposition, output evaluation, and delegation judgment are
the skills that separate effective agent collaborators from frustrated ones.

cotudes develops these skills through deliberate practice on real engineering
tasks.

## The 10 Core Competencies

| # | Competency | What It Means |
|---|-----------|--------------|
| 1 | Specification Writing | Writing clear specs before prompting |
| 2 | Context Engineering | Providing the right information at the right time |
| 3 | Task Decomposition | Breaking work into agent-sized pieces |
| 4 | Delegation Judgment | Knowing what to delegate vs. do yourself |
| 5 | Output Evaluation | Critically reviewing agent-generated code |
| 6 | Feedback Loop Design | Tests, linters, CI as agent guardrails |
| 7 | Session Management | Maintaining state across sessions |
| 8 | Parallel Orchestration | Running multiple agent workflows |
| 9 | Recovery Patterns | Handling agent failures and dead ends |
| 10 | Architecture for Agents | Designing agent-friendly systems |

## 6 Learning Paths

Each path targets a specific engineering role with etudes calibrated to their
experience level, daily responsibilities, and unique challenges.

| Path | Role | Etudes | Primary Focus |
|------|------|--------|--------------|
| [ASE](paths/associate-software-engineer.md) | Associate Software Engineer | 16 | Foundations: specification, evaluation, testing |
| [STE](paths/staff-software-engineer.md) | Staff Software Engineer | 16 | Advanced: context engineering, parallelism, architecture |
| [PSE](paths/principal-software-engineer.md) | Principal Software Engineer | 12 | Leadership: standards, ROI, org-wide practices |
| [PSA](paths/principal-software-architect.md) | Principal Software Architect | 12 | Architecture: agent-friendly system design |
| [DOE](paths/staff-devops-engineer.md) | Staff DevOps / CI/CD Engineer | 12 | Infrastructure: pipelines, IaC, security scanning |
| [DME](paths/staff-data-management-engineer.md) | Staff Data Management Engineer | 12 | Data: schemas, migrations, pipelines, quality |

### Where to Start

- **New to agents?** Start with [ASE-000](cotudes/ASE-000-setup/README.md) (Environment Setup)
- **Experienced engineer, new to agents?** Start with [STE-001](paths/staff-software-engineer.md) (The CLAUDE.md)
- **Leading teams?** Start with [PSE-001](paths/principal-software-engineer.md) (The Architecture Review)
- **Infrastructure focus?** Start with [DOE-001](paths/staff-devops-engineer.md) (The CI Feedback Loop)
- **Data focus?** Start with [DME-001](paths/staff-data-management-engineer.md) (The Schema Design)

## Repository Structure

```
cotudes/
├── .claude/
│   ├── agents/                  # Agent definitions for etude authoring
│   │   ├── agent-expert.md      # AI agent interaction specialist
│   │   ├── engineering-practice-expert.md  # Engineering practices specialist
│   │   ├── curriculum-designer.md         # Curriculum architect
│   │   └── etude-writer.md               # Technical writer
│   └── skills/                  # Matching skill definitions
│       ├── agent-expert/
│       ├── engineering-practice-expert/
│       ├── curriculum-designer/
│       └── etude-writer/
├── cotudes/                     # The etude exercises
│   └── ASE-000-setup/          # Example: Associate SE setup etude
├── paths/                       # Learning path documents
│   ├── associate-software-engineer.md
│   ├── staff-software-engineer.md
│   ├── principal-software-engineer.md
│   ├── principal-software-architect.md
│   ├── staff-devops-engineer.md
│   └── staff-data-management-engineer.md
├── dev/                         # Curriculum development documentation
│   ├── curriculum-map.md        # Overall curriculum plan and philosophy
│   ├── best-practices.md        # Design principles for etude authoring
│   ├── concept-coverage.md      # Competency coverage matrix
│   └── draft-prompts.md         # Multi-agent authoring pipeline
└── README.md
```

## The Authoring Pipeline

cotudes are authored using a multi-agent pipeline (similar to cpptudes):

1. **Curriculum Designer** produces the etude specification
2. **Agent Expert** validates the agent collaboration skill (Requirement A)
3. **Engineering Practice Expert** validates the engineering task (Requirement B)
4. **Etude Writer** synthesizes all inputs into the final etude
5. Both experts review the finished etude

See [dev/draft-prompts.md](dev/draft-prompts.md) for the full pipeline.

## Agent Agnostic

cotudes is designed to work with any AI coding agent. The principles transfer
across Claude Code, Codex, Jules, Antigravity, Cursor, and future tools.
Specific etudes may recommend a particular agent for practical execution, but
the axioms are tool-agnostic.

## Sources

This curriculum is informed by documented practitioner experience:

- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [GitHub: Spec-Driven Development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [METR: AI Impact on Experienced Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [GitHub: Lessons from 2,500+ AGENTS.md Files](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)
- [Armin Ronacher: Agentic Coding Recommendations](https://lucumr.pocoo.org/2025/6/12/agentic-coding/)
- [Addy Osmani: AI Coding Workflow](https://addyosmani.com/blog/ai-coding-workflow/)
- [arXiv 2512.14012: Professional Developers Don't Vibe, They Control](https://arxiv.org/abs/2512.14012)
