# Etude Authoring Process

## Authoring Pipeline

Etudes are authored through a six-stage multi-agent pipeline. See
`dev/draft-prompts.md` for the detailed prompts for each stage.

| Stage | Agent | Output |
|-------|-------|--------|
| 1 | Curriculum Designer | Etude specification aligned to curriculum-map.md |
| 2 | Agent Expert | Agent collaboration skill analysis |
| 3 | Engineering Expert | Real engineering task design |
| 4 | Etude Writer | Full etude draft (README, starter, verify.sh, practice.json) |
| 5 | Requirement A Review | Agent skill validity check |
| 6 | Requirement B Review | Real engineering validity check |

Stages 5 and 6 gate publication. An etude that fails either review returns to
Stage 4 for revision.

---

## Implementation Phases

This section tracks how the repository evolves from the baseline curriculum to
the full two-dimensional structure described in `dev/curriculum-map.md`.

### Phase 1: Add the shared foundation model to the docs

**Status: Complete**

Updated:
- `README.md`
- `dev/curriculum-map.md` (integrated Common Foundation, 12 competencies,
  capstone model, shared systems design)
- `dev/proposed-extended-curriculum.md` retired; content merged into
  `dev/curriculum-map.md`

Goal: make the common foundation explicit without rewriting every path
immediately.

### Phase 2: Author the Common Foundation etudes

**Status: Complete**

Authored:
- `cotudes/FND-001-the-failure-map/` -- Competency 11: LLM Failure Mode
  Reasoning (context degradation, hallucination under ambiguity, tool error
  propagation)
- `cotudes/FND-002-the-workflow-contract/` -- Competency 12: Workflow
  Architecture (checkpoints, scope declaration, human approval gates, restart
  discipline)

Both etudes satisfy the dual requirement framework (real engineering task +
named agent collaboration skill) and follow the trap-then-correct model.

The AGT layer (originally proposed as AGT-001 through AGT-006) was not
authored. Its concepts are addressed by the cross-path sharing strategy. See
`dev/curriculum-map.md` "Common Foundation → Retired: Agent Systems Foundation"
for the full disposition mapping.

### Phase 3: Implement cross-path sharing clusters

**Status: In progress**

Apply Tier A clusters during Fluency-tier authoring:

- **CI Feedback** (Cluster 1): DOE-003 and STE-009 built on the DOE-001
  scenario
- **Context Calibration** (Cluster 3): ASE-005 and STE-004 as one two-phase
  scenario
- **Agent-Friendly Architecture** (Cluster 2): STE-006 and PSA-003 built on
  the PSA-001 codebase

Apply Tier B clusters as Application-tier authoring begins:

- **Delegation Judgment** (Cluster 4): STE-003 authored first (produces the
  delegation matrix artifact), then ASE-006 references it
- **Migration** (Cluster 6): PSA-010 plans the migration, STE-011 executes it
- **Recovery Patterns** (Cluster 5): shared heuristic framework doc used by
  both ASE-007 and STE-008

See `dev/curriculum-map.md` "Cross-Path Lesson Sharing" for the full cluster
specifications.

### Phase 4: Standardize capstones

**Status: Not started**

Ensure every path has:
- One clear capstone etude (all six paths have a capstone slot in the sequence)
- The four-output evidence model: working artifact, interaction log, workflow
  explanation, review packet
- Comparable evaluation criteria across paths

See `dev/curriculum-map.md` "Assessment Model → Capstones" for the full
evidence model.
