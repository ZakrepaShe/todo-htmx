const express = require('express');
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const { v4 : uuid } = require('uuid');

const PORT = process.env.PORT || 3000;

let todos = [
  {
    id: uuid(),
    name: 'Taste htmx',
    done: true
  },
  {
    id: uuid(),
    name: 'Buy a unicorn',
    done: false
  }
];

const itemTemplate = pug.compileFile('views/includes/todo-item.pug');
const editItemTemplate = pug.compileFile('views/includes/edit-item.pug');
const itemCountTemplate = pug.compileFile('views/includes/item-count.pug');
const getItemsLeft = () => todos.filter(t => !t.done).length;

const app = express();
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.render('index', { todos, itemsLeft: getItemsLeft() });
});

app.post('/todos', (req, res) => {
  const { todo } = req.body;

  if (!todo) return;

  const newTodo = {
    id: uuid(),
    name: todo,
    done: false
  };
  todos.push(newTodo);
  const resultMarkup = itemTemplate({ todo: newTodo}) + itemCountTemplate({ itemsLeft: getItemsLeft()});
  res.send(resultMarkup);
});

app.get('/todos/edit/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);

  const markup = editItemTemplate({ todo });
  res.send(markup);
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);
  todo.done = !todo.done;

  const resultMarkup = itemTemplate({ todo}) + itemCountTemplate({ itemsLeft: getItemsLeft()});
  res.send(resultMarkup);
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);

  const resultMarkup = itemTemplate({ todo});
  res.send(resultMarkup);
});

app.post('/todos/update/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const todo = todos.find(t => t.id === id);

  todo.name = name;

  const resultMarkup = itemTemplate({ todo}) + itemCountTemplate({ itemsLeft: getItemsLeft()});
  res.send(resultMarkup);
});

app.delete('/todos/:id', (req,res) => {
  const { id } = req.params;
  const idx = todos.find(t => t === id);
  todos.splice(idx, 1);

  const resultMarkup = itemCountTemplate({ itemsLeft: getItemsLeft()});
  res.send(resultMarkup);
});

app.post('/todos/clear-completed', (req, res) => {
  const newTodos = todos.filter(t => !t.done);
  todos = [...newTodos];

  const resultMarkup = itemTemplate({ todo}) + itemCountTemplate({ itemsLeft: getItemsLeft()});
  res.send(resultMarkup);
});

app.listen(PORT);

console.log('Listening on port: ' + PORT);
