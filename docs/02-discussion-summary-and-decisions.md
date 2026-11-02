# 2. Discussion summary and decisions

Discussion date: **2026-11-02**. Every decision below is **Accepted** unless marked otherwise.

## 2.1 How the discussion went

**First pass: the broad plan.** We assessed turning the web app into a cross-platform web + desktop ecosystem with a built-in offline LLM.

- **Architecture:** a Tauri 2 desktop shell running a Python backend and `llama-server` as helper processes, on Windows, macOS and Linux.
- **Proposed features:** five, including a planner that adapts the model to the hardware, a layer that verifies answers, a learning loop, an agent workspace and offline knowledge packs.
- **Schedule:** a 12-sprint roadmap and a full thesis structure.
- **Evaluation:** in English and Ukrainian, using the Ukrainian ZNO exam.
- **Verdict: feasible.** Running the model is not the risk. The risks are:
  - answer quality from small models;
  - slow prompt processing on laptops without a usable GPU;
  - packaging the app for three operating systems.

**Second pass: the easiest path that still works.** The scope was cut to the smallest version that is still useful and can still be evaluated:

- web + macOS only;
- exam prep from the student's own lecture PDFs;
- English only;
- Python as the only language for the desktop shell.

The broad plan moved to [future work](05-future-work.md), so nothing is lost.

## 2.2 Conclusions

- **The project is feasible, and about 70% of the MVP already exists:** RAG with citations, chat, document upload, and the database tables for flashcards and quizzes.
- **Build around what small models do well:** writing questions from a passage you give them. Avoid what they do badly: recalling facts from memory, and multi-step agent work.
- **Platforms: web (cloud LLM) + macOS (local LLM).** Apple Silicon is the easiest first desktop target for local models: the GPU shares memory with the CPU, there is one GPU interface (Metal), and one package format.
- **The web edition doubles as the cloud baseline** for the thesis. Same code, different model provider, so the comparison comes for free.
- **Desktop shell: pywebview + PyInstaller** (pure Python) instead of Tauri (Rust). With only one platform, Tauri's cross-platform advantages no longer apply.
- **Simpler infrastructure:**
  - SQLite on the Mac and Postgres on the web, using the same ORM models.
  - Vector search with plain numpy instead of the pgvector extension.
  - Chunking by character count instead of with tiktoken.
- **Generation runs in the background.** A 10-question quiz takes about a minute on a base Mac, so cards and quizzes are generated right after upload.
- **Delete `/debug/config` immediately**, whatever else happens.

## 2.3 Decision log

### D-01: Platforms: web + macOS only
- **Decision:** a web edition using a cloud LLM, and a macOS app (Apple Silicon) using a local LLM. Windows and Linux are postponed.
- **Alternatives considered:**
  - a cross-platform desktop app with Tauri 2 (the first-pass recommendation);
  - Windows first.
- **Rationale:**
  - On Apple Silicon, the GPU shares the system's memory, so an 8B model runs about as fast as people read on a 16 GB MacBook Air.
  - There is one GPU backend, one built-in browser engine and one package format.
  - That removes a whole list of Windows problems: choosing between CUDA and Vulkan, antivirus false alarms, SmartScreen warnings, and cleaning up child processes (Job Objects).
- **Consequences:**
  - Windows students are not served yet. llama.cpp and Python both work on Windows, so a port is future work, not a redesign.
  - You need an Apple Silicon Mac (M1 or newer) to build, benchmark and demo. You can develop on Windows, but the Mac app must be built on a Mac.

### D-02: Product focus: exam prep from the student's own lecture PDFs
- **Decision:** the core loop is: upload, generate quizzes and flashcards with page citations, review with spaced repetition (FSRS), and ask questions in a chat that cites its sources.
- **Alternatives considered:**
  - a general tutor for everyone from middle school to university;
  - a research assistant.
