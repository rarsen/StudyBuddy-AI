# 5. Future work and deferred ideas

Everything in this file was analysed during the 2026-11-02 planning discussion and deliberately **left out of the MVP** ([reasons](02-discussion-summary-and-decisions.md#24-first-pass-recommendations-superseded-by-this-scope)).

It is kept here so nothing is lost. Each section can become a later version of the app or a "future work" section in the thesis.

## 1. Cross-platform desktop (Windows and Linux)

**Architecture to use if Windows and Linux come back into scope**

```
   Shared React SPA (frontend/) + platform adapter (web | desktop)
                  │                                          │
  WEB             ▼  DESKTOP                                 ▼
 ┌──────────────────────────────────┐   ┌──────────────────────────────────────────┐
 │ FastAPI core   APP_PROFILE=web   │   │ Tauri 2 shell (Rust supervisor)          │
 │  LLM    : OpenAI / hosted model  │   │  free ports, tokens, health, restart,    │
 │  Vector : pgvector               │   │  Job Object, model manager, HW probe     │
 │  Keyword: Postgres FTS           │   │   ├─ FastAPI core  APP_PROFILE=desktop   │
 │  Auth   : JWT   Jobs: worker     │   │   │   SQLite (WAL) + sqlite-vec + FTS5   │
 └────────────────┬─────────────────┘   │   ├─ llama-server: chat                  │
                  ▼                     │   └─ llama-server: embeddings / rerank   │
        PostgreSQL + pgvector           │  all on 127.0.0.1, random ports, keys    │
                                        └──────────────────────────────────────────┘
```

The core works through a set of interfaces: `LLMProvider`, `EmbeddingProvider`, `VectorStore`, `KeywordIndex`, `JobQueue` and `AuthStrategy`. An `APP_PROFILE` setting picks which implementation of each is used.

The supervisor process cleans up its child processes when the app exits:
- Windows: a Job Object with `KILL_ON_JOB_CLOSE`.
- macOS: a watchdog that notices when the parent dies.
- Linux: `PR_SET_PDEATHSIG`.

**Inference runtime options**

| Option | Assessment |
|---|---|
| llama.cpp `llama-server` | **Recommended.** OpenAI-compatible chat, embeddings and rerank endpoints. It can force output to match a JSON schema or grammar, calls tools (`--jinja`), and caches prompts, including saving and restoring sessions. Runs on CPU, Vulkan, CUDA, Metal and ROCm. Recent builds have a router mode that serves several models from one process |
| Linking llama.cpp into the app (llama-cpp-python, node-llama-cpp, `llama-cpp-2`) | You need a separate native build for every OS and GPU combination, and a crash in the model takes the whole app down |
| Bundling Ollama | Large. Runs its own background service on port 11434, which clashes with users who already have Ollama installed. Gives less control. A local server also exposes attack surface (e.g. CVE-2024-37032, "Probllama"). Better to support it as an optional runtime the user brings themselves |
| MLX / ONNX Runtime GenAI | Faster paths on Apple Silicon and on Windows NPUs |
| WebGPU/WASM inside the page (WebLLM, wllama) | A no-install tier, but limited by browser memory |

**Tauri 2 vs Electron for the shell**

- **Installer size:** Tauri is about 3–10 MB because it uses the operating system's built-in web view. Electron is about 80–150 MB.
- **Memory:** on Windows, the built-in web view (WebView2) is itself Chromium, so the memory gap is smaller than the installer gap. Measure it.
- **Child processes:** Tauri can launch them with scoped permissions ("sidecars").
- **Testing cost:** with Tauri, you have to test on three web-view engines (WebView2, WKWebView, WebKitGTK).
- **Alternative:** Electron with node-llama-cpp is a reasonable choice too.

**Platform differences**

| | Windows | macOS | Linux |
|---|---|---|---|
| GPU | Vulkan by default; CUDA as an optional add-on (the cuBLAS libraries alone are hundreds of MB) | Metal | Vulkan, CUDA, ROCm |
| Web view | WebView2 | WKWebView | WebKitGTK |
| Signing | Authenticode; PyInstaller apps often trigger false antivirus warnings | Developer ID + notarization; every nested binary must be signed | AppImage / deb |
| Must test | Windows usernames with Cyrillic characters in paths; CPUs without AVX2; ARM64 | Gatekeeper quarantine | glibc and WebKitGTK versions |

**Packaging notes**
- Tauri's `externalBin` expects a single executable file. `llama-server` (which ships with DLLs) and a PyInstaller "onedir" build are folders, so ship them under `bundle.resources` instead.
- Build llama.cpp with `GGML_BACKEND_DL` and `GGML_CPU_ALL_VARIANTS`. That way it detects the CPU features and the GPU backend at runtime instead of at compile time.

**Securing the local servers.** Any website the user visits can try to send requests to localhost.
- Listen only on 127.0.0.1, on random ports.
- Require a random 256-bit token, generated at each launch.
- Accept only known `Host` headers, to block DNS-rebinding attacks.
- Allow only the exact CORS origins: `http://tauri.localhost` on Windows, `tauri://localhost` on macOS and Linux.
- Set the content security policy to `connect-src http://127.0.0.1:*`.
- Start `llama-server` with `--api-key`.
- Load only GGUF model files whose hash has been checked.

**CI and releases**
- A GitHub Actions build for each OS, using `tauri-action`.
- A signed auto-updater.
- An offline installer that bundles everything.
- A software bill of materials (SBOM) and a license inventory.

## 2. Low-end hardware analysis (laptops without a usable GPU)

**Speed limits**
- **Generation is limited by memory bandwidth.** Dual-channel DDR4-3200 delivers about 35 GB/s in practice. That gives roughly 7 tokens/s for an 8B 4-bit model and 14 tokens/s for a 4B one.
- **Single-channel RAM halves this.** Cheap laptops often have single-channel RAM, so record the channel configuration of every test machine.
- **A dedicated GPU is far faster.** An RTX 4060 (272 GB/s) reaches about 40–55 tokens/s for an 8B 4-bit model.
- **Prompt processing is slow on CPU.** On a laptop CPU it runs at tens to a few hundred tokens/s, so a RAG prompt of 2–6K tokens takes tens of seconds unless the prompt cache can be reused.

**Hardware tiers**

| Tier | Hardware | Model size (4-bit) | Context |
|---|---|---|---|
| T0 | 8 GB RAM, CPU or integrated GPU | 2–4B | 4–8K, KV cache at 8-bit |
| T1 | 16 GB RAM, integrated GPU (Vulkan) | 4–9B | 8–16K |
| T2 | Dedicated GPU, 8–12 GB VRAM | 8–9B, fully on the GPU | 16–32K |
| T3 | Apple Silicon, 16 GB+ | 8–9B; MoE models at 32 GB+ | 16–32K |
| T4 | 32 GB+ RAM | MoE models with ~3–4B active parameters (Gemma 4 26B-A4B, gpt-oss-20b) | 16–32K |

**Reading-speed target**
- People read silently at about 238 words per minute (Brysbaert, 2019).
- English averages about 1.3 tokens per word, so about 5–6 tokens/s is enough to keep up.
- Report **effective words/s = tokens/s ÷ tokens per word**. Tokens per word is called tokenizer "fertility" (Petrov et al., 2023).

**Measuring memory**
- On Windows, model weights that are memory-mapped count toward the working set but not toward private bytes.
- Report both numbers, for each process.

## 3. Original innovation ideas (not in MVP)

### U1: Hardware-adaptive inference planner
- **Detect** the hardware: RAM, VRAM, available GPU backends, CPU features and battery state, plus a 2-second memory-bandwidth test.
- **Predict** memory use and tokens/s from the model file's GGUF metadata.
- **Choose** the settings that meet the targets: model, quantization, context length, GPU layers, KV cache type and flash attention.
- **Check** the choice with a 15-second calibration run, and re-plan when the laptop switches to battery, overheats or runs low on memory.
- **Supporting pieces:**
  - a scheduler that runs interactive requests before grading, and grading before background work;
  - a component that divides the context window between system prompt, sources, history and answer.
- **Research question:** how accurately does a bandwidth-based model predict performance, and does the planner beat fixed defaults such as Ollama's?
- **Metrics:** prediction error (MAPE), measured on devices that were not used for calibration, and how often speed targets are met.

### U2: Answer-verification layer
- **Check each cited claim.** Run a cheap similarity check first, then ask a judge model (with JSON-schema output) about doubtful claims. Show the result as ✓/⚠ badges in `Citations.jsx`.
- **Check math** with sympy, inside a sandbox, because `sympify` uses `eval`.
- **Say "I don't know"** when retrieval confidence is low, using a threshold tuned on data.
- **Metrics:**
  - citation precision and recall, using the ALCE method;
  - rate of unsupported claims;
  - accuracy at each abstention level;
  - added latency.

### U3 extensions: the full learning loop
- **Grade open-ended answers** against a rubric. The `rubric` column already exists.
- **Target weak concepts:** the tutor steers practice toward what the student gets wrong.
- **Make sync conflict-free.** Store FSRS state as an append-only log of reviews (event sourcing). Syncing web and desktop then becomes a simple merge of two logs that never conflicts (a G-Set CRDT).

### U4: Agentic study workspace
- **Works over a folder:** the assistant indexes a course folder, watches it for changes and re-indexes only what changed.
- **Permissioned tools:** `search_notes`, `read_page`, `verify_math`, `run_python` (sandboxed), `make_flashcards`, and export to Anki, Markdown or BibTeX.
- **User approval:** every action that changes something needs the user's approval.
- **Optional:** MCP support.
- **Research question:** how reliably do small models call tools?

### U5: Offline knowledge packs and sharing within a classroom
- **What a pack is:** a signed bundle of documents, a prebuilt search index tied to one embedding model, and a question bank.
- **Installing:** from USB or over the local network.
- **Business model:** the app is free; schools buy licenses and publishers sell packs.

### Variations
- A no-install web version that runs a 1–2B model in the browser with WebGPU.
- Take a photo of homework as input (Gemma 4's small models accept images and audio).
- Compare against Apple's built-in on-device model (the Foundation Models framework, Swift only).
- Compare MLX with llama.cpp on Apple Silicon.

## 4. Ukrainian language support

Dropped on 2026-11-02. The UI translation already exists in `frontend/src/i18n/translations.js`. Bringing back Ukrainian for the AI features would involve the following.

**Models**
- Use multilingual models.
- Consider a model fine-tuned for Ukrainian, such as MamayLM from INSAIT. Its ZNO scores come from its developers and have not been independently checked.

**Benchmarks**
- **ZNO-Eval** (arXiv 2501.06715). Questions from Ukraine's national exam: 120 Ukrainian language, 120 mathematics, 120 history and 162 geography.
  - Frontier models scored close to the maximum on history and geography.
  - They still fell short on Ukrainian language and math.
- **ZNO-Vision:** a version with images.
- **UNLP workshop benchmarks.**
- **Belebele:** the same reading-comprehension questions in English and Ukrainian.
- **Global-MMLU:** check that it has a Ukrainian split.

**Possible research contribution**
- A quick search found no independent evaluation of small *quantized* models on ZNO running on consumer hardware.
- Confirm that with a proper literature search. If the gap is real, it is enough for a workshop paper (UNLP).

**Tokenization**
- Ukrainian text splits into more tokens per word than English.
- That raises the speed needed to keep up with reading, and leaves less effective context.
- Measure it for each tokenizer.

**Search**
- Ukrainian words change form a lot.
- Compare SQLite FTS5's trigram index with indexing by dictionary form (lemmas), for example using pymorphy3's Ukrainian dictionaries.

**Embeddings**
- Multilingual embedding models, for example bge-m3, multilingual-e5, EmbeddingGemma or Qwen3-Embedding.
- Each needs its own prompt prefixes.

## 5. Advanced retrieval

- **Hybrid search:** combine vector search with keyword search (BM25, FTS5 or tsvector), merging the two rankings with reciprocal rank fusion (Cormack et al., 2009).
- **Reranking (optional):** run a second-pass reranker model over the top results (`llama-server --reranking`, endpoint `/v1/rerank`).
- **Embedding versioning:** an `embedding_spaces` table, an `embedding_space_id` column on chunks, and a re-index job. This becomes necessary if the embedding model ever changes.
- **Vector index:** move to sqlite-vec, or pgvector with an HNSW index, once a single user has more than about 100k chunks.
- **Retrieval metrics:** Recall@k, MRR and nDCG@10.

## 6. Performance features

- **Scheduler:** a priority queue where interactive requests can interrupt background jobs.
- **Token budget:** divide the context window using real token counts from `/tokenize`.
- **History compaction:** summarize or compact chat history in blocks. A sliding window changes the start of the prompt, which prevents prompt-cache reuse.
- **Session resume:** save and restore `llama-server`'s per-session state (`--slot-save-path`), so reopening a chat is instant.
- **Router mode:** recent `llama-server` builds can serve several models from one process and load them on demand. Check the flags for your version.

## 7. Product, regulatory, commercial

- **Optional cloud help:** with the user's consent, send hard questions to a cloud model, removing personal data first.
- **Sync** between the web account and the desktop app via the review log (see §3).
- **EU AI Act, Annex III(3):** AI that evaluates learning outcomes in educational institutions counts as high-risk.
  - A student studying alone is probably not covered.
  - A school using the app to grade students may be.
  - Check this before selling to schools.
- **GDPR:** data from minors needs extra care. This is one reason the MVP targets adults.
- **Commercial case:** running the model on the user's machine costs the developer nothing, so a free tier is sustainable, unlike apps that pay for a cloud API per request. Revenue could come from school licenses, content packs and optional paid cloud help.

## 8. Original 12-sprint roadmap (summary)

| Sprint | Focus |
|---|---|
| S0 | Safety net and baseline |
| S1 | Provider abstraction, async calls, streaming |
| S2 | Local RAG: embedding versioning, hybrid search, ingestion jobs |
| S3 | Portable storage: SQLite + sqlite-vec + FTS5, Alembic batch migrations |
| S4 | Tauri shell and process supervisor |
| S5 | Model manager, hardware detection, planner |
| S6 | Scheduler, context budget, prompt caching |
| S7 | Answer-verification layer |
| S8 | Learning loop |
| S9 | Agentic workspace or sync |
| S10 | Release engineering: per-OS builds, signing, auto-updater |
| S11 | Evaluation campaign |
| S12 | Hardening and defense |

## 9. Extended metrics list (for a larger evaluation)

**Performance**
- Time to first token, split into retrieval, waiting in the queue, prompt processing and the first token.
- Prompt-processing speed at different prompt lengths.
- Generation speed, and the 95th-percentile gap between tokens.
- Effective words per second.
- Cold start and model-swap time.
- Gain from prompt caching.
- Interactive latency while background jobs run.
- Error of the performance model on devices it was not calibrated on.

**Resources**
- Private bytes and working set, per process.
- VRAM.
- Joules per token and per answer.
- Thermal throttling: tokens/s at minute 30 divided by tokens/s at minute 1.
- Disk use.
- UI frame time while the model is generating.

**Quality**
- Multiple-choice accuracy, forcing the model to answer with one letter, on MMLU subsets, Belebele and ZNO-Eval.
- Math accuracy with and without checking by sympy.
- Effect of quantization: compare Q4_K_M, Q8_0 and BF16, including KL divergence (`llama-perplexity --kl-divergence`).
- Retrieval metrics.
- ALCE citation metrics.
- How the model behaves when it abstains.
- Teaching quality, rated with a rubric (e.g. does it give away answers).
- Tool-use accuracy.

**Experiment design**
- Three conditions:
  - L: local, quantized.
  - C-same: the same model weights in BF16 on a cloud GPU.
  - C-frontier: a frontier cloud model.
- What each comparison isolates:
  - L vs C-same isolates the effect of quantization and hardware.
  - C-same vs C-frontier isolates the effect of model capability.

**Statistics**
- Tests: McNemar and Wilcoxon, with Holm–Bonferroni correction and margins fixed in advance.
- Sample size (Connor, 1987):
  - Detecting a 5-percentage-point difference between paired results needs about 470 items, assuming about 15% of pairs disagree.
  - A 10-point difference needs about 150 items, assuming about 20% disagree.

**Security tests**
- DNS rebinding and CSRF attacks against the local servers.
- Path traversal when importing model files.
- How often hidden instructions inside uploaded documents (indirect prompt injection) succeed.
