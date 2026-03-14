export interface Task {
  id: string
  title: string
  // Tags may include special markers like #urgent
  tags: string[]
  done: boolean
  createdAt: string
  // Priority 1 (lowest) to 5 (highest). Tasks tagged #urgent require priority >= 4.
  priority: number
}

// A task as it may appear in older tasks.json files: priority may be absent
export type LegacyTask = Omit<Task, 'priority'> & { priority?: number }
