module.exports = function dbGenerator() {
  const faker = require("faker");
  function randomVersion() {
    return [
      faker.random.number(3),
      faker.random.number(3),
      faker.random.number(3)
    ].join(".");
  }
  const users = Array(10)
      .fill()
      .map((d, i) => {
        return {
          id: faker.random.uuid(),
          name: faker.internet.userName(),
          avatarUrl: faker.image.avatar()
        };
      });
  return {
    users: users,
    messages: Array(20)
      .fill()
      .map((d, i) => {
        return {
          id: faker.random.uuid(),
          text: faker.lorem.sentence(faker.random.number({min: 2, max: 14})),
          user: users[faker.random.number(9)],
          date: faker.date.recent(10)
        };
      }).sort((a, b) => new Date(a.date) - new Date(b.date)),
    user: {
      id: faker.random.uuid(),
      name: faker.internet.userName(),
      avatarUrl: faker.image.avatar()
    },
    latest: []
  }
};
