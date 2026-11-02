# 3. Implementation plan

## 3.1 Target architecture

### macOS app

```
MindSpark.app  (PyInstaller --windowed)
├─ Python process
│   ├─ pywebview window ──► http://127.0.0.1:<port>/   (React build, same origin → no CORS)
│   └─ FastAPI (uvicorn thread): /api/*, SQLite, numpy vector search, job worker
├─ llama-server              (chat/generation model, Metal)   127.0.0.1:<port2>
└─ llama-server --embedding  (embedding model)                127.0.0.1:<port3>

Data dir: ~/Library/Application Support/MindSpark/  (SQLite DB, uploads, models/, logs/)
```

### Web edition (same deployment as today)

```
React SPA (Render static) ──► FastAPI (Render) ──► OpenAI API
                                             └──► PostgreSQL
```

Both editions run the same backend code. Settings decide which model provider, database and mode each one uses.

## 3.2 Components

| Component | What it does | Milestone |
|---|---|---|
| `LLMProvider` (one OpenAI-compatible client with a configurable `base_url`) | Streams chat replies, generates structured output, generates session titles | M1 |
| `EmbeddingProvider` | Embeds text in batches, adding each model's required query/document prefixes | M1 |
| Vector search (numpy) | Finds the user's most similar chunks by cosine similarity. Keeps vectors cached in memory and refreshes the cache after each upload | M1 |
| Ingestion job | Extracts, chunks, embeds and stores a document in the background, with status and progress (the `DocumentStatus` enum already exists) | M2 |
| Practice service | Generates quizzes and flashcards as schema-validated JSON, grades multiple-choice answers, schedules reviews with the `fsrs` package | M2 |
| Desktop launcher | Picks free ports, starts both llama-servers, waits until their `/health` endpoint responds, runs uvicorn in a thread, opens the pywebview window, downloads the model on first run, shuts everything down cleanly | M3 |

## 3.3 New configuration

| Setting | Web | macOS | Notes |
|---|---|---|---|
| `APP_MODE` | `web` | `desktop` | Desktop mode means one local user, serving the React build from FastAPI, and listening only on 127.0.0.1 |
| `LLM_PROVIDER` | `openai` | `local` (or `mock`) | Replaces the current guess at mock mode based on the API key value |
| `LLM_BASE_URL` | unset | `http://127.0.0.1:<port2>/v1` | |
| `LLM_MODEL` | the current OpenAI model | the local model's id | Also used for session titles, which fixes the hard-coded model name |
| `LLM_API_KEY` | OpenAI key | random value per launch | Pass the same value to `llama-server --api-key` |
| `EMBED_BASE_URL` / `EMBED_MODEL` / `EMBED_DIM` | OpenAI defaults | `http://127.0.0.1:<port3>/v1`, nomic-embed-text-v1.5, 768 | |
| `DATABASE_URL` | Postgres URL | `sqlite:///…/mindspark.db` | |
| `SECRET_KEY` | secret from the environment | generated on first install, stored in the data dir | |

## 3.4 Local development setup (Mac)

```bash
brew install llama.cpp
# chat/generation model (pick from D-12; -hf downloads from Hugging Face and caches it)
llama-server -hf <qwen3.5-4b-gguf-repo> --port 8081 --api-key dev-key
# embedding model on a second instance
llama-server -hf nomic-ai/nomic-embed-text-v1.5-GGUF --embedding --port 8082 --api-key dev-key
# backend pointed at the local servers
LLM_PROVIDER=local LLM_BASE_URL=http://127.0.0.1:8081/v1 LLM_API_KEY=dev-key \
EMBED_BASE_URL=http://127.0.0.1:8082/v1 DATABASE_URL=sqlite:///./mindspark.db \
uvicorn app.main:app --reload --port 8000
```

- Check the flag names with `llama-server --help` for your installed version.
- Backend work can continue on Windows: llama.cpp runs there too, with CPU or Vulkan builds.

## 3.5 Code changes (in order)

