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

// server.use((req, res, next) => {
//  if (req.body.name.length > 2) {
//    next();
//  } else {
//    res.sendStatus(401);
//  }
// })

// const user = {
//   id: faker.random.uuid(),
//   "avatarUrl": "https://randomuser.me/api/portraits/women/65.jpg",
//   namm: "Jane Wright"
// }

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

setInterval(() => {
  const message = generateMessage();
  latest.push(message);
  db.messages.push(message);
}, 30000);

server.get('/messages/latest', (req, res) => {
  res.json(latest);
  latest = [];
});

server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body = createMessage(req.body.text);
  }
  next();
});
server.use(middlewares)
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})