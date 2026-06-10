import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useI18n } from '../context/I18nContext'
import { documentsService } from '../services/documents'
import { chatService } from '../services/chat'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'

// Subject value + emoji; the label is resolved via i18n at render time.
const SUBJECTS = [
  { value: 'other', emoji: '✨' },
  { value: 'mathematics', emoji: '📐' },
  { value: 'physics', emoji: '⚛️' },
  { value: 'chemistry', emoji: '🧪' },
  { value: 'biology', emoji: '🧬' },
  { value: 'computer_science', emoji: '💻' },
  { value: 'history', emoji: '🏛️' },
  { value: 'literature', emoji: '📖' },
  { value: 'language', emoji: '🗣️' },
  { value: 'economics', emoji: '📊' },
]

const STATUS_STYLE = {
  pending: 'bg-ink-100 text-ink-600 border-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:border-ink-700',
  processing: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  failed: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
}

const ACCEPT = '.pdf,.txt,.md,.markdown,application/pdf,text/plain,text/markdown'

function bytes(n) {
  if (!n) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = n
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1 }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

function Dropzone({ onPick, disabled }) {
  const { t } = useI18n()
  const [isOver, setIsOver] = useState(false)
  const inputRef = useRef(null)

  const onDrop = (e) => {
    e.preventDefault()
    setIsOver(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) onPick(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true) }}
      onDragLeave={() => setIsOver(false)}
      onDrop={onDrop}
      className={`relative rounded-3xl border-2 border-dashed transition-colors p-10 text-center ${
        isOver
          ? 'border-primary-400 bg-primary-50/60 dark:bg-primary-500/10'
          : 'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900'
      } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
        </svg>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 dark:text-ink-100">
        {t('documents.dropTitle')}
      </h3>
      <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
        {t('documents.dropDesc')}
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn btn-primary mt-5 text-sm"
      >
        {t('documents.chooseFile')}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function UploadModal({ file, onClose, onUploaded }) {
  const { t } = useI18n()
  const [title, setTitle] = useState(file?.name?.replace(/\.[^.]+$/, '') || '')
  const [subject, setSubject] = useState('other')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError('')
    try {
      const doc = await documentsService.upload(file, { title: title.trim(), subject }, setProgress)
      onUploaded(doc)
    } catch (err) {
      setError(err.response?.data?.detail || t('documents.uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  if (!file) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in">
      <form onSubmit={submit} className="bg-white dark:bg-ink-900 rounded-3xl shadow-glow-lg w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-ink-100 dark:border-ink-800">
          <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100">{t('documents.uploadTitle')}</h3>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5 truncate">
            {file.name} · {bytes(file.size)}
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">{t('documents.titleLabel')}</label>
            <input
              className="input mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('documents.titlePlaceholder')}
              maxLength={255}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">{t('documents.subjectLabel')}</label>
            <select
              className="input mt-1"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.emoji}&nbsp;&nbsp;{t(`subjects.${s.value}`)}
                </option>
              ))}
            </select>
          </div>

          {uploading && (
            <div>
              <div className="h-2 w-full rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                {progress < 100 ? t('documents.uploading', { progress }) : t('documents.processing')}
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 px-3 py-2 text-sm">
              {error}
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-ink-50 dark:bg-ink-800/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="btn btn-secondary text-sm"
          >
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={uploading} className="btn btn-primary text-sm">
            {uploading ? t('documents.uploading', { progress }) : t('documents.upload')}
          </button>
        </div>
      </form>
    </div>
  )
}

function DocumentDetail({ doc, onClose }) {
  const { t } = useI18n()
  const [chunks, setChunks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    documentsService.chunks(doc.id, 30).then((data) => {
      if (active) { setChunks(data || []); setLoading(false) }
    }).catch(() => { if (active) { setChunks([]); setLoading(false) } })
    return () => { active = false }
  }, [doc.id])

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-ink-900 w-full sm:max-w-xl h-full overflow-y-auto animate-fade-in-up shadow-glow-lg">
        <div className="px-6 py-5 border-b border-ink-100 dark:border-ink-800 sticky top-0 bg-white dark:bg-ink-900 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100 truncate">{doc.title}</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 truncate">{doc.filename}</p>
              <div className="mt-2 flex gap-2 text-xs text-ink-500 dark:text-ink-400">
                <span>{t('documents.chunksCount', { count: doc.chunk_count })}</span>
                <span>·</span>
                <span>{t('documents.charsCount', { count: (doc.char_count / 1000).toFixed(1) })}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800">
              <svg className="w-5 h-5 text-ink-500 dark:text-ink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wide font-semibold">
            {t('documents.firstChunks', { count: chunks.length })}
          </div>
          {loading ? (
            <div className="space-y-2">
              {[0,1,2].map((i) => (
                <div key={i} className="h-16 bg-ink-100 dark:bg-ink-800 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : chunks.length === 0 ? (
            <p className="text-sm text-ink-500 dark:text-ink-400">{t('documents.noChunks')}</p>
          ) : (
            chunks.map((c) => (
              <div key={c.id} className="rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50/70 dark:bg-ink-800/40 p-3">
                <div className="flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400 mb-1 font-mono">
                  <span>#{c.chunk_index}</span>
                  <span>
                    {c.page ? t('documents.pagePrefix', { page: c.page }) : ''}{t('documents.tokShort', { count: c.token_count })}
                  </span>
                </div>
                <p className="text-sm text-ink-800 dark:text-ink-200 whitespace-pre-wrap leading-relaxed line-clamp-6">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function Documents() {
  const { t, lang } = useI18n()
  const dateLocale = lang === 'uk' ? uk : undefined
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingFile, setPendingFile] = useState(null)
  const [detail, setDetail] = useState(null)
  const [startingChat, setStartingChat] = useState(false)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await documentsService.list()
      setDocs(data || [])
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Poll while any document is still processing.
  const hasProcessing = useMemo(
    () => docs.some((d) => d.status === 'pending' || d.status === 'processing'),
    [docs],
  )
  useEffect(() => {
    if (!hasProcessing) return
    const t = setInterval(() => { load() }, 2500)
    return () => clearInterval(t)
  }, [hasProcessing, load])

  const onDelete = async (doc) => {
    if (!confirm(t('documents.deleteConfirm', { title: doc.title }))) return
    try {
      await documentsService.remove(doc.id)
      setDocs((ds) => ds.filter((d) => d.id !== doc.id))
    } catch (err) {
      alert(err.response?.data?.detail || t('documents.deleteFailed'))
    }
  }

  const startGroundedChat = async (doc) => {
    if (startingChat) return
    setStartingChat(true)
    try {
      const session = await chatService.createSession({
        title: t('documents.chatTitlePrefix', { title: doc.title }).slice(0, 80),
        subject: doc.subject,
        document_id: doc.id,
      })
      navigate(`/chat/${session.id}`)
    } catch (err) {
      alert(err.response?.data?.detail || t('documents.couldNotStart'))
    } finally {
      setStartingChat(false)
    }
  }

  const readyCount = docs.filter((d) => d.status === 'ready').length
  const processingCount = docs.filter((d) => d.status === 'processing' || d.status === 'pending').length
  const totalChunks = docs.reduce((n, d) => n + (d.chunk_count || 0), 0)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink-900 dark:text-ink-100">{t('documents.heading')}</h1>
            <p className="text-ink-600 dark:text-ink-300 mt-1">
              {t('documents.subtitle')}
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 px-4 py-2 shadow-soft">
              <div className="text-xs text-ink-500 dark:text-ink-400">{t('documents.statReady')}</div>
              <div className="text-lg font-display font-bold text-ink-900 dark:text-ink-100">{readyCount}</div>
            </div>
            <div className="rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 px-4 py-2 shadow-soft">
              <div className="text-xs text-ink-500 dark:text-ink-400">{t('documents.statIndexing')}</div>
              <div className="text-lg font-display font-bold text-ink-900 dark:text-ink-100">{processingCount}</div>
            </div>
            <div className="rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 px-4 py-2 shadow-soft">
              <div className="text-xs text-ink-500 dark:text-ink-400">{t('documents.statChunks')}</div>
              <div className="text-lg font-display font-bold text-ink-900 dark:text-ink-100">{totalChunks}</div>
            </div>
          </div>
        </div>

        <Dropzone onPick={setPendingFile} disabled={!!pendingFile} />

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100 mb-4">{t('documents.library')}</h2>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0,1,2].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 bg-ink-100 dark:bg-ink-800 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-ink-100 dark:bg-ink-800 rounded w-1/3 mb-6" />
                  <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-8 text-center text-ink-600 dark:text-ink-300">
              {t('documents.empty')}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((d) => {
                const subj = SUBJECTS.find((s) => s.value === d.subject) || SUBJECTS[0]
                const statusClass = STATUS_STYLE[d.status] || STATUS_STYLE.pending
                return (
                  <div
                    key={d.id}
                    className="rounded-2xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 shadow-soft hover:shadow-glow transition-all p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-lg shadow-sm">
                        {subj.emoji}
                      </div>
                      <span className={`chip border ${statusClass}`}>
                        {d.status === 'processing' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {t(`documents.status.${d.status}`)}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display font-semibold text-ink-900 dark:text-ink-100 line-clamp-2 min-h-[2.75rem]">
                      {d.title}
                    </h3>
                    <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{d.filename}</p>

                    {d.status === 'failed' && d.error && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 line-clamp-2">{d.error}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
                      <span>{t('documents.chunksCount', { count: d.chunk_count })}</span>
                      <span>{formatDistanceToNow(new Date(d.created_at), { addSuffix: true, locale: dateLocale })}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => startGroundedChat(d)}
                        disabled={d.status !== 'ready' || startingChat}
                        className="btn btn-primary text-xs px-3 py-2 flex-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {t('documents.chatAbout')}
                      </button>
                      <button
                        onClick={() => setDetail(d)}
                        className="btn btn-secondary text-xs px-3 py-2"
                        title={t('documents.previewTitle')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(d)}
                        className="btn text-xs px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        title={t('documents.deleteTitle')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {pendingFile && (
        <UploadModal
          file={pendingFile}
          onClose={() => setPendingFile(null)}
          onUploaded={(doc) => {
            setPendingFile(null)
            setDocs((ds) => [doc, ...ds.filter((d) => d.id !== doc.id)])
          }}
        />
      )}
      {detail && <DocumentDetail doc={detail} onClose={() => setDetail(null)} />}
    </Layout>
  )
}
