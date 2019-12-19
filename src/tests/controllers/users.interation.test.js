const supertest = require("supertest");
const mongoose = require("mongoose");
const User = require("../../models/User");
const testHelper = require("../testHelper");
const app = require("../../app");
const api = supertest(app);

describe("Users IntegrationTests", () => {
  beforeEach(async () => {
    const user = new User({
      username: "root",
      password: "sekret"
    });

    await User.deleteMany({});
    await user.save();
    await Promise.all(
      testHelper.initialUsers.map(initialUser => {
        const userObject = new User(initialUser);

        return userObject.save();
      })
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
    mongoose.connection.close();
  });
  describe("when there is initially one user at db", () => {
    test("creation succeeds with a fresh username", async () => {
      const usersAtStart = await testHelper.usersInDb();

      const newUser = {
        username: "mluukkai",
        name: "Matti Luukkainen",
        password: "salainen"
      };

      await api
        .post("/api/users")
        .send(newUser)
        .expect(200)
        .expect("Content-Type", /application\/json/u);

      const usersAtEnd = await testHelper.usersInDb();

      expect(usersAtEnd.length).toBe(usersAtStart.length + 1);

      const userNames = usersAtEnd.map(u => u.username);

      expect(userNames).toContain(newUser.username);
    });
  });

  describe("GET /api/users", () => {
    test("get initial user names", async () => {
      const response = await api
        .get("/api/users")
        .expect(200)
        .expect("Content-Type", /application\/json/u);

      const existingUsers = await testHelper.usersInDb();

      expect(response.body).toEqual(expect.arrayContaining(existingUsers));
    });
  });
});
