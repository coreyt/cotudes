import { randomUUID } from 'crypto'
import { loadTasks, saveTasks } from './store'
import { Task } from './types'

export function addTask(title: string, tags: string[]): Task {
  const tasks = loadTasks()
  const task: Task = {
    id: randomUUID(),
    title,
    tags,
    done: false,
    createdAt: new Date().toISOString(),
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
