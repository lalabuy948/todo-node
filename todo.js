const chalk = require('chalk')
const rl = require('readline');
const args = process.argv

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({
  todos: []
}).write()

const commands = ['new', 'get', 'complete', 'delete', 'help']

const usage = function () {
  const usageText = `
  todo helps you manage you todo tasks.

  usage:
    todo <command>

    commands can be:

    new:      used to create a new todo
    get:      used to retrieve your todos
    complete: used to mark a todo as complete
    delete:   used to delete a todo
    help:     used to print the usage guide
  `

  console.log(usageText)
}

function errorLog(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}

const exeptConds = ['complete', 'delete']

if (args.length > 3 && !exeptConds.includes(args[2])) {
  errorLog('only one argument can be accepted')
  usage()
  return
}

if (commands.indexOf(args[2]) == -1) {
  errorLog('invalid command passed')
  usage()
}

switch (args[2]) {
  case 'help':
    usage()
    break
  case 'new':
    newTodo()
    break
  case 'get':
    getTodos()
    break
  case 'complete':
    completeTodo()
    break
  case 'delete':
    deleteTodo()
    break
  default:
    errorLog('invalid command passed')
    usage()
}

function prompt(question) {
  const r = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  return new Promise((resolve, error) => {
    r.question(question, answer => {
      r.close()
      resolve(answer)
    });
  })
}

function newTodo() {
  const q = chalk.blue('Type in your todo\n')
  prompt(q).then(todo => {
    // add todo
    db.get('todos')
      .push({
        title: todo,
        complete: false
      })
      .write()
  })
}

function getTodos() {
  const todos = db.get('todos').value()
  let index = 1;
  todos.forEach(todo => {
    let todoText = `${index++}. ${todo.title}`
    if (todo.complete) {
      todoText += ' ✔ ️'
    }
    console.log(chalk.strikethrough(todoText))
  })
  return
}

function completeTodo() {
  // check the length
  if (args.length != 4) {
    errorLog("invalid number of arguments passed for complete command")
    return
  }

  let n = Number(args[3])
  // check if the value is a number
  if (isNaN(n)) {
    errorLog("please provide a valid number for complete command")
    return
  }

  // check if correct length of values has been passed
  let todosLength = db.get('todos').value().length
  if (n > todosLength) {
    errorLog("invalid number passed for complete command.")
    return
  }

  // update the todo item marked as complete
  db.set(`todos[${n-1}].complete`, true).write()
}

function deleteTodo() {
  if (args.length != 4) {
    errorLog("invalid number of arguments passed for complete command")
    return
  }

  let n = Number(args[3])
  // check if the value is a number
  if (isNaN(n)) {
    errorLog("please provide a valid number for complete command")
    return
  }

  let todosLength = db.get('todos').value().length
  if (n > todosLength || n < 0) {
    errorLog("invalid number passed for complete command.")
    return
  }

  // get title of that task
  // its a bit stupid coz at the begining i didnt add indexes
  // and idk how to get indexes in lowdb
  let todo = db.get(`todos[${n-1}].title`).value()
  // delete the todo item
  db.get('todos').remove({ title: `${todo}` }).write()
  console.log(chalk.red(`Task #${n} was deleted`))
}