const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const faker = require("faker");
const server = jsonServer.create()
const db = require("./db.js")();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

const {generate} = require('short-id');


function createMessage(text){
  return {
    text,
    user: {
      ...db.user
    },
    date: (new Date()).toISOString()
  }
}

function generateMessage(){
  return {
    id: faker.random.uuid(),
    text: faker.lorem.sentence(faker.random.number({min: 2, max: 14})),
    user: db.users[faker.random.number(db.users.length-1)],
    date: faker.date.recent(10)
  }
}

let latest = [];
let initialMessages = db.messages.slice();

setInterval(() => {
  const message = generateMessage();
  latest.push(message);
  db.messages.push(message);
}, 30000);

// Resets messages every 10 mmiutes.
setInterval(() => {
  const message = generateMessage();
  latest = [];
  db.messages = initialMessages;
}, 600000);


server.get('/messages/latest', (req, res) => {
  res.json(latest);
  latest = [];
});

server.get('/reset', (req, res) => {
  latest = [];
  db.messages = [];
  res.json({message: 'ok'});
});

server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body = createMessage(req.body.text);
  }
  next();
});
server.use(middlewares)
server.use(router)
server.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('JSON Server is running')
})