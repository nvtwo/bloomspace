import { useEffect, useMemo, useState } from 'react'
import {
  Sprout, LayoutDashboard, CheckSquare, Leaf, BookHeart, Settings,
  Search, Bell, Plus, Check, ChevronRight, Sun, Moon, Coffee, BookOpen,
  Dumbbell, GlassWater, Wind, Trash2, X, Sparkles, CalendarDays,
  CircleCheck, Target, Smile, Heart, CloudSun, Menu
} from 'lucide-react'
import Journal from './Journal.jsx'

const habitIcons = {
  GlassWater,
  BookOpen,
  Dumbbell,
  Wind,
  Sprout,
}

const starterTasks = [
  { id: 1, title: 'Review lecture notes', time: '09:30 AM', category: 'Study', done: false },
  { id: 2, title: 'Drink enough water', time: '11:00 AM', category: 'Wellness', done: true },
  { id: 3, title: 'Work on personal project', time: '02:00 PM', category: 'Focus', done: false },
]
const starterHabits = [
  { id: 1, name: 'Drink water', icon: 'GlassWater', tint: 'mint', done: true },
  { id: 2, name: 'Read 10 pages', icon: 'BookOpen', tint: 'lilac', done: false },
  { id: 3, name: 'Move your body', icon: 'Dumbbell', tint: 'peach', done: false },
  { id: 4, name: 'Take a mindful break', icon: 'Wind', tint: 'blue', done: true },
]
const moods = [
  { value: 'lovely', label: 'Lovely', face: '☀️' },
  { value: 'good', label: 'Good', face: '🌼' },
  { value: 'okay', label: 'Okay', face: '☁️' },
  { value: 'low', label: 'Low', face: '🌧️' },
  { value: 'tired', label: 'Tired', face: '🌙' },
]
const storageKey = 'bloomspace-v1'

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
    const today = new Date().toDateString()
    return {
      tasks: saved.date === today && Array.isArray(saved.tasks) ? saved.tasks : starterTasks,
      habits: saved.date === today && Array.isArray(saved.habits) ? saved.habits : starterHabits.map(h => ({...h})),
      mood: saved.date === today ? saved.mood || '' : '',
      date: today,
    }
  } catch {
    return { tasks: starterTasks, habits: starterHabits.map(h => ({...h})), mood: '', date: new Date().toDateString() }
  }
}

