import { addTask, listTasks, markDone, removeTask } from './commands'

const [, , command, ...args] = process.argv

switch (command) {
  case 'add': {
    const tagsIndex = args.indexOf('--tags')
    const tags = tagsIndex >= 0 ? args[tagsIndex + 1].split(',') : []
    const titleArgs = tagsIndex >= 0 ? args.slice(0, tagsIndex) : args
    const task = addTask(titleArgs.join(' '), tags)
    console.log(`Added: [${task.id.slice(0, 8)}] ${task.title}`)
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
      console.log(`${status} ${t.id.slice(0, 8)} ${t.title}${tags}`)
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
  default:
    console.log('Usage: taskman <add|list|done|remove> [args]')
    console.log('  add <title> [--tags tag1,tag2]')
    console.log('  list')
    console.log('  done <id>')
    console.log('  remove <id>')
}
