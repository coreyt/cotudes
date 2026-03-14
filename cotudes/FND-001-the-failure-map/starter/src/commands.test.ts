import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { addTask, listTasks, markDone, removeTask } from './commands'

const DATA_FILE = path.join(process.cwd(), 'tasks.json')

beforeEach(() => {
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE)
})

afterEach(() => {
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE)
})

describe('addTask', () => {
  it('creates a task with title and tags', () => {
    const task = addTask('Buy groceries', ['shopping'])
    expect(task.title).toBe('Buy groceries')
    expect(task.tags).toEqual(['shopping'])
    expect(task.done).toBe(false)
    expect(task.id).toBeTruthy()
    expect(task.createdAt).toBeTruthy()
  })

  it('generates unique IDs for each task', () => {
    const a = addTask('First', [])
    const b = addTask('Second', [])
    expect(a.id).not.toBe(b.id)
  })

  it('persists tasks between calls', () => {
    addTask('First task', [])
    addTask('Second task', [])
    expect(listTasks()).toHaveLength(2)
  })
})

describe('listTasks', () => {
  it('returns empty array when no tasks exist', () => {
    expect(listTasks()).toEqual([])
  })

  it('returns all added tasks', () => {
    addTask('Task 1', [])
    addTask('Task 2', ['urgent'])
    const tasks = listTasks()
    expect(tasks).toHaveLength(2)
    expect(tasks[0].title).toBe('Task 1')
  })
})

describe('markDone', () => {
  it('marks a task as done', () => {
    const task = addTask('Complete me', [])
    const updated = markDone(task.id)
    expect(updated?.done).toBe(true)
  })

  it('persists the done status', () => {
    const task = addTask('Complete me', [])
    markDone(task.id)
    expect(listTasks()[0].done).toBe(true)
  })

  it('returns null for an unknown id', () => {
    expect(markDone('nonexistent')).toBeNull()
  })
})

describe('removeTask', () => {
  it('removes an existing task', () => {
    const task = addTask('Remove me', [])
    expect(removeTask(task.id)).toBe(true)
    expect(listTasks()).toHaveLength(0)
  })

  it('returns false for an unknown id', () => {
    expect(removeTask('nonexistent')).toBe(false)
  })
})
