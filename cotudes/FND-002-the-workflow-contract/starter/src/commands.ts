import { randomUUID } from 'crypto'
import { loadTasks, saveTasks } from './store'
import { Task } from './types'

const DEFAULT_PRIORITY = 3
const URGENT_MIN_PRIORITY = 4

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

function validatePriority(tags: string[], priority: number): void {
  if (priority < 1 || priority > 5) {
    throw new ValidationError(`Priority must be between 1 and 5, got ${priority}`)
  }
  if (tags.includes('#urgent') && priority < URGENT_MIN_PRIORITY) {
    throw new ValidationError(
      `Tasks tagged #urgent require priority ${URGENT_MIN_PRIORITY} or higher, got ${priority}`
    )
  }
}

export function addTask(title: string, tags: string[], priority = DEFAULT_PRIORITY): Task {
  validatePriority(tags, priority)
  const tasks = loadTasks()
  const task: Task = {
    id: randomUUID(),
    title,
    tags,
    done: false,
    createdAt: new Date().toISOString(),
    priority,
  }
  tasks.push(task)
  saveTasks(tasks)
  return task
}

export function listTasks(): Task[] {
  return loadTasks()
}

export function markDone(id: string): Task | null {
  const tasks = loadTasks()
  const task = tasks.find(t => t.id === id)
  if (!task) return null
  task.done = true
  saveTasks(tasks)
  return task
}

export function removeTask(id: string): boolean {
  const tasks = loadTasks()
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return false
  tasks.splice(index, 1)
  saveTasks(tasks)
  return true
}

// migrate command implementation goes here
// The learner adds this in FND-002
