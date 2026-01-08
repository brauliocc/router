import { useState, useEffect } from 'react'
import './App.css'

const defaultDailyTasks = [
  { id: 1, name: 'Workout', alternatives: ['Gym', 'Home workout', 'Yoga'], completed: false, streak: 0 },
  { id: 2, name: 'Cardio', alternatives: ['Running', 'Tennis', 'Top rope', 'Swimming'], completed: false, streak: 0 },
  { id: 3, name: 'Read', alternatives: ['Book', 'Articles', 'Audiobook'], completed: false, streak: 0 },
  { id: 4, name: 'Meditate', alternatives: ['Breathing', 'Mindfulness', 'Journaling'], completed: false, streak: 0 },
]

const defaultWeeklyTasks = [
  { id: 101, name: 'Go out', alternatives: ['Dinner', 'Movies', 'Concert', 'Party'], completed: false, progress: 0 },
  { id: 102, name: 'Deep clean', alternatives: ['Kitchen', 'Bathroom', 'Bedroom'], completed: false, progress: 0 },
]

function App() {
  const [dailyTasks, setDailyTasks] = useState(() => {
    const saved = localStorage.getItem('dailyTasks')
    return saved ? JSON.parse(saved) : defaultDailyTasks
  })
  
  const [weeklyTasks, setWeeklyTasks] = useState(() => {
    const saved = localStorage.getItem('weeklyTasks')
    return saved ? JSON.parse(saved) : defaultWeeklyTasks
  })
  
  const [linkedGroups, setLinkedGroups] = useState(() => {
    const saved = localStorage.getItem('linkedGroups')
    return saved ? JSON.parse(saved) : []
  })

  const [showAddDaily, setShowAddDaily] = useState(false)
  const [showAddWeekly, setShowAddWeekly] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskAlts, setNewTaskAlts] = useState('')

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks))
  }, [dailyTasks])

  useEffect(() => {
    localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks))
  }, [weeklyTasks])

  useEffect(() => {
    localStorage.setItem('linkedGroups', JSON.stringify(linkedGroups))
  }, [linkedGroups])

  const toggleDailyTask = (id) => {
    setDailyTasks(tasks => tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed
        return {
          ...task,
          completed: newCompleted,
          streak: newCompleted ? task.streak + 1 : Math.max(0, task.streak - 1)
        }
      }
      return task
    }))
  }

  const toggleWeeklyTask = (id) => {
    setWeeklyTasks(tasks => tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed
        return {
          ...task,
          completed: newCompleted,
          progress: newCompleted ? 1 : 0
        }
      }
      return task
    }))
  }

  const swapAlternative = (taskId, isDaily, altName) => {
    if (isDaily) {
      setDailyTasks(tasks => tasks.map(task => {
        if (task.id === taskId) {
          const oldName = task.name
          const newAlts = task.alternatives.filter(a => a !== altName)
          newAlts.push(oldName)
          return { ...task, name: altName, alternatives: newAlts }
        }
        return task
      }))
    } else {
      setWeeklyTasks(tasks => tasks.map(task => {
        if (task.id === taskId) {
          const oldName = task.name
          const newAlts = task.alternatives.filter(a => a !== altName)
          newAlts.push(oldName)
          return { ...task, name: altName, alternatives: newAlts }
        }
        return task
      }))
    }
  }

  const addTask = (isDaily) => {
    if (!newTaskName.trim()) return
    const alternatives = newTaskAlts.split(',').map(a => a.trim()).filter(a => a)
    const newTask = {
      id: Date.now(),
      name: newTaskName,
      alternatives,
      completed: false,
      ...(isDaily ? { streak: 0 } : { progress: 0 })
    }
    if (isDaily) {
      setDailyTasks([...dailyTasks, newTask])
      setShowAddDaily(false)
    } else {
      setWeeklyTasks([...weeklyTasks, newTask])
      setShowAddWeekly(false)
    }
    setNewTaskName('')
    setNewTaskAlts('')
  }

  const deleteTask = (id, isDaily) => {
    if (isDaily) {
      setDailyTasks(tasks => tasks.filter(t => t.id !== id))
    } else {
      setWeeklyTasks(tasks => tasks.filter(t => t.id !== id))
    }
  }

  const TaskCard = ({ task, isDaily, onToggle, onSwap, onDelete }) => {
    const [showAlts, setShowAlts] = useState(false)
    
    return (
      <div className={`task-card ${task.completed ? 'completed' : ''}`}>
        <div className="task-main">
          <button 
            className={`check-btn ${task.completed ? 'checked' : ''}`}
            onClick={() => onToggle(task.id)}
          >
            {task.completed ? '✓' : '○'}
          </button>
          <span className="task-name">{task.name}</span>
          {isDaily && task.streak > 0 && (
            <span className="streak">🔥 {task.streak}</span>
          )}
          {!isDaily && (
            <span className="weekly-progress">
              {task.completed ? '✅ Done this week' : '⏳ Pending'}
            </span>
          )}
          <button className="swap-btn" onClick={() => setShowAlts(!showAlts)}>
            ↔️
          </button>
          <button className="delete-btn" onClick={() => onDelete(task.id, isDaily)}>
            ✕
          </button>
        </div>
        {showAlts && task.alternatives.length > 0 && (
          <div className="alternatives">
            <span>Swap with:</span>
            {task.alternatives.map(alt => (
              <button 
                key={alt} 
                className="alt-btn"
                onClick={() => { onSwap(task.id, isDaily, alt); setShowAlts(false); }}
              >
                {alt}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>🗓️ Router</h1>
        <p className="subtitle">Your Daily Routine Tracker</p>
      </header>

      <section className="section daily-section">
        <div className="section-header">
          <h2>📅 Daily Tasks</h2>
          <button className="add-btn" onClick={() => setShowAddDaily(!showAddDaily)}>
            + Add
          </button>
        </div>
        
        {showAddDaily && (
          <div className="add-form">
            <input
              type="text"
              placeholder="Task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Alternatives (comma separated)"
              value={newTaskAlts}
              onChange={(e) => setNewTaskAlts(e.target.value)}
            />
            <button onClick={() => addTask(true)}>Add Task</button>
          </div>
        )}

        <div className="tasks-list">
          {dailyTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isDaily={true}
              onToggle={toggleDailyTask}
              onSwap={swapAlternative}
              onDelete={deleteTask}
            />
          ))}
        </div>
      </section>

      <section className="section weekly-section">
        <div className="section-header">
          <h2>📆 Weekly Tasks</h2>
          <button className="add-btn" onClick={() => setShowAddWeekly(!showAddWeekly)}>
            + Add
          </button>
        </div>

        {showAddWeekly && (
          <div className="add-form">
            <input
              type="text"
              placeholder="Task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Alternatives (comma separated)"
              value={newTaskAlts}
              onChange={(e) => setNewTaskAlts(e.target.value)}
            />
            <button onClick={() => addTask(false)}>Add Task</button>
          </div>
        )}

        <div className="tasks-list">
          {weeklyTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isDaily={false}
              onToggle={toggleWeeklyTask}
              onSwap={swapAlternative}
              onDelete={deleteTask}
            />
          ))}
        </div>
      </section>

      <footer>
        <p>Keep your streak going! 🔥</p>
      </footer>
    </div>
  )
}

export default App
