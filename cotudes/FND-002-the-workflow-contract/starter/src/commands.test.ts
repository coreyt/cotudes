import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { addTask, listTasks, markDone, removeTask, ValidationError } from './commands'

const DATA_FILE = path.join(process.cwd(), 'tasks.json')

beforeEach(() => {
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE)
})

afterEach(() => {
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE)
})

describe('addTask', () => {
  it('creates a task with default priority 3', () => {
    const task = addTask('Buy groceries', [])
    expect(task.priority).toBe(3)
  })

  it('creates a task with explicit priority', () => {
    const task = addTask('Important task', [], 5)
    expect(task.priority).toBe(5)
  })

  it('rejects priority below 1', () => {
    expect(() => addTask('Bad task', [], 0)).toThrow(ValidationError)
  })

  it('rejects priority above 5', () => {
    expect(() => addTask('Bad task', [], 6)).toThrow(ValidationError)
  })

  it('rejects #urgent tasks with priority below 4', () => {
    expect(() => addTask('Urgent low', ['#urgent'], 2)).toThrow(ValidationError)
    expect(() => addTask('Urgent low', ['#urgent'], 3)).toThrow(ValidationError)
  })

  it('accepts #urgent tasks with priority 4 or 5', () => {
    expect(() => addTask('Urgent ok', ['#urgent'], 4)).not.toThrow()
    expect(() => addTask('Urgent high', ['#urgent'], 5)).not.toThrow()
  })

  it('persists tasks between calls', () => {
    addTask('First', [])
    addTask('Second', [])
    expect(listTasks()).toHaveLength(2)
  })
})

describe('listTasks', () => {
  it('returns tasks with priority', () => {
    addTask('Task', [], 2)
    expect(listTasks()[0].priority).toBe(2)
  })
})

describe('markDone', () => {
  it('marks a task as done', () => {
    const task = addTask('Complete me', [])
    expect(markDone(task.id)?.done).toBe(true)
  })

  it('returns null for unknown id', () => {
    expect(markDone('nonexistent')).toBeNull()
  })
})

describe('removeTask', () => {
  it('removes an existing task', () => {
    const task = addTask('Remove me', [])
    expect(removeTask(task.id)).toBe(true)
    expect(listTasks()).toHaveLength(0)
  })

  it('returns false for unknown id', () => {
    expect(removeTask('nonexistent')).toBe(false)
  })
})
