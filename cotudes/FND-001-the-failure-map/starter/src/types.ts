export interface Task {
  id: string
  title: string
  // Tags may include special markers like #urgent
  tags: string[]
  done: boolean
  createdAt: string
}
