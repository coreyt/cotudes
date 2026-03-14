import * as fs from 'fs'
import * as path from 'path'
import { Task } from './types'

const DATA_FILE = path.join(process.cwd(), 'tasks.json')

export function loadTasks(): Task[] {
  if (!fs.existsSync(DATA_FILE)) return []
  const raw = fs.readFileSync(DATA_FILE, 'utf8')
  return JSON.parse(raw) as Task[]
}

export function saveTasks(tasks: Task[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2))
}
