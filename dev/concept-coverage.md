# Concept Coverage Matrix

## The 10 Core Competencies Across All Paths

This document tracks which competencies are covered by which etudes, ensuring
adequate coverage and identifying gaps.

### Coverage Legend
- **P** = Primary competency (the main focus of the etude)
- **S** = Secondary competency (exercised but not the focus)
- **-** = Not covered

## Associate Software Engineer (ASE)

| Etude | Spec Writing | Context Eng | Task Decomp | Delegation | Output Eval | Feedback Loop | Session Mgmt | Parallel | Recovery | Architecture |
|-------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ASE-001 | P | - | - | - | - | - | - | - | - | - |
| ASE-002 | - | - | - | - | P | - | - | - | - | - |
| ASE-003 | - | - | - | - | - | P | - | - | - | - |
| ASE-004 | - | - | P | - | - | S | - | - | - | - |
| ASE-005 | - | P | - | - | - | - | - | - | - | - |
| ASE-006 | - | - | - | P | S | - | - | - | - | - |
| ASE-007 | - | - | - | - | S | - | - | - | P | - |
| ASE-008 | P | - | - | - | - | - | - | - | - | - |
| ASE-009 | - | - | - | - | - | P | - | - | - | - |
| ASE-010 | - | - | - | - | P | - | - | - | - | - |
| ASE-011 | - | S | - | - | - | - | P | - | - | - |
| ASE-012 | - | - | P | - | S | - | - | - | - | - |
| ASE-013 | - | - | - | - | P | S | - | - | - | - |
| ASE-014 | - | - | P | - | S | - | - | - | - | - |
| ASE-015 | S | S | S | S | S | S | S | - | S | - |
| **Total** | **2P** | **1P** | **3P** | **1P** | **3P** | **2P** | **1P** | **0** | **1P** | **0** |

**Gap Analysis**: Parallel Orchestration and Architecture for Agents are not
covered. This is intentional -- these are advanced competencies not appropriate
for the Associate level.

## Staff Software Engineer (STE)

| Etude | Spec Writing | Context Eng | Task Decomp | Delegation | Output Eval | Feedback Loop | Session Mgmt | Parallel | Recovery | Architecture |
|-------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| STE-001 | - | P | - | - | - | - | S | - | - | - |
| STE-002 | P | - | - | - | - | - | - | - | - | - |
| STE-003 | - | - | - | P | - | - | - | - | - | - |
| STE-004 | - | P | - | - | - | - | - | - | - | - |
| STE-005 | - | - | - | - | - | - | - | P | - | - |
| STE-006 | - | - | - | - | - | - | - | - | - | P |
| STE-007 | - | - | - | - | P | - | - | - | - | - |
| STE-008 | - | - | - | - | - | - | - | - | P | - |
| STE-009 | - | - | - | - | - | P | - | - | - | - |
| STE-010 | - | S | - | - | - | - | P | - | - | - |
| STE-011 | - | - | P | - | - | - | - | - | - | - |
| STE-012 | - | P | - | - | - | - | - | - | - | - |
| STE-013 | - | - | - | - | P | - | - | - | - | - |
| STE-014 | - | - | - | P | - | - | - | - | - | - |
| STE-015 | S | S | S | S | S | S | S | S | S | S |
| **Total** | **1P** | **3P** | **1P** | **2P** | **2P** | **1P** | **1P** | **1P** | **1P** | **1P** |

**Gap Analysis**: Full coverage across all 10 competencies.

## Cross-Path Coverage Summary

| Competency | ASE | STE | PSE | PSA | DOE | DME |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Specification Writing | 2P | 1P | - | 1P | - | 2P |
| Context Engineering | 1P | 3P | 1P | 1P | 1P | 1P |
| Task Decomposition | 3P | 1P | - | 1P | 1P | - |
| Delegation Judgment | 1P | 2P | 2P | 1P | 1P | - |
| Output Evaluation | 3P | 2P | 3P | 1P | 2P | 3P |
| Feedback Loop Design | 2P | 1P | - | 1P | 3P | 1P |
| Session Management | 1P | 1P | - | - | - | - |
| Parallel Orchestration | - | 1P | - | - | - | - |
| Recovery Patterns | 1P | 1P | - | - | 1P | 1P |
| Architecture for Agents | - | 1P | 1P | 3P | 1P | 1P |

**Observations**:
- Output Evaluation is heavily covered across all paths -- this is appropriate
  as it's the most universally critical skill
- Parallel Orchestration is only explicitly covered in the Staff SE path -- this
  is intentional (it's an advanced pattern)
- Session Management is only covered in ASE and STE -- consider adding coverage
  in longer-running paths (Architect, DevOps)
- Architecture for Agents scales from absent (ASE) to dominant (PSA) -- this
  correctly reflects role progression

## Competency Dependency Graph

```
Specification Writing ─────────────────────────────────── Foundation
        │
Context Engineering ──────── Session Management            │
        │                          │                       │
Task Decomposition                 │                       │
        │                          │                       │
Delegation Judgment ──────── Parallel Orchestration         │
        │                                                  │
Output Evaluation ────────── Recovery Patterns              │
        │                                                  │
Feedback Loop Design                                       │
        │                                                  │
Architecture for Agents ──────────────────────────────── Advanced
```

Specification Writing and Output Evaluation are foundational -- every other
competency builds on the ability to specify intent and evaluate results.
