const express = require('express');
const app = express();

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/info', (request, response) => {
  response.set('Content-Type', 'text/html');
  const cnt = persons.length;
  const text = `<p>Phonebook has info for ${cnt} people</p><p>Request received at: ${request.requestTime}</p>`;
  response.send(text);
});

const generateId = () => {
  let max = 1000;
  let randomId = Math.round(Math.random() * max);
  const ids = persons.map((p) => Number(p.id));
  if (ids.includes(randomId)) {
    randomId = Math.round(Math.random() * max);
  }
  return randomId;
};

app.use(express.json());

app.post('/api/persons', (request, response) => {
  const person = request.body;

  if (!person || !person.name || !person.number) {
    return response.status(400).json({
      error: 'The name or number is missing',
    });
  }

  const names = persons.map((p) => p.name);
  if (names.includes(person.name)) {
    return response.status(400).json({
      error: `The name ${person.name} already exists in the phonebook`,
    });
  }

  person.id = generateId();
  persons = persons.concat(person);
  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