| # | Change | Files | Milestone |
|---|---|---|---|
| 1 | Delete `/debug/config` | `backend/app/main.py:100-112` | M0 |
| 2 | Add the new settings from §3.3. Make `OPENAI_API_KEY` optional. Choose the provider explicitly with `LLM_PROVIDER` | `backend/app/core/config.py` | M1 |
| 3 | Switch to `AsyncOpenAI(base_url, api_key)` with streaming. Read the title model from settings. Keep a `MockProvider` for CI | `backend/app/services/ai_service.py:99-263` | M1 |
| 4 | Save the user's message **before** calling the model. Save the assistant's reply in its own short transaction | `backend/app/services/chat_service.py:160-246` | M1 |
| 5 | Add a streaming endpoint `POST /api/chat/message/stream` using server-sent events: `meta`, then `delta` chunks, then `done` (with usage and timings). Stop the model call if the client disconnects | `backend/app/api/v1/endpoints/chat.py` | M1 |
| 6 | In the frontend, read the stream with `fetch` and add a Stop button (`AbortController`). `EventSource` can't be used because it can't send a POST request with headers | `frontend/src/pages/Chat.jsx:92-128`, `frontend/src/services/chat.js` | M1 |
| 7 | Reorder the prompt so llama.cpp can reuse its cache: fixed system prompt first, then history, then sources and question in the **last user message**. Cut the number of sources to 3 | `ai_service.py:118-129, 183-236` | M1 |
| 8 | Produce embeddings through the provider, with each model's required prefixes. Store vectors as `LargeBinary` | `backend/app/services/embedding_service.py`, `backend/app/db/models.py:194` | M1 |
| 9 | Replace the pgvector query with a numpy top-k search, and remove the `pgvector` import | `backend/app/services/rag_service.py:281-344`, `models.py:21` | M1 |
| 10 | Replace tiktoken with chunking by character count that respects sentence boundaries | `rag_service.py:35-50, 99-133` | M1 |
| 11 | Run the Postgres-only startup SQL only on Postgres. On SQLite, enable WAL mode and `busy_timeout`, and drop the connection-pool arguments | `main.py:47-88`, `backend/app/db/session.py` | M1 |
| 12 | Add API tests in `tests/` that run against SQLite and the mock provider | `backend/tests/` (new) | M1 |
| 13 | Run document ingestion as a background job, so requests are never blocked | `rag_service.py:146-235` + new job module | M2 |
| 14 | Add `practice_service.py`: generate quizzes and flashcards from a JSON schema, grade multiple-choice answers, schedule reviews with FSRS | new service + `backend/app/api/v1/endpoints/practice.py` | M2 |
| 15 | Add a Practice page (take a quiz) and a Review page (flashcard queue with Again/Hard/Good/Easy buttons). Add stats to the dashboard | `frontend/src/pages/` | M2 |
| 16 | Render math with `remark-math` + `rehype-katex` (works offline) | `frontend/package.json`, markdown renderer | M2 |
| 17 | Desktop mode: FastAPI serves the React build and falls back to `index.html` for unknown paths (needed for BrowserRouter). One local user. Listen only on 127.0.0.1 | `main.py`, `backend/app/core/security.py`, `frontend/src/services/api.js:3` | M3 |
| 18 | Add `desktop/launcher.py`, a first-run model downloader (with progress and a SHA-256 check), and a PyInstaller spec that bundles the static `llama-server` | `desktop/` (new) | M3 |
| 19 | Bundle the fonts instead of loading them from Google (`@fontsource/inter`, `@fontsource/plus-jakarta-sans`) | `frontend/index.html:9-12`, `frontend/src/main.jsx` | M3 |
| 20 | Log timings for every model call: `ttft_ms` (time to first token), `tokens_per_s`, `prompt_tokens`, `completion_tokens`, `model`, `duration_ms` | `ai_service.py`, `chat_messages` columns or a log table | M1 (used in M4) |

## 3.6 Milestones and task checklists