- **Rationale:**
  - Backed by learning research: practice tests and spaced reviews work.
  - Matches what small models are good at.
  - Reuses existing code.
  - Easy to evaluate, because generated questions can be rated.

### D-03: Users: university students
- **Rationale:** they have the input the app needs (lecture PDFs), and they are reachable for a user study. Minors bring consent and safety requirements. Researchers need a different product.

### D-04: Language: English only for AI features and evaluation
- **Decision:** drop Ukrainian AI support and Ukrainian evaluation for now. The existing interface translation stays in the code; keeping it costs nothing.
- **Rationale:**
  - Removes the hardest quality problem for small models.
  - Allows English-only embedding models, which are smaller and stronger.
- **Future:** [future work §4](05-future-work.md#4-ukrainian-language-support).

### D-05: Model runtime: llama.cpp `llama-server`
- **Decision:** bundle a self-contained `llama-server` build that uses the Mac's GPU (Metal).
  - One instance serves chat.
  - A second instance, started with `--embedding`, serves embeddings.
- **Alternatives considered:**
  - Bundling Ollama: large, runs its own background service on port 11434, gives less control. It can still be supported later for users who already have it installed.
  - MLX inside the Python process: Apple-only, uses a different model format, and is risky to package. It remains a candidate for a comparison experiment.
  - Loading llama.cpp as a library inside the backend: harder to build, and a crash in the model takes the whole backend down.
- **Rationale:**
  - It speaks the OpenAI API format the backend already uses.
  - It can force output to match a JSON schema.
  - It caches prompts automatically.
  - It builds to a single static file.

### D-06: Desktop shell: pywebview + PyInstaller
- **Decision:** one Python process does it all:
  - a native window via pywebview;
  - FastAPI in a background thread, serving both the API and the React build from the same address;
  - `llama-server` started as a child process.
- **Packaging:** PyInstaller packages everything as `MindSpark.app`.
- **Alternatives considered:**
  - Tauri 2: smaller shell and better cross-platform story, but requires Rust and adds a process.
  - Electron: large and memory-hungry.
  - A launcher that just opens the browser: simplest, but doesn't feel like an app.
- **Rationale:**
  - Only one language to work in.
  - Starting child processes with Python's `subprocess` is familiar.
  - No CORS problems, because the UI and API share an address.
  - Revisit Tauri if Windows/Linux support comes back.

### D-07: Database: SQLite on the Mac, PostgreSQL on the web
- **Decision:** the same SQLAlchemy models with a different `DATABASE_URL`. The Postgres-only startup SQL runs only when the database is Postgres.
- **Rationale:** no database server is needed on the desktop, and the web deployment stays as it is.

### D-08: Vector search: plain numpy; drop pgvector
- **Decision:** store embeddings as raw bytes (`LargeBinary` holding float32 values). Find the closest chunks with cosine similarity in numpy, cached in memory per user.
- **Rationale:**
  - The current pgvector column has **no search index**, so Postgres already compares the query with every chunk. numpy gives identical results.
  - No database extension is needed, and SQLite and Postgres share one code path.
  - Size and speed: 10k chunks × 768 numbers is about 30 MB and takes under 10 ms per query.
- **Revisit if** one user ever has more than ~100k chunks. Then switch to sqlite-vec, or pgvector with an HNSW index.

### D-09: Chunking: by character count; drop tiktoken
- **Decision:** split text at sentence boundaries into chunks of about 1,600 characters (≈ 400 English tokens), with some overlap.
- **Rationale:**
  - tiktoken downloads its tokenizer file on first use, which fails offline.
  - Its tokenizer doesn't match local models anyway.
  - For English, about 4 characters per token is a good estimate.

### D-10: Structured output: force JSON that matches a schema
- **Decision:** generate quizzes and flashcards with `response_format` set to a JSON schema. OpenAI and `llama-server` both support this, so it is one code path.
- **Rationale:** with the output constrained, even a small model cannot produce invalid JSON.
- **Compatibility rule:** keep schemas valid for OpenAI's strict mode. Every field is required, and `additionalProperties: false` is set everywhere.

### D-11: Generation runs as background jobs
- **Decision:** generate flashcards and quizzes right after upload, as a job stored in the database with status and progress. Chat stays interactive, with streaming.
- **Rationale:** a 10-question quiz takes about a minute on a base M-series Mac. Making the user wait would feel broken.

### D-12: Models (freeze and verify before the evaluation)
- **Decision:**
  - **Qwen3.5-4B** (4-bit) as the default chat and generation model on 8 GB Macs.
  - **Qwen3.5-9B** (4-bit) on Macs with 16 GB or more.
  - **Gemma 4 E4B** as a second model to compare against.
  - **nomic-embed-text-v1.5** for embeddings. It requires the prefixes `search_query: ` and `search_document: `.
- **Notes:**
  - Turn off any "thinking" mode for generation tasks; it makes them several times slower.
  - Choose the model by RAM: about 4B below 16 GB, 8–9B from 16 GB up. This replaces the hardware-adaptive planner from the first pass.
  - Check sizes and licenses on the model cards when freezing the choice. Both model families were released under Apache 2.0.

### D-13: Desktop login: one local user
- **Decision:** the desktop app has no login screen. The backend creates a local user automatically and gives the UI a session.
- **Rationale:** the macOS user account already protects the data. The web edition keeps its JWT login.

### D-14: Distribution: unsigned app for the thesis
- **Decision:** distribute an unsigned app (ad-hoc signed only). Testers allow it once in System Settings → Privacy & Security → Open Anyway.
- **Optional:** joining the Apple Developer Program ($99/year) allows notarization, which removes that step.
- **Demo:** use an offline DMG installer that already includes the default model.

### D-15: The web edition is the cloud baseline for the evaluation
- **Rationale:** the features and code are identical; only the model provider differs. That isolates the effect of running locally.

### D-16: Immediate security fix: delete `/debug/config`
- **Rationale:** it exposes the first 15 characters of `SECRET_KEY` in every environment (`backend/app/main.py:100-112`).

### D-17: Bundle the fonts with the app
- **Rationale:**
  - The UI renders correctly offline.
  - It avoids the GDPR risk of loading Google Fonts from Google's servers (LG München I, 20.01.2022, 3 O 17493/20).

### D-18: Evaluation approach
- **Decision:** compare the local 4B model, the local 8–9B model and the cloud model on generated practice items.
  - Use human ratings plus automatic checks.
  - Measure performance on 2–3 Macs.
  - Details are in the [thesis plan](04-thesis-plan.md).

## 2.4 First-pass recommendations superseded by this scope

| First-pass recommendation | Now | Where it lives |
|---|---|---|
| Tauri 2 shell with a Rust process supervisor | pywebview + PyInstaller | [Future work §1](05-future-work.md#1-cross-platform-desktop-windows-and-linux) |
| Windows/Linux, CUDA/Vulkan, signing for 3 OSes | macOS only | Future work §1 |
| Planner that adapts model settings to the hardware | Two presets chosen by RAM | [Future work §3](05-future-work.md#3-original-innovation-ideas-not-in-mvp) |
| Answer-verification layer (per-claim checks, sympy math checks, calibrated "I don't know") | Citations + "not in your notes" only | Future work §3 |
| Agent workspace, knowledge packs, sync | Cut | Future work §3 |
| English + Ukrainian evaluation (ZNO-Eval) | English only | [Future work §4](05-future-work.md#4-ukrainian-language-support) |
| sqlite-vec / pgvector backends, hybrid keyword + vector search, reranking | Plain numpy search | [Future work §5](05-future-work.md#5-advanced-retrieval) |
| 12-sprint roadmap | 12-week plan with 5 milestones | [Future work §8](05-future-work.md#8-original-12-sprint-roadmap-summary) |
