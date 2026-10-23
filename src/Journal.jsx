import { useEffect, useMemo, useRef, useState } from 'react'
import { BookHeart, ChevronDown, Pencil, PenLine, Search, Sparkles, Trash2, X } from 'lucide-react'

/* Journal entries live under their own localStorage keys. The daily key used by
   the rest of the app ('bloomspace-v1') resets every day, which would wipe a diary. */
const entriesKey = 'bloomspace-journal-v1'
const draftKey = 'bloomspace-journal-draft-v1'

const TITLE_MAX = 80
const BODY_MAX = 5000
const PREVIEW_CHARS = 160

const entryMoods = [
  { value: 'happy', label: 'Happy', face: '😊' },
  { value: 'calm', label: 'Calm', face: '😌' },
  { value: 'emotional', label: 'Emotional', face: '🥺' },
  { value: 'sad', label: 'Sad', face: '😢' },
  { value: 'overwhelmed', label: 'Overwhelmed', face: '😵' },
]
const prompts = [
  'What made me smile today?',
  'What am I grateful for?',
  'What is on my mind right now?',
  'What small win can I celebrate?',
  'What do I need to let go of?',
  'How can I be kind to myself tomorrow?',
]
const emptyDraft = { title: '', body: '', mood: '', prompt: '', editingId: null }

const text = value => (typeof value === 'string' ? value : '')
const moodOf = value => entryMoods.find(m => m.value === value)
const stamp = value => {
  const n = Number(value)
  return Number.isFinite(n) && Math.abs(n) <= 8.64e15 ? n : Date.now()
}