function App() {
  const [saved] = useState(readSaved)
  const [tasks, setTasks] = useState(saved.tasks)
  const [habits, setHabits] = useState(saved.habits)
  const [mood, setMood] = useState(saved.mood)
  const [newTask, setNewTask] = useState('')
  const [newHabit, setNewHabit] = useState('')
  const [activeNav, setActiveNav] = useState('Overview')
  const [query, setQuery] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [dark, setDark] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ date: new Date().toDateString(), tasks, habits, mood }))
  }, [tasks, habits, mood])

  const doneTasks = tasks.filter(t => t.done).length
  const doneHabits = habits.filter(h => h.done).length
  const totalItems = tasks.length + habits.length
  const doneItems = doneTasks + doneHabits
  const progress = totalItems ? Math.round(doneItems / totalItems * 100) : 0
  const todayLabel = new Date().toLocaleDateString('en-MY', { weekday: 'long', month: 'long', day: 'numeric' })
  const filteredTasks = useMemo(() => tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())), [tasks, query])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }
  function addTask(event) {
    event.preventDefault()
    const title = newTask.trim()
    if (!title) return
    setTasks(current => [...current, { id: Date.now(), title, time: 'Anytime', category: 'Personal', done: false }])
    setNewTask('')
    setShowTaskForm(false)
    notify('A little step added to your day ✨')
  }
  function addHabit(event) {
    event.preventDefault()
    const name = newHabit.trim()
    if (!name) return
    setHabits(current => [...current, { id: Date.now(), name, icon: Sprout, tint: 'mint', done: false }])
    setNewHabit('')
    setShowHabitForm(false)
    notify('Your new habit is ready to grow 🌱')
  }
  function toggleTask(id) {
    setTasks(current => current.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  function toggleHabit(id) {
    setHabits(current => current.map(h => h.id === id ? { ...h, done: !h.done } : h))
  }

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'My tasks', icon: CheckSquare },
    { label: 'Habits', icon: Leaf },
    { label: 'Journal', icon: BookHeart },
  ]

  return (
    <div className={`app-shell ${dark ? 'dark' : ''}`}>
      {mobileMenu && <div className="scrim" onClick={() => setMobileMenu(false)} aria-hidden="true"/>}
      <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
        <a className="brand" href="#overview" onClick={() => setActiveNav('Overview')}>
          <span className="brand-mark"><Sprout size={24} strokeWidth={1.8}/></span>
          <span><strong>bloomspace</strong><small>Your little growth space</small></span>
          <button className="mobile-close icon-button" aria-label="Close menu" onClick={e => { e.preventDefault(); setMobileMenu(false) }}><X size={18}/></button>
        </a>
        <div className="side-label">Your space</div>
        <nav className="nav-list">
          {navItems.map(({label, icon: Icon}) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} aria-current={activeNav === label ? 'page' : undefined} onClick={() => { setActiveNav(label); setMobileMenu(false) }}>
              <Icon size={18}/><span>{label}</span>{label === 'My tasks' && <span className="nav-count">{tasks.filter(t=>!t.done).length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quote-card">
            <span className="quote-spark"><Sparkles size={16}/></span>
            <p>“Little by little, a little becomes a lot.”</p>
            <small>— Tanzanian proverb</small>
          </div>
          <button className="nav-item settings-link" onClick={() => setDark(v => !v)}><Settings size={18}/><span>{dark ? 'Light appearance' : 'Appearance'}</span><span className="theme-dot">{dark ? <Sun size={14}/> : <Moon size={14}/>}</span></button>
          <div className="profile">
            <div className="avatar">M</div><div className="profile-text"><strong>Your space</strong><small>One day at a time</small></div><span className="online-dot"/>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu size={21}/></button>
          <div className="breadcrumb"><span>My space</span><ChevronRight size={14}/><strong>{activeNav}</strong></div>
          <div className="top-actions">
            <label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a task..." aria-label="Search tasks"/><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify('You’re all caught up. Take a breath 🌿')}><Bell size={18}/><i/></button>
            <div className="top-avatar">M</div>
          </div>
        </header>

        <div className="page-content">
          {activeNav === 'Journal' ? (
            <section className="journal-view">
              <div className="eyebrow"><BookHeart size={15}/> A moment for you</div>
              <h1>Your daily journal<span className="title-period">.</span></h1>
              <p className="page-subtitle">Pause for a moment. Check in with yourself, without judgement.</p>
              <MoodCard mood={mood} setMood={setMood}/>
              <Journal notify={notify}/>
              <div className="journal-note"><Heart size={20}/><div><strong>Remember</strong><p>You don't have to be productive every minute to have a meaningful day.</p></div></div>
            </section>
          ) : activeNav === 'Habits' ? (
            <section>
              <div className="eyebrow"><Leaf size={15}/> Your daily rituals</div>
              <h1>Little habits, <em>big growth.</em></h1>
              <p className="page-subtitle">Consistency over perfection. You're doing better than you think.</p>
              <HabitsPanel habits={habits} toggleHabit={toggleHabit} onAdd={() => setShowHabitForm(true)}/>
            </section>
          ) : activeNav === 'My tasks' ? (
            <section>
              <div className="eyebrow"><CheckSquare size={15}/> Your to-do list</div>
              <h1>One thing at a <em>time.</em></h1>
              <p className="page-subtitle">Focus on what matters today. The rest can wait.</p>
              <TasksPanel tasks={filteredTasks} toggleTask={toggleTask} onAdd={() => setShowTaskForm(true)} onDelete={id => setTasks(ts => ts.filter(t=>t.id!==id))} />
            </section>
          ) : (
            <>
              <section className="welcome-row" id="overview">
                <div>
                  <div className="eyebrow"><Sun size={15}/> {todayLabel}</div>
                  <h1>A little progress, <em>every day.</em></h1>
                  <p className="page-subtitle">You don't have to bloom all at once. Let's make today count.</p>
                </div>
                <div className="welcome-illustration" aria-hidden="true"><div className="sun-disc"/><div className="plant-pot"><span className="stem"/><span className="leaf leaf-one"/><span className="leaf leaf-two"/><span className="leaf leaf-three"/><span className="pot"/></div><span className="sparkle sparkle-one">✳</span><span className="sparkle sparkle-two">✦</span></div>
              </section>

              <section className="stats-grid" aria-label="Today's progress">
                <div className="stat-card progress-stat">
                  <div className="stat-top"><span className="stat-icon mint"><Target size={18}/></span><span className="stat-label">Daily progress</span><span className="stat-trend"><Sparkles size={13}/> Today</span></div>
                  <div className="stat-value">{progress}<span>%</span></div>
                  <div className="progress-track"><span style={{width:`${progress}%`}}/></div>
                  <p className="stat-foot">{doneItems} of {totalItems} little steps completed</p>
                </div>
                <div className="stat-card">
                  <div className="stat-top"><span className="stat-icon lilac"><CheckSquare size={18}/></span><span className="stat-label">Tasks completed</span></div>
                  <div className="stat-value">{doneTasks}<span className="stat-outof"> / {tasks.length}</span></div>
                  <p className="stat-foot">Every checkmark counts.</p>
                  <div className="mini-dots"><i className={doneTasks>0?'filled':''}/><i className={doneTasks>1?'filled':''}/><i className={doneTasks>2?'filled':''}/><i className={doneTasks>3?'filled':''}/></div>
                </div>
                <div className="stat-card">
                  <div className="stat-top"><span className="stat-icon peach"><Leaf size={18}/></span><span className="stat-label">Habits nurtured</span></div>
                  <div className="stat-value">{doneHabits}<span className="stat-outof"> / {habits.length}</span></div>
                  <p className="stat-foot">Small rituals, stronger roots.</p>
                  <div className="habit-progress-dots">{habits.slice(0,8).map(h=><i key={h.id} className={h.done?'filled':''}/>)}</div>
                </div>
              </section>

              <div className="dashboard-grid">
                <section className="panel tasks-panel">
                  <div className="panel-heading"><div><div className="panel-title">Today's tasks <span className="count-pill">{tasks.filter(t=>!t.done).length}</span></div><p className="panel-description">A little structure goes a long way.</p></div><button className="text-button" onClick={()=>setActiveNav('My tasks')}>View all <ChevronRight size={15}/></button></div>
                  <div className="task-list">
                    {filteredTasks.slice(0,4).map(task=><TaskRow key={task.id} task={task} onToggle={()=>toggleTask(task.id)}/>)}
                    {filteredTasks.length===0 && <EmptyState text="No matching tasks. Try another search or add a new one."/>}
                  </div>
                  <button className="add-inline" onClick={()=>setShowTaskForm(true)}><span><Plus size={16}/></span> Add a new task</button>
                </section>

                <section className="panel habits-panel">
                  <div className="panel-heading"><div><div className="panel-title">Daily habits <span className="count-pill">{doneHabits}/{habits.length}</span></div><p className="panel-description">Keep showing up for yourself.</p></div><button className="icon-button small" aria-label="Add habit" onClick={()=>setShowHabitForm(true)}><Plus size={18}/></button></div>
                  <div className="habit-list">{habits.slice(0,4).map(habit=><HabitRow key={habit.id} habit={habit} onToggle={()=>toggleHabit(habit.id)}/>)}</div>
                  <button className="habit-footer" onClick={()=>setActiveNav('Habits')}>Manage your habits <ChevronRight size={15}/></button>
                </section>
              </div>

              <div className="bottom-grid">
                <section className="mood-panel">
                  <div className="mood-copy"><span className="mood-kicker"><Heart size={14}/> Check in with yourself</span><h2>How are you <em>feeling?</em></h2><p>There's no right or wrong answer. Just you, checking in.</p></div>
                  <div className="mood-options">{moods.map(m=><button key={m.value} className={`mood-option mood-${m.value} ${mood===m.value?'selected':''}`} onClick={()=>{setMood(m.value);notify(`Mood saved: ${m.label.toLowerCase()} 💛`)}} aria-pressed={mood===m.value}><span>{m.face}</span><small>{m.label}</small></button>)}</div>
                </section>
                <section className="quote-panel"><div className="quote-decoration"><CloudSun size={28}/></div><span className="quote-label">A thought to keep</span><p>You are allowed to be both a masterpiece and a work in progress.</p><span className="quote-line"/></section>
              </div>
              <footer className="page-footer"><span>Made with <Heart size={12} fill="currentColor"/> and a little patience.</span><span>Bloomspace © {new Date().getFullYear()}</span></footer>
            </>
          )}
        </div>
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {navItems.map(({label, icon: Icon}) => (
          <button key={label} className={`bottom-nav-item ${activeNav === label ? 'active' : ''}`} aria-current={activeNav === label ? 'page' : undefined} onClick={() => setActiveNav(label)}>
            <Icon size={20}/><span>{label}</span>
          </button>
        ))}
      </nav>

      {showTaskForm && <Modal title="Add a little task" subtitle="Small steps make a meaningful day." onClose={()=>setShowTaskForm(false)}><form onSubmit={addTask} className="modal-form"><label htmlFor="task-name">What would you like to do?</label><input id="task-name" autoFocus value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="e.g. Read for 15 minutes" maxLength={100}/><div className="modal-actions"><button type="button" className="button-quiet" onClick={()=>setShowTaskForm(false)}>Cancel</button><button type="submit" className="button-primary"><Plus size={16}/> Add task</button></div></form></Modal>}
      {showHabitForm && <Modal title="Plant a new habit" subtitle="Choose a tiny ritual you want to nurture." onClose={()=>setShowHabitForm(false)}><form onSubmit={addHabit} className="modal-form"><label htmlFor="habit-name">Your new habit</label><input id="habit-name" autoFocus value={newHabit} onChange={e=>setNewHabit(e.target.value)} placeholder="e.g. Stretch for five minutes" maxLength={70}/><div className="modal-actions"><button type="button" className="button-quiet" onClick={()=>setShowHabitForm(false)}>Cancel</button><button type="submit" className="button-primary"><Sprout size={16}/> Add habit</button></div></form></Modal>}
      {toast && <div className="toast" role="status"><CircleCheck size={17}/>{toast}</div>}
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  return <div className={`task-row ${task.done?'is-done':''}`}><button className={`check-circle ${task.done?'checked':''}`} aria-label={task.done?'Mark task incomplete':'Mark task complete'} onClick={onToggle}>{task.done&&<Check size={13}/>}</button><div className="task-main"><span className="task-name">{task.title}</span><span className="task-meta">{task.time} <i/> {task.category}</span></div>{onDelete&&<button className="delete-button" aria-label={`Delete ${task.title}`} onClick={onDelete}><Trash2 size={15}/></button>}</div>
}
function HabitRow({ habit, onToggle }) {
  const Icon = habitIcons[habit.icon] || Sprout
  return <button className={`habit-row ${habit.done?'is-done':''}`} aria-pressed={habit.done} onClick={onToggle}><span className={`habit-icon ${habit.tint||'mint'}`}><Icon size={17}/></span><span className="habit-name">{habit.name}</span><span className={`habit-check ${habit.done?'checked':''}`}>{habit.done&&<Check size={12}/>}</span></button>
}
function TasksPanel({tasks,toggleTask,onAdd,onDelete}) {
  return <div className="panel standalone-panel"><div className="panel-heading"><div><div className="panel-title">Your tasks <span className="count-pill">{tasks.filter(t=>!t.done).length} left</span></div><p className="panel-description">Check things off at your own pace.</p></div><button className="button-primary" onClick={onAdd}><Plus size={16}/> Add task</button></div><div className="task-list">{tasks.map(t=><TaskRow key={t.id} task={t} onToggle={()=>toggleTask(t.id)} onDelete={()=>onDelete(t.id)}/>)}</div>{!tasks.length&&<EmptyState text="Nothing here yet. Add a task or try another search."/>}</div>
}
function HabitsPanel({habits,toggleHabit,onAdd}) {
  return <div className="panel standalone-panel"><div className="panel-heading"><div><div className="panel-title">Your daily rituals <span className="count-pill">{habits.filter(h=>h.done).length}/{habits.length}</span></div><p className="panel-description">Tap a habit when you've completed it today.</p></div><button className="button-primary" onClick={onAdd}><Plus size={16}/> Add habit</button></div><div className="habit-grid">{habits.map(h=><HabitLarge key={h.id} habit={h} onToggle={()=>toggleHabit(h.id)}/>)}</div>{!habits.length&&<EmptyState text="Your habit garden is waiting. Plant your first habit."/>}</div>
}

function HabitLarge({ habit, onToggle }) {
  const Icon = habitIcons[habit.icon] || Sprout

  return (
    <button
      className={`habit-large ${habit.done ? 'is-done' : ''}`}
      aria-pressed={habit.done}
      onClick={onToggle}
    >
      <span className={`habit-icon large ${habit.tint || 'mint'}`}>
        <Icon size={21} />
      </span>

      <strong>{habit.name}</strong>

      <span className="habit-large-bottom">
        {habit.done ? (
          <>
            <Check size={14} /> Completed today
          </>
        ) : (
          'Tap to complete'
        )}
      </span>
    </button>
  )
}

function MoodCard({mood,setMood}) {
  return <div className="panel mood-journal-card"><div className="panel-title">How are you feeling today?</div><p className="panel-description">Naming how you feel is a small act of self-care.</p><div className="mood-options journal-moods">{moods.map(m=><button key={m.value} className={`mood-option mood-${m.value} ${mood===m.value?'selected':''}`} onClick={()=>setMood(m.value)} aria-pressed={mood===m.value}><span>{m.face}</span><small>{m.label}</small></button>)}</div>{mood&&<p className="saved-note"><Check size={14}/> Check-in saved for today.</p>}</div>
}
function EmptyState({text}) { return <div className="empty-state"><Sprout size={22}/><p>{text}</p></div> }
function Modal({title,subtitle,onClose,children}) {
  useEffect(()=>{function onKey(e){if(e.key==='Escape')onClose()}window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose])
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close icon-button" aria-label="Close dialog" onClick={onClose}><X size={18}/></button><div className="modal-icon"><Sprout size={23}/></div><h2 id="modal-title">{title}</h2><p>{subtitle}</p>{children}</section></div>
}

export default App