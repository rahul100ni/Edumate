import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { Plus, Trash2, Edit2, Save, X, Calendar, Clock, Tag, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { useTaskAnalytics } from '../context/TaskAnalyticsContext'

interface SubTask {
  id: number
  text: string
  completed: boolean
}

interface Todo {
  id: number
  text: string
  completed: boolean
  category: string
  tags: string[]
  dueDate: Date | null
  priority: 'low' | 'medium' | 'high'
  subTasks: SubTask[]
}

const TodoListPage: React.FC = () => {
  const { updateTaskCompletion } = useTaskAnalytics()
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos')
    return savedTodos ? JSON.parse(savedTodos, (key, value) => {
      if (key === 'dueDate' && value) return new Date(value)
      return value
    }) : []
  })
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [category, setCategory] = useState('All')
  const [newTag, setNewTag] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [expandedTodo, setExpandedTodo] = useState<number | null>(null)

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (input.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        text: input.trim(),
        completed: false,
        category: category === 'All' ? 'Personal' : category,
        tags: [],
        dueDate: dueDate,
        priority: priority,
        subTasks: []
      }
      setTodos([...todos, newTodo])
      setInput('')
      setDueDate(null)
      setPriority('medium')
    }
  }

  const toggleTodo = (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      const updatedTodo = { ...todo, completed: !todo.completed }
      setTodos(todos.map(t => t.id === id ? updatedTodo : t))
      updateTaskCompletion(updatedTodo)
    }
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const startEditing = (id: number, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editText } : todo
    ))
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const addTag = (todoId: number) => {
    if (newTag.trim() !== '') {
      setTodos(todos.map(todo =>
        todo.id === todoId ? { ...todo, tags: [...todo.tags, newTag.trim()] } : todo
      ))
      setNewTag('')
    }
  }

  const removeTag = (todoId: number, tagToRemove: string) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? { ...todo, tags: todo.tags.filter(tag => tag !== tagToRemove) } : todo
    ))
  }

  const updateDueDate = (todoId: number, date: Date | null) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? { ...todo, dueDate: date } : todo
    ))
  }

  const updatePriority = (todoId: number, newPriority: 'low' | 'medium' | 'high') => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? { ...todo, priority: newPriority } : todo
    ))
  }

  const addSubTask = (todoId: number, subTaskText: string) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? {
        ...todo,
        subTasks: [...todo.subTasks, { id: Date.now(), text: subTaskText, completed: false }]
      } : todo
    ))
  }

  const toggleSubTask = (todoId: number, subTaskId: number) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? {
        ...todo,
        subTasks: todo.subTasks.map(subTask =>
          subTask.id === subTaskId ? { ...subTask, completed: !subTask.completed } : subTask
        )
      } : todo
    ))
  }

  const removeSubTask = (todoId: number, subTaskId: number) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? {
        ...todo,
        subTasks: todo.subTasks.filter(subTask => subTask.id !== subTaskId)
      } : todo
    ))
  }

  const calculateProgress = () => {
    const totalTasks = todos.length
    const completedTasks = todos.filter(todo => todo.completed).length
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  }

  const priorityColors = {
    low: 'border-green-500',
    medium: 'border-yellow-500',
    high: 'border-red-500'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 mt-[5rem]">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">To-Do List</h2>
      <div className="mb-6">
        <div className="flex mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="flex-grow px-4 py-2 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Add a new task..."
          />
          <button
            onClick={addTodo}
            className="px-6 py-2 bg-indigo-600 text-white text-lg font-semibold rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300"
          >
            <Plus size={24} />
          </button>
        </div>
        <div className="flex space-x-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="All">All Categories</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>
          <DatePicker
            selected={dueDate}
            onChange={(date: Date) => setDueDate(date)}
            placeholderText="Set due date"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>
      <div className="mb-6">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                Task Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {Math.round(calculateProgress())}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
            <div style={{ width: `${calculateProgress()}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
          </div>
        </div>
      </div>
      <ul className="space-y-3">
        {todos
          .filter(todo => category === 'All' || todo.category === category)
          .map(todo => (
          <li key={todo.id} className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm transition-all duration-300 hover:shadow-md border-l-4 ${priorityColors[todo.priority]}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="mr-3 form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                />
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-grow px-3 py-1 mr-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                  />
                ) : (
                  <span className={`text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>{todo.text}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {editingId === todo.id ? (
                  <>
                    <button onClick={() => saveEdit(todo.id)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                      <Save size={20} />
                    </button>
                    <button onClick={cancelEdit} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(todo.id, todo.text)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 size={20} />
                    </button>
                    <button onClick={() => setExpandedTodo(expandedTodo === todo.id ? null : todo.id)} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                      {expandedTodo === todo.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </>
                )}
              </div>
            </div>
            {expandedTodo === todo.id && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                  <DatePicker
                    selected={todo.dueDate}
                    onChange={(date: Date) => updateDueDate(todo.id, date)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Tag size={16} className="text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag(todo.id)}
                    placeholder="Add tag"
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {todo.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center dark:bg-indigo-800 dark:text-indigo-200">
                      {tag}
                      <button onClick={() => removeTag(todo.id, tag)} className="ml-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Subtasks</h4>
                  <ul className="space-y-2">
                    {todo.subTasks.map(subTask => (
                      <li key={subTask.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={subTask.completed}
                            onChange={() => toggleSubTask(todo.id, subTask.id)}
                            className="mr-2 form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                          />
                          <span className={`${subTask.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{subTask.text}</span>
                        </div>
                        <button onClick={() => removeSubTask(todo.id, subTask.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex">
                    <input
                      type="text"
                      placeholder="Add subtask"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSubTask(todo.id, e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                      className="flex-grow px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add subtask"]') as HTMLInputElement
                        if (input && input.value) {
                          addSubTask(todo.id, input.value)
                          input.value = ''
                        }
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Priority:</label>
                    <select
                      value={todo.priority}
                      onChange={(e) => updatePriority(todo.id, e.target.value as 'low' | 'medium' | 'high')}
                      className="ml-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <Link
                    to="/pomodoro"
                    className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300"
                  >
                    <Play size={16} className="mr-1" />
                    Start Task
                  </Link>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {todos.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">No tasks yet. Add a task to get started!</p>
      )}
    </div>
  )
}

export default TodoListPage