### M0: Proposal (week 0)
- [ ] Write a one-page proposal covering the problem, research questions, scope (English; web + macOS) and evaluation plan ([thesis plan](04-thesis-plan.md))
- [ ] Get the supervisor's approval
- [ ] Delete `/debug/config` (change #1)
- [ ] Confirm the deadline and the Mac's chip and RAM

### M1: Local brain (weeks 1–2)
- [ ] Changes #2–#12 and #20
- [ ] `brew install llama.cpp`, then run the chat and embedding servers (§3.4)
- [ ] Collect the evaluation corpus: 6–10 openly licensed lecture PDFs ([thesis plan §4.5](04-thesis-plan.md#45-evaluation-design))
- **Done when:**
  - The web app streams answers with citations from the local model on the Mac, using SQLite.
  - Timings are logged for every message.
  - Tests pass with the mock provider.

### M2: Practice features (weeks 3–4)
- [ ] Changes #13–#16
- [ ] Uploading a document generates flashcards and a quiz, with visible progress
- [ ] The FSRS review queue works, and reviews are saved to `flashcard_reviews`
- **Done when:**
  - Uploading a PDF produces a quiz and flashcards with page citations.
  - The review queue schedules cards correctly.
  - Both editions work: web (OpenAI) and local.

### M3: macOS app (weeks 5–6)
- [ ] Changes #17–#19
- [ ] Build `llama-server` as one self-contained file (`-DBUILD_SHARED_LIBS=OFF`) and bundle it
- [ ] An offline DMG installer that already includes the default model
- [ ] A demo video recorded with Wi-Fi off
- **Done when:**
  - `MindSpark.app` opens with a double-click on a clean Mac.
  - The whole workflow works with networking off.
  - A packet capture or firewall log shows no outgoing connections.

### M4: Evaluation (weeks 7–8)
- [ ] Freeze the models (record each file's SHA-256) and the llama.cpp version
- [ ] Generate items for every test condition and run the automatic checks
- [ ] Hold a human rating session with 3 raters and compute how well they agree
- [ ] Run performance tests on 2–3 Macs, ideally including an 8 GB one
- [ ] Optional: a user study with 10–15 students, using the SUS usability questionnaire
- **Done when:** a script in `eval/` reproduces every results table.

### M5: Writing and defense (weeks 9–12)
- [ ] Write chapters following the [writing schedule](04-thesis-plan.md#410-writing-schedule)
- [ ] Polish and fix bugs
- [ ] Prepare an offline demo with a live packet capture, plus a backup video

## 3.7 Technical notes and gotchas

**Performance basics (needed for the code and for thesis chapter 2)**
```
M_total   ≈ M_weights + M_KV + M_compute + M_app
M_weights ≈ N_params × bits_per_weight / 8            (Q4_K_M ≈ 4.8–4.9 bits/weight)
M_KV      = 2 × n_layers × n_ctx × n_kv_heads × d_head × bytes_per_element
decode tok/s ≲ memory_bandwidth / bytes_read_per_token  (≈ weight size for dense models)
```
- **Example, Llama-3.1-8B:** the KV cache takes 128 KiB per token at f16, so 1 GiB for an 8K context. The Q4_K_M weights take about 4.9 GB, so the total is about 6 GB.
- **Don't hard-code model parameters.** Read them from the GGUF file's metadata.
- **Generation speed is limited by memory bandwidth.** Base M-series Macs have about 100–120 GB/s, which gives roughly **12–20 tokens/s for an 8B 4-bit model**, and about twice that for 4B.
- **Prompt processing is limited by compute.** On a base M-series GPU it runs at a few hundred tokens/s.
- **Validate these estimates.** Measuring them is a thesis result.
- **What follows from this:**
  - Keep prompts short and keep their beginning unchanged, so the prompt cache is reused (change #7).
  - A 10-question quiz takes around a minute, which is why generation runs in the background (D-11).

**8 GB Macs**
- The GPU can use roughly two-thirds to three-quarters of the memory.
- With macOS and a browser running, a ~4B 4-bit model (~2.5–3 GB) with a 4–8K context is the comfortable maximum.

**Measuring memory**
- llama.cpp maps the model file into memory instead of loading a private copy.
- Report a clearly defined metric per process, such as resident memory or memory footprint.
- When memory runs out, the system swaps pages out. Generation then slows to a crawl instead of crashing.

**Embedding prefixes**
- nomic-embed-text-v1.5 needs `search_query: ` before queries and `search_document: ` before chunks.
- Leaving a prefix out quietly makes search worse.

**Thinking models**
- Turn off any reasoning ("thinking") mode when generating quizzes and flashcards.

**OpenAI strict JSON schemas**
- Every property must appear in `required`.
- Set `additionalProperties: false` at every level.
- Keep one schema that both providers accept.

**Async code**
- Never call a blocking model or embedding client inside `async def`.
- Use `AsyncOpenAI`, or run the call in a thread pool.

**SQLite**
- Enable WAL mode and `busy_timeout`.
- Keep write transactions short, and never hold one open while the model is generating.

**Frontend in desktop mode**
- FastAPI must serve the React build, with a fallback to `index.html` for unknown paths.
- `/api` paths must work as relative URLs. Watch out: `api.js` currently treats an empty `VITE_API_URL` as missing.

**Local security**
- Every server listens only on 127.0.0.1, on a random port.
- Start `llama-server` with `--api-key`.
- No debug endpoints.

**Gatekeeper**
- The first time an unsigned app opens, the user must click "Open Anyway" in System Settings → Privacy & Security.

**Static llama-server**
- Build with `-DBUILD_SHARED_LIBS=OFF` to get one file with Metal support built in.
- Check that it starts on a clean Mac without Homebrew.

## 3.8 Testing

- **Unit and API tests:** pytest with the mock provider in CI, so tests are deterministic and need no network.
- **Database coverage:** run the same API tests against both SQLite and Postgres.
- **Integration (optional job):** test JSON-schema generation with a small local model.
- **Offline check, before every milestone demo:** turn Wi-Fi off and watch a packet capture or a firewall log (Little Snitch or LuLu).

## 3.9 MVP definition of done

On a clean Apple Silicon Mac with no network connection:
1. Install `MindSpark.app` and open it.
2. Upload a lecture PDF.
3. Within a few minutes, see a quiz and flashcards with page citations.
4. Take the quiz and review the cards.
5. Ask a question and get a streamed answer that either cites pages or says the topic isn't in the notes.

The same workflow works in the web edition with OpenAI.
