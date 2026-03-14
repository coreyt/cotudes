import { addTask, listTasks, markDone, removeTask } from './commands'

const [, , command, ...args] = process.argv

switch (command) {
  case 'add': {
    const tagsIndex = args.indexOf('--tags')
    const priorityIndex = args.indexOf('--priority')
    const tags = tagsIndex >= 0 ? args[tagsIndex + 1].split(',') : []
    const priority = priorityIndex >= 0 ? parseInt(args[priorityIndex + 1], 10) : undefined
    const endIndex = Math.min(
      tagsIndex >= 0 ? tagsIndex : args.length,
      priorityIndex >= 0 ? priorityIndex : args.length
    )
    const title = args.slice(0, endIndex).join(' ')
    try {
      const task = addTask(title, tags, priority)
      console.log(`Added: [${task.id.slice(0, 8)}] ${task.title} (priority: ${task.priority})`)
    } catch (e) {
      console.error(`Error: ${(e as Error).message}`)
      process.exit(1)
    }
    break
  }
  case 'list': {
    const tasks = listTasks()
    if (tasks.length === 0) {
      console.log('No tasks.')
      break
    }
    tasks.forEach(t => {
      const status = t.done ? '✓' : '○'
      const tags = t.tags.length ? ` [${t.tags.join(', ')}]` : ''
      console.log(`${status} ${t.id.slice(0, 8)} p:${t.priority} ${t.title}${tags}`)
    })
    break
  }
  case 'done': {
    const task = markDone(args[0])
    console.log(task ? `Done: ${task.title}` : `Not found: ${args[0]}`)
    break
  }
  case 'remove': {
    const ok = removeTask(args[0])
    console.log(ok ? `Removed: ${args[0]}` : `Not found: ${args[0]}`)
    break
  }
  case 'migrate': {
    console.log('migrate command not yet implemented')
    process.exit(1)
    break
  }
  default:
    console.log('Usage: taskman <add|list|done|remove|migrate> [args]')
    console.log('  add <title> [--tags tag1,tag2] [--priority 1-5]')
    console.log('  list')
    console.log('  done <id>')
    console.log('  remove <id>')
    console.log('  migrate')
}
