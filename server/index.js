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

function generateUser(name){
  return  {
    id: faker.random.uuid(),
    name: name || faker.internet.userName(),
    avatarUrl: faker.image.avatar()
  }
}

let latest = [];
let initialMessages = db.messages.slice();

server.get('/messages/latest', (req, res) => {
  res.json(latest);
  latest = [];
});

server.get('/messages/addRandom', (req, res) => {
  const message = generateMessage();
  latest.push(message);
  db.messages.push(message);
  res.json(message);
});

server.get('/reset', (req, res) => {
  latest = [];
  db.messages = [];
  res.json({message: 'ok'});
});

server.post('/user/login', (req, res) => {
  let user = db.users.find(user => user.name.toLowerCase() === req.body.name.toLowerCase());
  if(!user){
    user = generateUser(req.body.name);
    db.users.push(user);
  }
  res.json(user);
});

// server.use((req, res, next) => {
//   if (req.method === 'POST') {
//     req.body = createMessage(req.body.text);
//   }
//   next();
// });
server.use(middlewares)
server.use(router)
server.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('JSON Server is running')
})