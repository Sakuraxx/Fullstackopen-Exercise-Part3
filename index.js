require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(cors());

app.use(express.static('dist'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.requestBody = req.body;
  next();
});

morgan.token('body', (req) => {
  return req.requestBody ? JSON.stringify(req.requestBody) : 'No body';
});

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(
  morgan(':method :url :status :response-time ms :body', {
    stream: accessLogStream,
  })
);

app.get('/api/persons', (request, response) => {
  Person.find({}).then((note) => {
    response.json(note);
  });
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      console.error(error);
      response
        .status(500)
        .send({ error: 'An error occurred while fetching person' });
    });
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        response.status(204).end(); // Successfully deleted, no content
      } else {
        response.status(404).send({ error: 'Person not found' });
      }
    })
    .catch((error) => {
      console.error(error);
      response
        .status(500)
        .send({ error: 'An error occurred while deleting person' });
    });
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/info', (request, response) => {
  response.set('Content-Type', 'text/html');

  Person.find({})
    .then((persons) => {
      const text = `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>Request received at: ${request.requestTime}</p>
      `;
      response.send(text);
    })
    .catch((error) => {
      console.error(error);
      response
        .status(500)
        .send({ error: 'An error occurred while fetching person info' });
    });
});

app.post('/api/persons', (request, response) => {
  const personNeedtoBeSaved = request.body;

  if (
    !personNeedtoBeSaved ||
    !personNeedtoBeSaved.name ||
    !personNeedtoBeSaved.number
  ) {
    return response.status(400).json({
      error: 'The name or number is missing',
    });
  }

  const person = new Person({
    name: personNeedtoBeSaved.name,
    number: personNeedtoBeSaved.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson);
    })
    .catch((error) => {
      console.error(error);
      response
        .status(500)
        .json({ error: 'An error occurred while saving person' });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
