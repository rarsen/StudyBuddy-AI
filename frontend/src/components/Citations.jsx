import { useState } from 'react'
import { useI18n } from '../context/I18nContext'

/**
 * Renders [n] markers inside assistant text as interactive chips.
 *
 * The marker is a plain Markdown-safe token (e.g. "[1]"), so we run
 * ReactMarkdown first, then a post-render pass via rehype/remark would be
 * needed to hook into mdast. Instead, we do a simpler and robust thing:
 * surface the full citations list under the bubble as clickable source
 * cards, and interleave tiny inline chips around the markers with a
 * lightweight text transform that the renderer wraps.
 *
 * Why separate from ReactMarkdown? Markdown doesn't have a first-class
 * notion of citations, and rewriting the AST would force us into rehype
 * internals. The current approach keeps markdown rendering intact and
 * adds a visually distinct Sources section that's the real citation UX.
 */

function scoreTint(score) {
  if (score >= 0.75) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 0.5) return 'bg-primary-50 text-primary-700 border-primary-200'
  if (score >= 0.3) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-ink-100 text-ink-600 border-ink-200'
}

export function CitationList({ citations }) {
  const [open, setOpen] = useState(false)
  const { t, tc } = useI18n()
  if (!citations || citations.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-800">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-ink-600 dark:text-ink-300 hover:text-primary-700 dark:hover:text-primary-300"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {tc('citations.sources', citations.length)}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ol className="mt-2 space-y-2">
          {citations.map((c, i) => {
            const n = i + 1
            return (
              <li
                key={c.chunk_id}
                className="rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-800/40 p-3"
              >
                <div className="flex items-start gap-2">
                  <span className={`chip border font-mono ${scoreTint(c.score)}`}>[{n}]</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">
                      {c.document_title || t('citations.documentFallback', { id: c.document_id })}
                      {c.page ? (
                        <span className="text-ink-500 dark:text-ink-400 font-normal"> · {t('documents.pageShort', { page: c.page })}</span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-ink-500 dark:text-ink-400 font-mono">
                      {t('citations.similarity', { score: c.score.toFixed(2) })}
                    </div>
                    <p className="mt-1.5 text-sm text-ink-700 dark:text-ink-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                      {c.snippet}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

/**
 * Decorates inline [n] markers inside rendered markdown.
 * Called as the ReactMarkdown `p` / `li` component override.
 */
export function decorateCitationMarkers(text, maxN) {
  if (typeof text !== 'string' || !maxN) return text
  const re = /\[(\d+)\]/g
  const parts = []
  let last = 0
  let m
  let key = 0
  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10)
    if (n >= 1 && n <= maxN) {
      if (m.index > last) parts.push(text.slice(last, m.index))
      parts.push(
        <sup
          key={`c-${key++}`}
          className="inline-flex items-center justify-center mx-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 border border-primary-200 align-baseline"
          title={`Source [${n}] — open sources below`}
        >
          [{n}]
        </sup>,
      )
      last = m.index + m[0].length
    }
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : text
}