function readEntries() {
  try {
    const raw = JSON.parse(localStorage.getItem(entriesKey) || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter(e => e && e.id != null && typeof e.body === 'string')
      .map(e => {
        const created = stamp(e.createdAt)
        return {
          id: e.id,
          title: text(e.title),
          body: e.body,
          mood: moodOf(e.mood) ? e.mood : '',
          prompt: text(e.prompt),
          createdAt: created,
          updatedAt: e.updatedAt == null ? created : stamp(e.updatedAt),
        }
      })
  } catch {
    return []
  }
}

function readDraft(entries) {
  try {
    const raw = JSON.parse(localStorage.getItem(draftKey) || 'null')
    if (!raw || typeof raw !== 'object') return emptyDraft
    return {
      title: text(raw.title).slice(0, TITLE_MAX),
      body: text(raw.body).slice(0, BODY_MAX),
      mood: moodOf(raw.mood) ? raw.mood : '',
      prompt: text(raw.prompt),
      editingId: entries.some(e => e.id === raw.editingId) ? raw.editingId : null,
    }
  } catch {
    return emptyDraft
  }
}

function Journal({ notify }) {
  const [entries, setEntries] = useState(readEntries)
  const [draft, setDraft] = useState(() => readDraft(entries))
  const [query, setQuery] = useState('')
  const [formError, setFormError] = useState('')
  const [saveFailed, setSaveFailed] = useState(false)
  const [pending, setPending] = useState(null)
  const formRef = useRef(null)
  const titleRef = useRef(null)
  const bodyRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(entriesKey, JSON.stringify(entries))
      setSaveFailed(false)
    } catch {
      setSaveFailed(true)
    }
  }, [entries])

  // The unsaved draft is kept too, so switching tabs or refreshing never loses writing.
  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft))
    } catch {
      /* the entries warning above covers storage problems */
    }
  }, [draft])

  const editing = draft.editingId != null ? entries.find(e => e.id === draft.editingId) : null
  const isDirty = editing
    ? draft.title !== editing.title || draft.body !== editing.body || draft.mood !== editing.mood || draft.prompt !== editing.prompt
    : Boolean(draft.title.trim() || draft.body.trim())

  const q = query.trim().toLowerCase()
  const visible = useMemo(
    () => [...entries]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter(e => !q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)),
    [entries, q],
  )

  function patch(changes) {
    setDraft(d => ({ ...d, ...changes }))
    setFormError('')
  }
  function resetForm() {
    setDraft(emptyDraft)
    setFormError('')
  }
  function focusForm() {
    window.requestAnimationFrame(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      formRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      titleRef.current?.focus({ preventScroll: true })
    })
  }
  function loadIntoForm(entry) {
    setDraft({ title: entry.title, body: entry.body, mood: entry.mood, prompt: entry.prompt, editingId: entry.id })
    setFormError('')
    focusForm()
  }

  function togglePrompt(prompt) {
    const selecting = draft.prompt !== prompt
    patch({ prompt: selecting ? prompt : '' })
    if (selecting) bodyRef.current?.focus()
  }

  function saveEntry(event) {
    event.preventDefault()
    const title = draft.title.trim()
    const body = draft.body.trim()
    if (!body) {
      setFormError('Write a few words to save your entry.')
      bodyRef.current?.focus()
      return
    }
    const now = Date.now()
    if (editing) {
      setEntries(current => current.map(e => (
        e.id === editing.id ? { ...e, title, body, mood: draft.mood, prompt: draft.prompt, updatedAt: now } : e
      )))
      notify('Entry updated ✨')
    } else {
      let id = now
      while (entries.some(e => e.id === id)) id += 1
      setEntries(current => [{ id, title, body, mood: draft.mood, prompt: draft.prompt, createdAt: now, updatedAt: now }, ...current])
      notify('Entry saved 💜')
    }
    resetForm()
  }

  function startEdit(entry) {
    if (draft.editingId === entry.id) return focusForm()
    if (isDirty) return setPending({ kind: 'replace', entry })
    loadIntoForm(entry)
  }
  function requestDiscard() {
    if (isDirty) setPending({ kind: 'discard' })
    else resetForm()
  }
  function confirmPending() {
    if (!pending) return
    if (pending.kind === 'delete') {
      const id = pending.entry.id
      setEntries(current => current.filter(e => e.id !== id))
      if (draft.editingId === id) resetForm()
      notify('Entry deleted')
    } else if (pending.kind === 'replace') {
      loadIntoForm(pending.entry)
    } else {
      resetForm()
    }
    setPending(null)
  }

  const dialog = !pending ? null
    : pending.kind === 'delete' ? {
      title: 'Delete this entry?',
      message: `“${pending.entry.title || 'Untitled entry'}” will be removed from this device. This can’t be undone.`,
      confirmLabel: 'Delete entry',
      danger: true,
    }
    : pending.kind === 'replace' ? {
      title: 'Switch to this entry?',
      message: 'What you’re writing hasn’t been saved yet, and it will be replaced.',
      confirmLabel: 'Switch entry',
    }
    : {
      title: 'Discard your writing?',
      message: 'What you’ve written here hasn’t been saved yet.',
      confirmLabel: 'Discard',
    }

  return (
    <>
      <div className="dashboard-grid journal-layout">
        <section className="panel journal-write" ref={formRef} aria-labelledby="journal-write-title">
          <div className="panel-heading">
            <div>
              <div className="panel-title" id="journal-write-title">{editing ? 'Edit your entry' : 'Write an entry'}</div>
              <p className="panel-description">{editing ? 'Make your changes, then save them.' : 'Take your time. There’s no wrong way to begin.'}</p>
            </div>
          </div>

          <form className="journal-form" onSubmit={saveEntry} noValidate>
            <div className="journal-field">
              <span className="journal-label" id="journal-prompt-label">Need a place to start? <span className="journal-optional">Pick a prompt</span></span>
              <div className="journal-prompts" role="group" aria-labelledby="journal-prompt-label">
                {prompts.map(prompt => (
                  <button type="button" key={prompt} className="journal-prompt-chip" aria-pressed={draft.prompt === prompt} onClick={() => togglePrompt(prompt)}>{prompt}</button>
                ))}
              </div>
              {draft.prompt && (
                <div className="journal-prompt-note">
                  <Sparkles size={16}/>
                  <span>{draft.prompt}</span>
                  <button type="button" aria-label="Remove prompt" onClick={() => patch({ prompt: '' })}><X size={14}/></button>
                </div>
              )}
            </div>

            <div className="journal-field">
              <label htmlFor="journal-title">Title <span className="journal-optional">(optional)</span></label>
              <input id="journal-title" ref={titleRef} value={draft.title} onChange={e => patch({ title: e.target.value })} placeholder="e.g. A slow Sunday" maxLength={TITLE_MAX} autoComplete="off"/>
            </div>

            <div className="journal-field">
              <label htmlFor="journal-body">Your entry</label>
              <textarea id="journal-body" ref={bodyRef} value={draft.body} onChange={e => patch({ body: e.target.value })} placeholder="Write whatever’s on your heart…" maxLength={BODY_MAX} aria-invalid={Boolean(formError)}/>
              {draft.body.length >= BODY_MAX * 0.8 && <span className="journal-counter">{draft.body.length} / {BODY_MAX}</span>}
            </div>

            <div className="journal-field">
              <span className="journal-label" id="journal-mood-label">Mood <span className="journal-optional">(optional)</span></span>
              <div className="journal-mood-picker" role="group" aria-labelledby="journal-mood-label">
                {entryMoods.map(m => (
                  <button type="button" key={m.value} className={`journal-mood-chip jmood-${m.value}`} aria-pressed={draft.mood === m.value} onClick={() => patch({ mood: draft.mood === m.value ? '' : m.value })}>
                    <span aria-hidden="true">{m.face}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>

            {formError && <p className="journal-alert" role="alert">{formError}</p>}
            {saveFailed && <p className="journal-alert" role="alert">Your entries couldn’t be saved in this browser. Storage may be full or blocked, so copy anything important somewhere safe.</p>}

            <div className="journal-form-actions">
              {(editing || isDirty) && <button type="button" className="button-quiet" onClick={requestDiscard}>{editing ? 'Cancel edit' : 'Clear'}</button>}
              <button type="submit" className="button-primary"><PenLine size={16}/> {editing ? 'Save changes' : 'Save entry'}</button>
            </div>
            <p className="journal-privacy">Entries are saved on this device only.</p>
          </form>
        </section>

        <section className="panel journal-history" aria-labelledby="journal-history-title">
          <div className="panel-heading">
            <div>
              <div className="panel-title" id="journal-history-title">Your entries <span className="count-pill">{entries.length}</span></div>
              <p className="panel-description">Newest first.</p>
            </div>
          </div>

          <div className="search-box journal-search" role="search">
            <Search size={16}/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title or words…" aria-label="Search journal entries"/>
            {query && <button type="button" className="journal-search-clear" aria-label="Clear search" onClick={() => setQuery('')}><X size={14}/></button>}
          </div>
          {q && entries.length > 0 && <p className="journal-results" role="status">{visible.length} of {entries.length} {entries.length === 1 ? 'entry matches' : 'entries match'}</p>}

          {entries.length === 0 ? (
            <div className="empty-state journal-empty"><BookHeart size={22}/><p>No entries yet. Write your first one, even a sentence counts.</p></div>
          ) : visible.length === 0 ? (
            <div className="empty-state journal-empty"><Search size={22}/><p>No entries match “{query.trim()}”. Try a different word.</p><button type="button" className="text-button" onClick={() => setQuery('')}>Clear search</button></div>
          ) : (
            <div className="journal-list">
              {visible.map(entry => (
                <JournalEntry key={entry.id} entry={entry} isEditing={draft.editingId === entry.id} onEdit={() => startEdit(entry)} onDelete={() => setPending({ kind: 'delete', entry })}/>
              ))}
            </div>
          )}
        </section>
      </div>

      {dialog && <ConfirmDialog {...dialog} onConfirm={confirmPending} onClose={() => setPending(null)}/>}
    </>
  )
}

function JournalEntry({ entry, isEditing, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const mood = moodOf(entry.mood)
  const title = entry.title || 'Untitled entry'
  const chars = Array.from(entry.body.replace(/\s+/g, ' ').trim())
  const truncated = chars.length > PREVIEW_CHARS
  const shown = truncated && !open ? `${chars.slice(0, PREVIEW_CHARS).join('').trimEnd()}…` : entry.body
  const created = new Date(entry.createdAt)
  const edited = entry.updatedAt - entry.createdAt > 1000

  return (
    <article className={`journal-entry ${isEditing ? 'is-editing' : ''}`}>
      <div className="journal-entry-top">
        <time className="journal-entry-date" dateTime={created.toISOString()}>
          {created.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, {created.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit' })}
        </time>
        {edited && <span className="journal-entry-edited">Edited</span>}
        <div className="journal-entry-actions">
          <button type="button" className="journal-edit-button" aria-label={`Edit ${title}`} onClick={onEdit}><Pencil size={15}/></button>
          <button type="button" className="delete-button" aria-label={`Delete ${title}`} onClick={onDelete}><Trash2 size={15}/></button>
        </div>
      </div>
      <h3>{title}</h3>
      {(mood || entry.prompt) && (
        <div className="journal-entry-meta">
          {mood && <span className={`journal-mood-pill jmood-${mood.value}`}><span aria-hidden="true">{mood.face}</span>{mood.label}</span>}
          {entry.prompt && <span className="journal-entry-prompt"><Sparkles size={13}/>{entry.prompt}</span>}
        </div>
      )}
      <p className="journal-entry-body">{shown}</p>
      {truncated && (
        <button type="button" className="text-button journal-entry-toggle" aria-expanded={open} onClick={() => setOpen(v => !v)}>
          {open ? 'Show less' : 'Read more'} <ChevronDown size={15}/>
        </button>
      )}
    </article>
  )
}

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onClose }) {
  const Icon = danger ? Trash2 : PenLine
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <section className={`modal-card journal-confirm ${danger ? 'is-danger' : ''}`} role="alertdialog" aria-modal="true" aria-labelledby="journal-confirm-title" aria-describedby="journal-confirm-text">
        <button type="button" className="modal-close icon-button" aria-label="Close dialog" onClick={onClose}><X size={18}/></button>
        <div className="modal-icon"><Icon size={23}/></div>
        <h2 id="journal-confirm-title">{title}</h2>
        <p id="journal-confirm-text">{message}</p>
        <div className="modal-actions">
          <button type="button" className="button-quiet" autoFocus onClick={onClose}>Cancel</button>
          <button type="button" className={`button-primary ${danger ? 'journal-danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}

export default Journal
