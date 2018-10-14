#! /usr/bin/env node

const fs = require('fs');
const chalk = require('chalk');
const rl = require('readline');

const args = process.argv

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({
  todos: []
}).write()

const commands = ['new', 'list', 'complete', 'delete', 'clear', 'help']

const usage = function () {
  const usageText = `
  todo helps you to manage your todo tasks.

  usage:
    todo <command>

    commands can be:

    new:          used to create a new todo
    list:         used to retrieve your todos
    complete <i>: used to mark a todo as complete by index
    delete <i>:   used to delete a todo by index
    clear:        used to delete all todos
    help:         used to print the usage guide
  `

  console.log(usageText)
}

// Make error log red color
function errorLog(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}

// Exeptions for commands which require extra arg
const exeptConds = ['complete', 'delete']

switch (args[2]) {
  case 'help':
    usage()
    break
  case 'new':
    newTodo()
    break
  case 'list':
    getTodos()
    break
  case 'complete':
    completeTodo()
    break
  case 'delete':
    deleteTodo()
    break
  case 'clear':
    clearTodos()
    break
  default:
    errorLog('Invalid command passed')
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
  if (todos.length == 0) {
    let t = chalk.magenta('ToDo list is clear')
    console.log(t)
  }
  let index = 1;
  todos.forEach(todo => {
    let todoText = `${index++}. ${todo.title}`
    if (todo.complete) {
      todoText += chalk.green(' ✔ ️')
    }
    console.log(chalk.strikethrough(todoText))
  })
  return
}

function completeTodo() {
  // check the length
  if (args.length != 4) {
    errorLog("Invalid number of arguments passed for complete command")
    return
  }

  let n = Number(args[3])
  // check if the value is a number
  if (isNaN(n)) {
    errorLog("Please provide a valid number for complete command")
    return
  }

  // check if correct length of values has been passed
  let todosLength = db.get('todos').value().length
  if (n > todosLength) {
    errorLog("Invalid number passed for complete command.")
    return
  }

  // update the todo item marked as complete
  db.set(`todos[${n-1}].complete`, true).write()

  getTodos()
}

function deleteTodo() {
  if (args.length != 4) {
    errorLog("Invalid number of arguments passed for complete command")
    return
  }

  let n = Number(args[3])
  // check if the value is a number
  if (isNaN(n)) {
    errorLog("Please provide a valid number for complete command")
    return
  }

  let todosLength = db.get('todos').value().length
  if (n > todosLength || n < 0) {
    errorLog("Invalid number passed for complete command.")
    return
  }

  // get title of that task
  // its a bit stupid coz at the begining i didnt add indexes
  // and idk how to get indexes in lowdb
  let todo = db.get(`todos[${n-1}].title`).value()
  db.get('todos').remove({ title: `${todo}` }).write()
  console.log(chalk.red(`Task #${n} was deleted`))

  getTodos()
}

function clearTodos() {
  fs.unlink('db.json', (err) => {
    if (err) throw err;
    let t = chalk.magenta('ToDo list was cleared')
    console.log(t);
  });
}