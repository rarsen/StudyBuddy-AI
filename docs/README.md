# MindSpark: project documentation

This is the living documentation for the MindSpark graduation thesis. It was created on 2026-11-02 from the planning discussion.

Update it whenever a decision changes or a milestone is finished, and add a line to the [progress log](#progress-log).

## At a glance

| | |
|---|---|
| **What** | An AI study assistant that turns a student's own lecture PDFs into practice questions and flashcards. Every item cites its source page and is scheduled with spaced repetition. A chat answers follow-up questions, also with citations |
| **Platforms** | **Web**, using a cloud LLM (the existing deployment), plus a **macOS app** that runs a local LLM fully offline |
| **Users** | University students preparing for exams |
| **Language** | English. Ukrainian AI support is dropped for now; the existing UI translation stays in the code |
| **Thesis question** | Can small LLMs running on a student's laptop generate practice material close in quality to a cloud model, fast enough, for free, with no data leaving the device? |
| **Codebase baseline** | Commit `0571b32` (2026-06-10). File and line references in these docs point to that commit |

## Documents (read in order)

| # | Document | Contents |
|---|---|---|
| 1 | [Project overview](01-project-overview.md) | Problem, product, users, competition, current codebase and audit findings |
| 2 | [Discussion summary & decisions](02-discussion-summary-and-decisions.md) | What was concluded, and every decision with the alternatives and the reasoning |
| 3 | [Implementation plan](03-implementation-plan.md) | Target architecture, local setup, ordered code changes, milestone checklists, technical notes |
| 4 | [Thesis plan](04-thesis-plan.md) | Title, research questions, evaluation design, table of contents, metrics, likely committee questions |
| 5 | [Future work](05-future-work.md) | Everything deliberately postponed (Windows/Linux, Ukrainian, hardware planner, agents), with the original wide-scope analysis |
| 6 | [References](06-references.md) | Papers, tools, models, datasets |

## Status tracker

| Milestone | Weeks | Status |
|---|---|---|
| M0: Proposal approved by supervisor | 0 | Not started |
| M1: Local brain. The web app runs on a local model on the Mac, with streaming, local embeddings and SQLite | 1–2 | Not started |
| M2: Practice. Quizzes, flashcards and spaced-repetition review | 3–4 | Not started |
| M3: `MindSpark.app` works with Wi-Fi off | 5–6 | Not started |
| M4: Evaluation complete | 7–8 | Not started |
| M5: Thesis written; defense ready | 9–12 | Not started |

Task-level checklists for each milestone are in the [implementation plan](03-implementation-plan.md#36-milestones-and-task-checklists).

## Open items

- [ ] Delete the `/debug/config` endpoint. It currently exposes part of `SECRET_KEY`, so do this before anything else
- [ ] Confirm the thesis deadline, and shorten the 12-week schedule if needed
- [ ] Confirm which Mac you will develop and demo on (chip + RAM). This decides the default model
- [ ] Get the supervisor to approve the scope: English only, web + macOS, exam prep from lecture PDFs

## Progress log

| Date | Entry |
|---|---|
| 2026-11-02 | Planning discussion. A first, broad plan (cross-platform desktop with Tauri, a hardware-adaptive planner, Ukrainian/ZNO evaluation) was narrowed to the easiest version that still works: web + macOS, exam prep from lecture PDFs, English only. These docs were created. |
